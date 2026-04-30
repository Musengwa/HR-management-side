// src/pages/HrDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestService } from '../services/requestService';
import EmployeeModal from '../components/EmployeeModal';
import DecisionModal from '../components/DecisionModal';

const HrDashboard = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    employeeName: '',
    leaveType: 'all',
    finalDecision: 'all'
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await requestService.getLeaveRecordsWithEmployee();
      setRequests(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load requests. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    let filtered = [...requests];

    if (filters.employeeName.trim()) {
      const searchTerm = filters.employeeName.toLowerCase();
      filtered = filtered.filter(req =>
        req.employee?.name?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.leaveType !== 'all') {
      filtered = filtered.filter(req => req.leave_type === filters.leaveType);
    }

    if (filters.finalDecision !== 'all') {
      filtered = filtered.filter(req => req.final_decision === filters.finalDecision);
    }

    setFilteredRequests(filtered);
  }, [requests, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDecisionComplete = () => {
    setSelectedRequest(null);
    fetchRequests();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      APPROVED: { bg: '#e8f5e9', text: '#2e7d32', label: 'Approved' },
      DENIED: { bg: '#ffebee', text: '#c62828', label: 'Denied' },
      REFER_HR: { bg: '#fff8e1', text: '#f57f17', label: 'Pending HR Review' },
      PENDING_INFO: { bg: '#e3f2fd', text: '#1565c0', label: 'Pending Info' }
    };
    const config = statusConfig[status] || { bg: '#f5f5f5', text: '#424242', label: status };
    return (
      <span style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: config.bg,
        color: config.text,
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        {config.label}
      </span>
    );
  };

  const leaveTypeLabels = {
    annual: 'Annual',
    sick: 'Sick',
    maternity: 'Maternity',
    paternity: 'Paternity',
    compassionate: 'Compassionate',
    study: 'Study'
  };

  // ---------- Vanilla CSS styles (black & white professional theme) ----------
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f4f6f9',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    headerInner: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    titleSection: {
      flex: 1
    },
    mainTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
      margin: 0,
      letterSpacing: '-0.01em'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#4b5563',
      marginTop: '0.25rem'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    userInfo: {
      textAlign: 'right'
    },
    userName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#1f2937'
    },
    userEmail: {
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    logoutButton: {
      padding: '0.5rem 1rem',
      backgroundColor: 'transparent',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    main: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1.5rem'
    },
    filterCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
      border: '1px solid #eaeef2',
      padding: '1.25rem',
      marginBottom: '2rem'
    },
    filterGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'flex-end'
    },
    filterItem: {
      flex: '1 1 180px',
      minWidth: '160px'
    },
    filterLabel: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#4b5563',
      marginBottom: '0.5rem'
    },
    filterInput: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    clearButton: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      backgroundColor: '#f9fafb',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4b5563',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    tableWrapper: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaeef2',
      overflowX: 'auto',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem'
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem 1rem',
      backgroundColor: '#fafcfc',
      borderBottom: '1px solid #e6edf2',
      fontWeight: '600',
      color: '#1f2a3e',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #f0f2f5',
      color: '#1f2937',
      verticalAlign: 'middle'
    },
    employeeLink: {
      color: '#1f2937',
      fontWeight: '500',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: 0,
      transition: 'color 0.2s',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      textDecorationColor: 'transparent'
    },
    reviewButton: {
      padding: '0.25rem 1rem',
      backgroundColor: '#fef9e3',
      border: '1px solid #fde68a',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#b45309',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    processedBadge: {
      fontSize: '0.7rem',
      color: '#9ca3af',
      fontStyle: 'italic'
    },
    loadingErrorBox: {
      textAlign: 'center',
      padding: '3rem',
      color: '#6b7280'
    },
    retryButton: {
      marginTop: '1rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#111827',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.875rem',
      cursor: 'pointer'
    }
  };

  // Hover & focus styles (injected via <style>)
  const cssGlobals = `
    .filter-input:focus, .filter-select:focus {
      outline: none;
      border-color: #111827;
      box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
    }
    .clear-btn:hover, .logout-btn:hover {
      background-color: #f3f4f6;
      border-color: #9ca3af;
    }
    .employee-link:hover {
      color: #000000;
      text-decoration-color: #000000;
    }
    .review-btn:hover {
      background-color: #fef3c7;
      border-color: #f59e0b;
      transform: translateY(-1px);
    }
    .retry-btn:hover {
      background-color: #1f2937;
    }
    table tr:hover td {
      background-color: #fafcff;
    }
    button {
      font-family: inherit;
    }
  `;

  return (
    <>
      <style>{cssGlobals}</style>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.titleSection}>
              <h1 style={styles.mainTitle}>HR Dashboard</h1>
              <p style={styles.subtitle}>Manage leave requests & employee balances</p>
            </div>
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userEmail}>{user?.email}</div>
              </div>
              <button
                onClick={logout}
                style={styles.logoutButton}
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.main}>
          {/* Filter Bar */}
          <div style={styles.filterCard}>
            <div style={styles.filterGrid}>
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>Employee Name</label>
                <input
                  type="text"
                  value={filters.employeeName}
                  onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                  placeholder="Search by name..."
                  style={styles.filterInput}
                  className="filter-input"
                />
              </div>
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>Leave Type</label>
                <select
                  value={filters.leaveType}
                  onChange={(e) => handleFilterChange('leaveType', e.target.value)}
                  style={styles.filterInput}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="compassionate">Compassionate Leave</option>
                  <option value="study">Study Leave</option>
                </select>
              </div>
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>Status</label>
                <select
                  value={filters.finalDecision}
                  onChange={(e) => handleFilterChange('finalDecision', e.target.value)}
                  style={styles.filterInput}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="REFER_HR">Pending HR Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DENIED">Denied</option>
                  <option value="PENDING_INFO">Pending Info</option>
                </select>
              </div>
              <div style={styles.filterItem}>
                <button
                  onClick={() => setFilters({ employeeName: '', leaveType: 'all', finalDecision: 'all' })}
                  style={styles.clearButton}
                  className="clear-btn"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div style={styles.tableWrapper}>
            {loading ? (
              <div style={styles.loadingErrorBox}>
                <div>Loading requests...</div>
              </div>
            ) : error ? (
              <div style={styles.loadingErrorBox}>
                <div style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</div>
                <button onClick={fetchRequests} style={styles.retryButton} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={styles.loadingErrorBox}>
                <div>No leave requests found</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Employee</th>
                      <th style={styles.th}>Leave Type</th>
                      <th style={styles.th}>Start Date</th>
                      <th style={styles.th}>Days</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td style={styles.td}>
                          <button
                            onClick={() => setSelectedEmployeeId(request.employee_id)}
                            style={styles.employeeLink}
                            className="employee-link"
                          >
                            {request.employee?.name || 'Unknown'}
                          </button>
                        </td>
                        <td style={styles.td}>
                          {leaveTypeLabels[request.leave_type] || request.leave_type}
                        </td>
                        <td style={styles.td}>
                          {new Date(request.start_date).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          {request.days_requested}
                          {request.days_approved && request.final_decision === 'APPROVED' && (
                            <span style={{ fontSize: '0.7rem', color: '#2e7d32', marginLeft: '0.25rem' }}>
                              (approved: {request.days_approved})
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {getStatusBadge(request.final_decision)}
                        </td>
                        <td style={styles.td}>
                          {request.final_decision === 'REFER_HR' ? (
                            <button
                              onClick={() => setSelectedRequest(request)}
                              style={styles.reviewButton}
                              className="review-btn"
                            >
                              Review
                            </button>
                          ) : (
                            <span style={styles.processedBadge}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        {selectedEmployeeId && (
          <EmployeeModal
            employeeId={selectedEmployeeId}
            onClose={() => setSelectedEmployeeId(null)}
          />
        )}
        {selectedRequest && (
          <DecisionModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onDecisionComplete={handleDecisionComplete}
          />
        )}
      </div>
    </>
  );
};

export default HrDashboard;