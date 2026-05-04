// src/components/DecisionModal.jsx
import React, { useState } from 'react';
import { requestService } from '../services/requestService';
import { employeeService } from '../services/employeeService';
import { useAuth } from '../contexts/AuthContext';

const DecisionModal = ({ request, onClose, onDecisionComplete }) => {
  const { user } = useAuth();
  const [decision, setDecision] = useState('APPROVED');
  const [daysApproved, setDaysApproved] = useState(request.days_requested);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balanceCheck, setBalanceCheck] = useState(null);

  const leaveTypeLabels = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
    compassionate: 'Compassionate Leave',
    study: 'Study Leave'
  };

  const checkBalance = async () => {
    if (decision !== 'APPROVED') return true;
    
    try {
      const employee = await employeeService.getEmployeeById(request.employee_id);
      const balanceMap = {
        annual: employee.balance_annual,
        sick: employee.balance_sick,
        maternity: employee.balance_maternity,
        paternity: employee.balance_paternity,
        compassionate: employee.balance_compassionate,
        study: employee.balance_study
      };
      
      const availableBalance = balanceMap[request.leave_type];
      if (availableBalance < daysApproved) {
        setBalanceCheck({
          sufficient: false,
          available: availableBalance,
          requested: daysApproved
        });
        return false;
      }
      setBalanceCheck({ sufficient: true, available: availableBalance });
      return true;
    } catch (err) {
      setError('Failed to check balance: ' + err.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (decision === 'APPROVED' && daysApproved <= 0) {
      setError('Days approved must be greater than 0');
      setLoading(false);
      return;
    }
    
    if (decision === 'APPROVED' && daysApproved > request.days_requested) {
      setError(`Days approved cannot exceed requested days (${request.days_requested})`);
      setLoading(false);
      return;
    }
    
    if (decision === 'APPROVED') {
      const hasSufficientBalance = await checkBalance();
      if (!hasSufficientBalance) {
        setLoading(false);
        return;
      }
    }
    
    try {
      const decisionJson = {
        hr_name: user.name,
        hr_email: user.email,
        decision: decision,
        notes: notes,
        decision_date: new Date().toISOString()
      };
      
      await requestService.updateLeaveRecordDecision(request.id, {
        final_decision: decision,
        days_approved: decision === 'APPROVED' ? daysApproved : null,
        decision_json: decisionJson
      });
      
      if (decision === 'APPROVED') {
        await employeeService.updateEmployeeBalance(
          request.employee_id,
          request.leave_type,
          daysApproved
        );
      }
      
      onDecisionComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Enhanced Vanilla CSS Styles (Black & White Professional Theme) ---
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
      maxWidth: '520px',
      maxHeight: '90vh',
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
      color: 'teal',
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
    form: {
      padding: '1.5rem',
      overflowY: 'auto',
      flex: 1
    },
    infoCard: {
      backgroundColor: '#9cd7ca',
      borderRadius: '10px',
      padding: '1rem',
      marginBottom: '1.25rem',
      border: '1px solid #eef2f6',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem'
    },
    infoItem: {
      borderBottom: '1px solid #e6edf2',
      paddingBottom: '0.5rem'
    },
    infoLabel: {
      fontSize: '0.7rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#6b7280',
      marginBottom: '0.25rem'
    },
    infoValue: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#111827'
    },
    balanceInsufficient: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#b91c1c',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    balanceSufficient: {
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      color: '#166534',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    fieldGroup: {
      marginBottom: '1.25rem'
    },
    label: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#4b5563',
      marginBottom: '0.5rem'
    },
    radioGroup: {
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      color: '#1f2937',
      cursor: 'pointer'
    },
    input: {
      width: '90%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    textarea: {
      width: '90%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    hint: {
      fontSize: '0.7rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      color: '#b91c1c',
      padding: '0.75rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      border: '1px solid #fecaca'
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginTop: '1.5rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb'
    },
    cancelButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    submitButton: {
      padding: '0.5rem 1rem',
      backgroundColor: 'teal',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    submitButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    }
  };

  const cssHoverEffects = `
    .decision-modal-close-btn:hover { color: #111827; }
    .decision-modal-input:focus, .decision-modal-textarea:focus {
      outline: none;
      border-color: #111827;
      box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
    }
    .decision-modal-cancel-btn:hover {
      background-color: #e5e7eb;
      border-color: #9ca3af;
    }
    .decision-modal-submit-btn:hover:not(:disabled) {
      background-color: #1f2937;
    }
    .decision-modal-radio input:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.2);
    }
    .decision-modal-form-container::-webkit-scrollbar {
      width: 6px;
    }
    .decision-modal-form-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .decision-modal-form-container::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 10px;
    }
  `;

  return (
    <>
      <style>{cssHoverEffects}</style>
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>Review Leave Request</h2>
            <button
              onClick={onClose}
              style={styles.closeButton}
              className="decision-modal-close-btn"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form} className="decision-modal-form-container">
            {/* Employee & request details - now 2 column grid */}
            <div style={styles.infoCard}>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Employee</div>
                <div style={styles.infoValue}>{request.employee.name}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Leave Type</div>
                <div style={styles.infoValue}>{leaveTypeLabels[request.leave_type]}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Start Date</div>
                <div style={styles.infoValue}>{new Date(request.start_date).toLocaleDateString()}</div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Days Requested</div>
                <div style={styles.infoValue}>{request.days_requested} days</div>
              </div>
            </div>

            {/* Balance feedback */}
            {balanceCheck && !balanceCheck.sufficient && (
              <div style={styles.balanceInsufficient}>
                <span>⚠️</span>
                <span>Insufficient balance! Available: {balanceCheck.available} days, Requested: {balanceCheck.requested} days</span>
              </div>
            )}
            {balanceCheck && balanceCheck.sufficient && (
              <div style={styles.balanceSufficient}>
                <span>✓</span>
                <span>Sufficient balance available: {balanceCheck.available} days</span>
              </div>
            )}

            {/* Decision radio buttons */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Decision</label>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel} className="decision-modal-radio">
                  <input
                    type="radio"
                    value="APPROVED"
                    checked={decision === 'APPROVED'}
                    onChange={(e) => setDecision(e.target.value)}
                  />
                  Approve
                </label>
                <label style={styles.radioLabel} className="decision-modal-radio">
                  <input
                    type="radio"
                    value="DENIED"
                    checked={decision === 'DENIED'}
                    onChange={(e) => setDecision(e.target.value)}
                  />
                  Deny
                </label>
              </div>
            </div>

            {/* Days approved (only if approved) */}
            {decision === 'APPROVED' && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Days Approved</label>
                <input
                  type="number"
                  value={daysApproved}
                  onChange={(e) => setDaysApproved(parseInt(e.target.value) || 0)}
                  min="1"
                  max={request.days_requested}
                  style={styles.input}
                  className="decision-modal-input"
                  required
                />
                <div style={styles.hint}>Maximum allowed: {request.days_requested} days</div>
              </div>
            )}

            {/* Notes */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Notes / Comments</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                style={styles.textarea}
                className="decision-modal-textarea"
                placeholder="Add any notes about this decision..."
              />
            </div>

            {/* Error message */}
            {error && <div style={styles.errorMessage}>{error}</div>}

            {/* Action buttons */}
            <div style={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                style={styles.cancelButton}
                className="decision-modal-cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonDisabled : {})
                }}
                className="decision-modal-submit-btn"
              >
                {loading ? 'Processing...' : 'Submit Decision'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DecisionModal;