import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const MemberAdmission = dynamic(() => import('../components/MemberAdmission'), { ssr: false });
const PendingPayments = dynamic(() => import('../components/PendingPayments'), { ssr: false });
const MemberList = dynamic(() => import('../components/MemberList'), { ssr: false });
const DiscontinuedMembers = dynamic(() => import('../components/DiscontinuedMembers'), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container">
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '48px', 
        color: 'white',
        textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(36px, 5vw, 64px)', 
          marginBottom: '16px',
          fontWeight: '800',
          fontFamily: "'Poppins', sans-serif",
          background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 50%, #fff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-1px',
          lineHeight: '1.2'
        }}>
          🏋️ IRON TEMPLE
        </h1>
        <p style={{ 
          fontSize: 'clamp(16px, 2vw, 22px)', 
          opacity: 0.95, 
          fontWeight: '400',
          letterSpacing: '0.3px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Premium Gym Management System
        </p>
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
