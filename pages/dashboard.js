import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TopBar from '../components/TopBar';

// Dynamically import components to avoid SSR issues
const MemberAdmission = dynamic(() => import('../components/MemberAdmission'), { ssr: false });
const PendingPayments = dynamic(() => import('../components/PendingPayments'), { ssr: false });
const MemberList = dynamic(() => import('../components/MemberList'), { ssr: false });
const DiscontinuedMembers = dynamic(() => import('../components/DiscontinuedMembers'), { ssr: false });

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  useEffect(() => {
    const handleDemoMode = () => setShowDemoBanner(true);
    window.addEventListener('apiDemoMode', handleDemoMode);
    return () => window.removeEventListener('apiDemoMode', handleDemoMode);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container">
      <TopBar />
      {showDemoBanner && (
        <div className="demo-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Demo mode — showing sample data. Connect MongoDB in .env.local to save changes.</span>
        </div>
      )}

      <div className="hero-header">
        <h1 className="hero-title">🏋️ Iron Temple</h1>
        <p className="hero-subtitle">Premium Gym Management</p>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Payments
        </button>
        <button
          className={`nav-tab ${activeTab === 'admission' ? 'active' : ''}`}
          onClick={() => setActiveTab('admission')}
        >
          Member Admission
        </button>
        <button
          className={`nav-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          All Members
        </button>
        <button
          className={`nav-tab ${activeTab === 'discontinued' ? 'active' : ''}`}
          onClick={() => setActiveTab('discontinued')}
        >
          Discontinued
        </button>
      </div>

      {activeTab === 'pending' && (
        <PendingPayments onPaymentProcessed={handleRefresh} />
      )}

      {activeTab === 'admission' && (
        <MemberAdmission onMemberAdded={handleRefresh} />
      )}

      {activeTab === 'members' && (
        <MemberList refreshTrigger={refreshKey} />
      )}

      {activeTab === 'discontinued' && (
        <DiscontinuedMembers onMemberUpdated={handleRefresh} />
      )}
    </div>
  );
}
