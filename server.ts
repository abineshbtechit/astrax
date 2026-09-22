import express from 'express';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getDb, isDbConnected, getDbDiagnostics, setCustomMongoUri } from './server/db.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Database Status & Diagnostics
app.get('/api/health', async (req, res) => {
  const db = await getDb();
  const diag = getDbDiagnostics();
  res.json({
    status: 'ok',
    service: 'AstraX Secure Legal & Evidentiary DMS Backend',
    mongoConnected: isDbConnected(),
    provider: diag.provider,
    providerLabel: diag.providerLabel,
    database: diag.database,
    configuredUri: diag.configuredUri,
    rawConfiguredUri: diag.rawConfiguredUri,
    mode: diag.mode,
    isConfigured: diag.isConfigured,
    message: isDbConnected()
      ? `Connected to ${diag.providerLabel} (${diag.database})`
      : (diag.lastError || 'Operating in high-security Enclave Local Storage mode with SHA-256 seal verification.'),
    lastError: diag.lastError,
  });
});

// Test or update MongoDB connection URI dynamically
app.post('/api/mongodb/test', async (req, res) => {
  try {
    const { uri } = req.body;
    if (uri) {
      setCustomMongoUri(uri);
    }
    const db = await getDb();
    const diag = getDbDiagnostics();
    if (db) {
      res.json({
        success: true,
        connected: true,
        provider: diag.provider,
        providerLabel: diag.providerLabel,
        message: `Connected to ${diag.providerLabel} (${diag.database})`,
      });
    } else {
      res.json({
        success: false,
        connected: false,
        provider: diag.provider,
        providerLabel: diag.providerLabel,
        message: diag.lastError || `Unable to connect to ${diag.providerLabel} cluster. Check password and network firewall settings.`,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cases Endpoints
app.get('/api/cases', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({ connected: false, message: 'MongoDB not connected', data: [] });
    }
    const cases = await db.collection('cases').find({}).sort({ updatedAt: -1 }).toArray();
    res.json({ connected: true, data: cases });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const newCase = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection('cases').insertOne(newCase);
    res.status(201).json({ success: true, insertedId: result.insertedId, case: newCase });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cases/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection('cases').updateOne({ id }, { $set: updates });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Documents Endpoints
app.get('/api/documents', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({ connected: false, message: 'MongoDB not connected', data: [] });
    }
    const docs = await db.collection('documents').find({}).sort({ updatedAt: -1 }).toArray();
    res.json({ connected: true, data: docs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const newDoc = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection('documents').insertOne(newDoc);
    res.status(201).json({ success: true, insertedId: result.insertedId, document: newDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Evidence Endpoints
app.get('/api/evidence', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({ connected: false, message: 'MongoDB not connected', data: [] });
    }
    const evidence = await db.collection('evidence').find({}).sort({ collectedAt: -1 }).toArray();
    res.json({ connected: true, data: evidence });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/evidence', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const item = { ...req.body, createdAt: new Date().toISOString() };
    const result = await db.collection('evidence').insertOne(item);
    res.status(201).json({ success: true, insertedId: result.insertedId, evidence: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Logs Endpoints
app.get('/api/audit-logs', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({ connected: false, message: 'MongoDB not connected', data: [] });
    }
    const logs = await db.collection('audit_logs').find({}).sort({ sequenceNumber: -1 }).toArray();
    res.json({ connected: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const log = { ...req.body, timestamp: req.body.timestamp || new Date().toISOString() };
    await db.collection('audit_logs').insertOne(log);
    res.status(201).json({ success: true, log });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Access Requests Endpoints
app.get('/api/access-requests', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({ connected: false, message: 'MongoDB not connected', data: [] });
    }
    const requests = await db.collection('access_requests').find({}).sort({ requestedAt: -1 }).toArray();
    res.json({ connected: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/access-requests', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const item = {
      ...req.body,
      id: req.body.id || `REQ-${Date.now()}`,
      status: req.body.status || 'PENDING',
      requestedAt: req.body.requestedAt || new Date().toISOString(),
    };
    await db.collection('access_requests').insertOne(item);
    res.status(201).json({ success: true, request: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/access-requests/:id/status', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const { id } = req.params;
    const { status, reviewerComment, reviewedBy } = req.body;
    await db.collection('access_requests').updateOne(
      { id },
      { $set: { status, reviewerComment, reviewedBy, reviewedAt: new Date().toISOString() } }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Document Versioning Endpoint
app.post('/api/documents/:id/version', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const { id } = req.params;
    const { currentVersion, fileContent, sha256Hash, versions } = req.body;
    await db.collection('documents').updateOne(
      { id },
      {
        $set: {
          currentVersion,
          fileContent,
          sha256Hash,
          versions,
          updatedAt: new Date().toISOString(),
        },
      }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Evidence Transfer Endpoint
app.post('/api/evidence/:id/transfer', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }
    const { id } = req.params;
    const { chainOfCustody, currentCustodianId, currentCustodianName, currentDepartment } = req.body;
    await db.collection('evidence').updateOne(
      { id },
      {
        $set: {
          chainOfCustody,
          currentCustodianId,
          currentCustodianName,
          currentDepartment,
          updatedAt: new Date().toISOString(),
        },
      }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Initial Data into MongoDB
app.post('/api/seed', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'MongoDB cluster is not connected' });
    }

    const { cases, documents, evidence, auditLogs, accessRequests, securityAlerts, users } = req.body;

    if (cases && cases.length > 0) {
      await db.collection('cases').deleteMany({});
      await db.collection('cases').insertMany(cases);
    }
    if (documents && documents.length > 0) {
      await db.collection('documents').deleteMany({});
      await db.collection('documents').insertMany(documents);
    }
    if (evidence && evidence.length > 0) {
      await db.collection('evidence').deleteMany({});
      await db.collection('evidence').insertMany(evidence);
    }
    if (auditLogs && auditLogs.length > 0) {
      await db.collection('audit_logs').deleteMany({});
      await db.collection('audit_logs').insertMany(auditLogs);
    }
    if (accessRequests && accessRequests.length > 0) {
      await db.collection('access_requests').deleteMany({});
      await db.collection('access_requests').insertMany(accessRequests);
    }
    if (securityAlerts && securityAlerts.length > 0) {
      await db.collection('security_alerts').deleteMany({});
      await db.collection('security_alerts').insertMany(securityAlerts);
    }
    if (users && users.length > 0) {
      await db.collection('users').deleteMany({});
      await db.collection('users').insertMany(users);
    }

    res.json({ success: true, message: 'Database successfully seeded with legal investigation records.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Azure AI Agent Endpoints (Azure AI Foundry gpt-5-mini & hungry-agent)
app.get('/api/ai/status', (req, res) => {
  res.json({
    status: 'ok',
    modelName: process.env.AZURE_AI_MODEL || 'gpt-5-mini',
    agentName: process.env.AZURE_AI_AGENT_NAME || 'gpt-5-mini',
    agentVersion: process.env.AZURE_AI_AGENT_VERSION || '2025-08-07',
    endpoint: process.env.AZURE_AI_ENDPOINT || 'https://abineshas-6866-resource.services.ai.azure.com/api/projects/abineshas-6866',
    hasApiKey: Boolean(process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY),
  });
});

app.post('/api/ai/configure', (req, res) => {
  const { apiKey } = req.body;
  if (apiKey) {
    process.env.AZURE_AI_API_KEY = apiKey.trim();
  }
  res.json({
    success: true,
    hasApiKey: Boolean(process.env.AZURE_AI_API_KEY),
    message: 'Azure AI API Key updated in server session',
  });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const inputData = {
      ...req.body,
      apiKey: req.body.apiKey || process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY || '',
    };

    const pythonScript = path.join(process.cwd(), 'server', 'azure_ai_agent.py');
    const child = spawn('python', [pythonScript]);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      try {
        if (!stdoutData.trim()) {
          return res.status(500).json({
            error: 'Empty response from Azure AI agent bridge',
            details: stderrData,
          });
        }
        const jsonRes = JSON.parse(stdoutData.trim());
        res.json(jsonRes);
      } catch (err: any) {
        res.status(500).json({
          error: 'Failed to parse Azure AI response',
          rawOutput: stdoutData,
          stderr: stderrData,
        });
      }
    });

    child.stdin.write(JSON.stringify(inputData));
    child.stdin.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/extract-pdf', async (req, res) => {
  try {
    const { pdfBase64, filename } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing pdfBase64 data' });
    }

    const pythonScript = path.join(process.cwd(), 'server', 'azure_ai_agent.py');
    const child = spawn('python', [pythonScript]);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      try {
        const jsonRes = JSON.parse(stdoutData.trim());
        res.json(jsonRes);
      } catch (err: any) {
        res.status(500).json({
          error: 'Failed to parse PDF extract output',
          rawOutput: stdoutData,
          stderr: stderrData,
        });
      }
    });

    child.stdin.write(JSON.stringify({ mode: 'extract_pdf', pdfBase64, filename }));
    child.stdin.end();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Configure Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AstraX Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
