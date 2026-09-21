import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="gov-footer">
      <div className="gov-footer-node">
        <span className="node-pulse" />
        <span>SECURE NODE NCRB-HQ (TN-CLUSTER-01)</span>
      </div>
      <div>
        <span>SHA-256 NIST FIPS 180-4 VERIFIED</span>
        <span style={{ margin: '0 8px', color: '#475569' }}>•</span>
        <span>INDIAN EVIDENCE ACT SECTION 65B(4) COMPLIANT</span>
        <span style={{ margin: '0 8px', color: '#475569' }}>•</span>
        <span>AES-256-GCM ENCRYPTED</span>
      </div>
      <div>
        <span>BUILD v2.4-SECURE-STABLE</span>
      </div>
    </footer>
  );
};
