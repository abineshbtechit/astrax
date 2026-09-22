import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;
let lastFailedTime = 0;
let lastError: string | null = null;
let currentCustomUri: string | null = null;

const RECONNECT_COOLDOWN_MS = 60000; // 60 seconds cooldown after a failed connection

function isPlaceholderUri(uri: string): boolean {
  if (!uri) return true;
  const lower = uri.toLowerCase();
  return (
    lower.includes('<db_password>') ||
    lower.includes('<password>') ||
    lower.includes('cluster0.investigations.mongodb.net') ||
    lower.includes('secretpassword123') ||
    lower.includes('example.com') ||
    lower.includes('your-cluster')
  );
}

export function sanitizeMongoUri(uri: string): string {
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) return uri;
  const prefix = uri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
  const rest = uri.slice(prefix.length);
  const lastAtIdx = rest.lastIndexOf('@');
  if (lastAtIdx === -1) return uri;
  const creds = rest.slice(0, lastAtIdx);
  const hostAndOptions = rest.slice(lastAtIdx + 1);
  const colonIdx = creds.indexOf(':');
  if (colonIdx === -1) return uri;
  const user = creds.slice(0, colonIdx);
  let pass = creds.slice(colonIdx + 1);
  try {
    pass = decodeURIComponent(pass);
  } catch {}
  return `${prefix}${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${hostAndOptions}`;
}

export type DatabaseProvider = 'AZURE_COSMOS_DB' | 'MONGODB_ATLAS' | 'GENERIC_MONGODB';

export function detectProvider(uri: string): DatabaseProvider {
  if (!uri) return 'GENERIC_MONGODB';
  const lower = uri.toLowerCase();
  if (lower.includes('cosmos.azure.com') || lower.includes('documents.azure.com')) {
    return 'AZURE_COSMOS_DB';
  }
  if (lower.includes('mongodb.net')) {
    return 'MONGODB_ATLAS';
  }
  return 'GENERIC_MONGODB';
}

export function getProviderDisplayName(provider: DatabaseProvider): string {
  switch (provider) {
    case 'AZURE_COSMOS_DB':
      return 'Azure Cosmos DB for MongoDB';
    case 'MONGODB_ATLAS':
      return 'MongoDB Atlas';
    default:
      return 'MongoDB';
  }
}

export async function getDb(): Promise<Db | null> {
  if (db) return db;
  if (isConnecting) return null;

  const rawUri = currentCustomUri || process.env.MONGODB_URI || '';
  if (!rawUri || isPlaceholderUri(rawUri)) {
    // Graceful fallback to resilient in-memory / local enclave storage
    lastError = 'Database cluster URI is not configured or contains placeholder credentials.';
    return null;
  }

  const uri = sanitizeMongoUri(rawUri);
  const provider = detectProvider(rawUri);
  const providerLabel = getProviderDisplayName(provider);
  const isAzure = provider === 'AZURE_COSMOS_DB';

  // Prevent repeated connection hammering if recently failed
  const now = Date.now();
  if (now - lastFailedTime < RECONNECT_COOLDOWN_MS) {
    return null;
  }

  try {
    isConnecting = true;
    console.log(`[Database] Connecting to ${providerLabel} cluster...`);
    
    // Create new client with safe connection timeouts (Azure Cosmos DB vCore benefits from 15s handshake allowance)
    const newClient = new MongoClient(uri, {
      connectTimeoutMS: isAzure ? 15000 : 8000,
      serverSelectionTimeoutMS: isAzure ? 15000 : 8000,
    });

    await newClient.connect();
    client = newClient;
    const dbName = process.env.MONGODB_DATABASE || 'ncrb_legal_dms';
    db = client.db(dbName);
    lastError = null;
    console.log(`[Database] Connected successfully to ${providerLabel} database: ${dbName}`);
    return db;
  } catch (err: any) {
    // Record diagnostic and back off without crashing or logging fatal errors
    lastFailedTime = Date.now();
    const rawMsg = err.message || 'Connection failed';
    
    if (rawMsg.includes('Server selection timed out') || rawMsg.includes('timed out')) {
      if (isAzure) {
        lastError =
          'Azure Cosmos DB connection timed out (Azure Firewall Block). In Azure Portal -> your Cosmos DB cluster -> "Networking" / "Firewall" -> click "Add current client IP address" (or allow 0.0.0.0 - 255.255.255.255) and enable "Allow access from Azure services".';
      } else {
        lastError =
          'MongoDB cluster connection timed out. In MongoDB Atlas, go to "Network Access" -> click "Add IP Address" -> choose "Allow Access from Anywhere" (0.0.0.0/0).';
      }
    } else if (rawMsg.includes('alert number 80') || rawMsg.includes('SSL routines') || rawMsg.includes('tlsv1 alert')) {
      if (isAzure) {
        lastError = 'Azure Cosmos DB rejected connection (TLS/SSL Block). Ensure SSL/TLS is enabled and client IP is whitelisted in Azure Portal.';
      } else {
        lastError = 'MongoDB Atlas rejected connection (SSL Alert 80: IP Whitelist Block). In MongoDB Atlas, go to "Network Access" -> click "Add IP Address" -> choose "Allow Access from Anywhere" (0.0.0.0/0).';
      }
    } else if (rawMsg.includes('Authentication failed') || rawMsg.includes('SCRAM')) {
      lastError = `Authentication failed on ${providerLabel}. Please verify your username and password in .env.`;
    } else {
      lastError = rawMsg;
    }
    
    console.warn(
      `[Database] ${providerLabel} notice: ${lastError}. Seamlessly operating in resilient Enclave Local Storage mode.`
    );

    if (client) {
      try {
        await client.close();
      } catch {
        // ignore close error
      }
      client = null;
    }
    db = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

export function isDbConnected(): boolean {
  return db !== null;
}

export function setCustomMongoUri(newUri: string): void {
  currentCustomUri = newUri.trim();
  lastFailedTime = 0; // reset cooldown to allow immediate test
  db = null;
  if (client) {
    client.close().catch(() => {});
    client = null;
  }
}

export function getDbDiagnostics() {
  const uri = currentCustomUri || process.env.MONGODB_URI || '';
  const isPlaceholder = isPlaceholderUri(uri);
  const provider = detectProvider(uri);
  const providerLabel = getProviderDisplayName(provider);
  
  return {
    connected: db !== null,
    provider,
    providerLabel,
    mode: db !== null
      ? (provider === 'AZURE_COSMOS_DB' ? 'AZURE_COSMOS_DB_CLOUD' : 'MONGODB_ATLAS_CLOUD')
      : 'ENCLAVE_LOCAL_STORAGE',
    database: process.env.MONGODB_DATABASE || 'ncrb_legal_dms',
    isConfigured: !isPlaceholder,
    configuredUri: uri
      ? uri.replace(/:([^@]+)@/, ':****@')
      : 'NOT_CONFIGURED',
    rawConfiguredUri: uri,
    lastError: lastError,
    reconnectCooldownActive: Date.now() - lastFailedTime < RECONNECT_COOLDOWN_MS,
  };
}
