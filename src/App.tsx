import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DmsProvider } from './contexts/DmsContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { EvidencePage } from './pages/EvidencePage';
import { EvidenceDetailPage } from './pages/EvidenceDetailPage';
import { EvidenceChainPage } from './pages/EvidenceChainPage';
import { TimelinePage } from './pages/TimelinePage';
import { RelationshipGraphPage } from './pages/RelationshipGraphPage';
import { IntegrityLabPage } from './pages/IntegrityLabPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SecurityPage } from './pages/SecurityPage';
import { AccessRequestsPage } from './pages/AccessRequestsPage';
import { SignaturesPage } from './pages/SignaturesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SearchPage } from './pages/SearchPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { GuidePage } from './pages/GuidePage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <DmsProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Screen */}
          <Route path="/login" element={<LoginPage />} />

          {/* Secure Enclave Layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/evidence/:id" element={<EvidenceDetailPage />} />
            <Route path="/evidence-chain" element={<EvidenceChainPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/graph" element={<RelationshipGraphPage />} />
            <Route path="/integrity-lab" element={<IntegrityLabPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/access-requests" element={<AccessRequestsPage />} />
            <Route path="/signatures" element={<SignaturesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/guide" element={<GuidePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </DmsProvider>
  );
}
