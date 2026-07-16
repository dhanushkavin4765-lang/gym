import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MemberLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login?role=member');
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      color: 'var(--text-gray)'
    }}>
      Redirecting to portal...
    </div>
  );
};

export default MemberLogin;
