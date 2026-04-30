// src/components/EmployeeModal.jsx
import React, { useState, useEffect } from 'react';
import { employeeService } from '../services/employeeService';

const EmployeeModal = ({ employeeId, onClose }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const data = await employeeService.getEmployeeById(employeeId);
        setEmployee(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  const formatBalance = (value) => {
    return value !== undefined && value !== null ? value : '—';
  };

  // Styles (vanilla CSS, black & white theme)
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%',
      maxWidth: '720px',
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      lineHeight: 1,
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0.25rem',
      transition: 'color 0.2s'
    },
    content: {
      padding: '1.5rem',
      overflowY: 'auto',
      flex: 1
    },
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#4b5563',
      marginBottom: '1rem',
      borderLeft: '3px solid #111827',
      paddingLeft: '0.75rem'
    },
    grid2Col: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    infoItem: {
      borderBottom: '1px solid #f0f2f5',
      paddingBottom: '0.5rem'
    },
    infoLabel: {
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    infoValue: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#111827'
    },
    balanceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem',
      marginTop: '0.5rem'
    },
    balanceCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '10px',
      padding: '0.75rem',
      border: '1px solid #eef2f6',
      transition: 'all 0.2s ease'
    },
    balanceLabel: {
      fontSize: '0.7rem',
      fontWeight: '500',
      color: '#4b5563',
      marginBottom: '0.25rem'
    },
    balanceValue: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#111827',
      lineHeight: 1.2
    },
    balanceUnit: {
      fontSize: '0.7rem',
      fontWeight: '400',
      color: '#6b7280',
      marginLeft: '0.25rem'
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '1rem 1.5rem',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#fefefe'
    },
    closeFooterButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  const cssGlobals = `
    .employee-modal-close-btn:hover { color: #111827; }
    .employee-modal-balance-card:hover { background-color: #fefefe; border-color: #d1d5db; transform: translateY(-1px); }
    .employee-modal-footer-btn:hover { background-color: #e5e7eb; border-color: #9ca3af; }
    .employee-modal-content::-webkit-scrollbar { width: 6px; }
    .employee-modal-content::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
    .employee-modal-content::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
  `;

  return (
    <>
      <style>{cssGlobals}</style>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>Employee Details</h2>
            <button
              onClick={onClose}
              style={styles.closeButton}
              className="employee-modal-close-btn"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div style={styles.content} className="employee-modal-content">
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Loading employee details...
              </div>
            )}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                Error: {error}
              </div>
            )}
            {employee && (
              <>
                {/* Personal Information */}
                <div style={styles.sectionTitle}>Personal Information</div>
                <div style={styles.grid2Col}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Full Name</div>
                    <div style={styles.infoValue}>{employee.name}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{employee.email}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Gender</div>
                    <div style={styles.infoValue}>{employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : '—'}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Job Title</div>
                    <div style={styles.infoValue}>{employee.job_title || '—'}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Department</div>
                    <div style={styles.infoValue}>{employee.department || '—'}</div>
                  </div>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Hire Date</div>
                    <div style={styles.infoValue}>
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>

                {/* Leave Balances */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={styles.sectionTitle}>Leave Balances</div>
                  <div style={styles.balanceGrid}>
                    <div style={styles.balanceCard} className="employee-modal-balance-card">
                      <div style={styles.balanceLabel}>Annual</div>
                      <div style={styles.balanceValue}>
                        {formatBalance(employee.balance_annual)}<span style={styles.balanceUnit}>days</span>
                      </div>
                    </div>
                    <div style={styles.balanceCard} className="employee-modal-balance-card">
                      <div style={styles.balanceLabel}>Sick</div>
                      <div style={styles.balanceValue}>
                        {formatBalance(employee.balance_sick)}<span style={styles.balanceUnit}>days</span>
                      </div>
                    </div>
                    <div style={styles.balanceCard} className="employee-modal-balance-card">
                      <div style={styles.balanceLabel}>Maternity</div>
                      <div style={styles.balanceValue}>
                        {formatBalance(employee.balance_maternity)}<span style={styles.balanceUnit}>days</span>
                      </div>
                    </div>
                    <div style={styles.balanceCard} className="employee-modal-balance-card">
                      <div style={styles.balanceLabel}>Paternity</div>
                      <div style={styles.balanceValue}>
                        {formatBalance(employee.balance_paternity)}<span style={styles.balanceUnit}>days</span>
                      </div>
                    </div>
                    <div style={styles.balanceCard} className="employee-modal-balance-card">
                      <div style={styles.balanceLabel}>Compassionate</div>
                      <div style={styles.balanceValue}>
                        {formatBalance(employee.balance_compassionate)}<span style={styles.balanceUnit}>days</span>
                      </div>
                    </div>
                    <div style={styles.balanceCard} className="employee-modal-balance-card">
                      <div style={styles.balanceLabel}>Study</div>
                      <div style={styles.balanceValue}>
                        {formatBalance(employee.balance_study)}<span style={styles.balanceUnit}>days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={styles.footer}>
            <button
              onClick={onClose}
              style={styles.closeFooterButton}
              className="employee-modal-footer-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeModal;