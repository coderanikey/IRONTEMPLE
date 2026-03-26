import ValidityCheckCard from '../components/ValidityCheckCard';

export default function CheckValidityPage() {
  return (
    <div className="container">
      <div className="hero-header">
        <h1 className="hero-title">Check Membership</h1>
        <p className="hero-subtitle">Free validity check (phone number)</p>
      </div>
      <ValidityCheckCard showFooterLinks />
    </div>
  );
}

