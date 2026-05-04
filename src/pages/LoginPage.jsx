// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!name.trim() || !email.trim()) {
      setError('Please enter both name and email');
      setLoading(false);
      return;
    }
    
    const result = await login(name, email);
    
    if (result.success) {
      navigate('/hr-dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  // Black, white, and teal styles (vanilla CSS)
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'rgba(5, 12, 14, 0.58)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 18px 30px -18px rgba(0, 0, 0, 0.55), 0 8px 24px -16px rgba(18, 179, 166, 0.45)',
      border: '1px solid #c8ebe7',
      width: '100%',
      maxWidth: '440px',
      padding: '2rem'
    },
    iconWrapper: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    iconCircle: {
      width: '64px',
      height: '64px',
      backgroundColor: '#e8f8f6',
      borderRadius: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #8edfd6'
    },
    title: {
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem',
      letterSpacing: '-0.01em'
    },
    subtitle: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#35575b',
      marginBottom: '2rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#4b5563'
    },
    input: {
      width: '90%',
      padding: '0.625rem 0.75rem',
      border: '1px solid #d1d5db',
      backgroundColor: '#fcfffe',
      borderRadius: '10px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      fontFamily: 'inherit'
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '0.75rem',
      borderRadius: '10px',
      fontSize: '0.875rem'
    },
    submitButton: {
      width: '100%',
      padding: '0.625rem 1rem',
      backgroundColor: '#0f766e',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    submitButtonDisabled: {
      backgroundColor: '#6c9e99',
      cursor: 'not-allowed'
    },
    footerNote: {
      marginTop: '1.5rem',
      textAlign: 'center',
      fontSize: '0.7rem',
      color: '#35575b',
      borderTop: '1px solid #d7ece9',
      paddingTop: '1rem'
    }
  };

  const cssGlobals = `
    .login-input:focus {
      outline: none;
      border-color: #0f766e;
      box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.16);
    }
    .login-submit-btn:hover:not(:disabled) {
      background-color: #0b5d56;
    }
  `;

  return (
    <>
      <style>{cssGlobals}</style>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconWrapper}>
            <div style={styles.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h1 style={styles.title}>HR Management Portal</h1>
          <p style={styles.subtitle}>Sign in with your work credentials</p>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                className="login-input"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                className="login-input"
                placeholder="john.doe@company.com"
                required
              />
            </div>
            
            {error && <div style={styles.errorMessage}>{error}</div>}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              className="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div style={styles.footerNote}>
            Only employees with HR job title can access this portal
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
