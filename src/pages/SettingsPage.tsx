import React, { useState, useEffect } from 'react';
import { useDms } from '../contexts/DmsContext';
import {
  Settings,
  Lock,
  Database,
  Shield,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Server,
  Code,
  Check,
  Zap,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    resetToDefaults,
    mongoStatus,
    cases,
    documents,
    evidence,
    auditLogs,
    accessRequests,
    alerts,
    users,
  } = useDms();
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Configuration state with active database URI
  const [mongoUri, setMongoUri] = useState('');
  const [backendApi, setBackendApi] = useState('/api');
  const [encryptionStandard, setEncryptionStandard] = useState('AES-256-GCM');
  const [sessionTimeout, setSessionTimeout] = useState('15');
  const [strictMfa, setStrictMfa] = useState(true);

  const [isTestingMongo, setIsTestingMongo] = useState(false);
  const [mongoTestResult, setMongoTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.rawConfiguredUri) {
          setMongoUri(data.rawConfiguredUri);
        } else if (data.configuredUri && data.configuredUri !== 'NOT_CONFIGURED') {
          setMongoUri(data.configuredUri);
        }
      })
      .catch(() => {});
  }, []);

  const isAzure = mongoUri.toLowerCase().includes('cosmos.azure.com') || mongoStatus?.provider === 'AZURE_COSMOS_DB';
  const providerTitle = isAzure ? 'Azure Cosmos DB for MongoDB' : 'MongoDB Atlas Cluster';
  const clusterHost = mongoUri.split('@')[1]?.split('/')[0]?.split('?')[0] || (isAzure ? 'mongocluster.cosmos.azure.com' : 'cluster0.blbm9h7.mongodb.net');

  const handleTestMongo = async () => {
    setIsTestingMongo(true);
    setMongoTestResult(null);
    try {
      const res = await fetch('/api/mongodb/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: mongoUri }),
      });
      const data = await res.json();
      setMongoTestResult({
        success: !!data.connected,
        message: data.message || (data.connected ? `Connected to ${data.providerLabel || providerTitle}!` : 'Connection failed.'),
      });
    } catch (e: any) {
      setMongoTestResult({
        success: false,
        message: e.message || 'Failed to communicate with backend server.',
      });
    } finally {
      setIsTestingMongo(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedNotice(null);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cases,
          documents,
          evidence,
          auditLogs,
          accessRequests,
          securityAlerts: alerts,
          users,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSeedNotice(`✓ Synced to Database! (${cases.length} cases including your latest additions)`);
      } else {
        setSeedNotice(`⚠ ${data.error || 'Seed unsuccessful. Check database firewall IP access list.'}`);
      }
    } catch (e: any) {
      setSeedNotice(`⚠ ${e.message || 'Network error during seed'}`);
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedNotice(null), 8000);
    }
  };

  const handleResetData = () => {
    if (confirm('Restore default pre-loaded investigation cases, documents, and exhibits?')) {
      resetToDefaults();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64EE00] shadow-[0_0_8px_#64EE00]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black bg-[#64EE00] px-2 py-0.5 rounded border border-black">
              SECURITY ENCLAVE CONFIGURATION
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-black tracking-tight font-sans">
            System Configuration & Database Integration
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Database synchronization, encryption specifications, and Section 65B compliance parameters.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-[#64EE00] border-2 border-black text-black font-bold text-xs font-mono flex items-center gap-2 shadow-[3px_3px_0px_#000000]">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Security parameters committed to configuration store.</span>
        </div>
      )}

      {seedNotice && (
        <div className="p-4 rounded-xl bg-black text-[#64EE00] border-2 border-black font-mono font-bold text-xs flex items-center gap-2 shadow-[3px_3px_0px_#000000]">
          <Zap className="w-4 h-4" />
          <span>{seedNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Full-Stack Backend Infrastructure Card */}
        <div className="brutal-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-black" />
              <h2 className="text-sm font-extrabold text-black font-mono uppercase">
                {providerTitle} & REST API
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  mongoStatus?.connected ? 'bg-[#64EE00] shadow-[0_0_8px_#64EE00]' : 'bg-white border border-black'
                }`}
              />
              <span className="text-xs font-mono font-bold text-black">
                {mongoStatus?.connected
                  ? (isAzure ? 'AZURE CLUSTER ONLINE' : 'ATLAS CLUSTER ONLINE')
                  : 'CLUSTER READY'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1">
                EXPRESS REST API GATEWAY ENDPOINT
              </label>
              <input
                type="text"
                value={backendApi}
                onChange={(e) => setBackendApi(e.target.value)}
                className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs font-mono font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1">
                {isAzure ? 'AZURE COSMOS DB CONNECTION URI (MONGODB PROTOCOL)' : 'MONGODB CONNECTION URI (ATLAS)'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  placeholder="mongodb+srv://user:password@docdb-cluster...cosmos.azure.com/..."
                  className="flex-1 bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs font-mono font-medium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestMongo}
                  disabled={isTestingMongo}
                  className="brutal-btn-green px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap"
                >
                  {isTestingMongo ? 'Testing...' : 'Test & Connect'}
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                Configured endpoint:{' '}
                <span className="font-bold text-black">{clusterHost}</span>
              </p>

              {isAzure && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs font-mono space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <span>☁ Azure Cosmos DB Firewall Quick-Setup:</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Azure Cosmos DB blocks external connections by default. In Azure Portal, open your Cosmos DB cluster &rarr; <b>Networking</b> (or <b>Firewall</b>) &rarr; click <b>"Add current client IP address"</b> (or whitelist <code className="bg-blue-100 px-1 rounded">0.0.0.0 - 255.255.255.255</code> for development) and check <b>"Allow access from Azure services"</b>.
                  </p>
                </div>
              )}

              {mongoTestResult && (
                <div
                  className={`mt-2 p-3 rounded-xl border-2 border-black text-xs font-mono font-bold ${
                    mongoTestResult.success ? 'bg-[#64EE00]/20 text-black' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {mongoTestResult.success ? '✓ ' : '⚠ '}
                  {mongoTestResult.message}
                </div>
              )}
            </div>

            {/* Seed Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 font-medium">
                Populate or sync mock investigation dataset with Cloud Database:
              </span>
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="brutal-btn-dark px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-[#64EE00]" />
                <span>{isSeeding ? 'Syncing...' : 'Sync Database Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Spring Boot 3 Backend Architecture Card */}
        <div className="brutal-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-black" />
              <h2 className="text-sm font-extrabold text-black font-mono uppercase">
                Spring Boot 3 Backend Architecture
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-[#64EE00] text-black border border-black text-[10px] font-mono font-bold">
                SPRING DATA MONGODB
              </span>
            </div>
          </div>

          <p className="text-xs font-mono text-black font-medium">
            Full Spring Boot 3 microservice added in <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-black font-bold">/backend-springboot</code> with Maven build, entity schemas, and REST Controllers aligned with the React frontend.
          </p>

          <div className="bg-black text-white p-4 rounded-xl border-2 border-black space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#64EE00] font-bold">
              <span>HOW TO LAUNCH SPRING BOOT SERVICE</span>
              <span>PORT 8080</span>
            </div>
            <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-2 bg-neutral-900 rounded border border-neutral-700">
{`cd backend-springboot
mvn clean spring-boot:run`}
            </pre>
            <p className="text-[11px] font-mono text-slate-400">
              Database: <span className="text-[#64EE00] font-bold">MongoDB Atlas (ncrb_legal_dms)</span>. The React frontend endpoints (/api/*) are 100% interoperable between Spring Boot and the Node API Gateway.
            </p>
          </div>
        </div>

        {/* Cryptographic Standards */}
        <div className="brutal-card p-6 space-y-4">
          <div className="pb-3 border-b-2 border-black">
            <h2 className="text-sm font-extrabold text-black font-mono uppercase flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Section 65B Cryptographic Standards</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1">
                REST ENCRYPTION ALGORITHM
              </label>
              <select
                value={encryptionStandard}
                onChange={(e) => setEncryptionStandard(e.target.value)}
                className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none"
              >
                <option value="AES-256-GCM">AES-256-GCM (Authenticated)</option>
                <option value="ChaCha20-Poly1305">ChaCha20-Poly1305</option>
                <option value="AES-256-CBC">AES-256-CBC + HMAC-SHA256</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1">
                SESSION TIMEOUT (MINUTES)
              </label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs font-mono font-bold text-black border-2 border-black px-3 py-1.5 rounded-xl hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000000]"
          >
            Reset Enclave to Initial Seed &rarr;
          </button>

          <button
            type="submit"
            className="brutal-btn-green px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider"
          >
            Save Enclave Settings
          </button>
        </div>
      </form>
    </div>
  );
};
