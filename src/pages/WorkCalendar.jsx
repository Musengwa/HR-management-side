import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { calendarService } from '../services/calendarService';

const DEPARTMENTS = ['ALL', 'Technology', 'Finance', 'HR', 'Operations', 'Sales', 'Legal'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ───── Helper Functions ─────

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function inRange(d, start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return t >= s && t <= e;
}

function fmt(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ───── Style Helpers ─────

const Field = ({ label, children }) => (
  <div>
    <label style={{
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#35575b',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      marginBottom: '0.5rem'
    }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  fontSize: '0.875rem',
  background: '#fcfffe',
  border: '1px solid #b9ddd8',
  color: '#1f2937',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s'
};

const btnStyle = (bgColor, textColor = '#fff') => ({
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  background: bgColor,
  color: textColor,
  fontSize: '0.875rem',
  fontWeight: 600,
  transition: 'all 0.2s',
  whiteSpace: 'nowrap'
});

const iconBtn = (color) => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '6px',
  border: `1px solid ${color}33`,
  cursor: 'pointer',
  background: `${color}11`,
  color: color,
  fontSize: '0.75rem',
  fontWeight: 600,
  transition: 'all 0.2s'
});

const cancelBtn = {
  flex: 1,
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid #b9ddd8',
  cursor: 'pointer',
  background: 'transparent',
  color: '#35575b',
  fontSize: '0.875rem',
  fontWeight: 600,
  transition: 'all 0.2s'
};

const navBtn = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid #b9ddd8',
  cursor: 'pointer',
  background: 'transparent',
  color: '#0f766e',
  fontSize: '1rem',
  fontWeight: 600,
  transition: 'all 0.2s'
};

// ───── Main Component ─────

export default function WorkCalendar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('calendar');
  const [viewDate, setViewDate] = useState(new Date());
  const [blackouts, setBlackouts] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [bForm, setBForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    department: 'ALL',
    severity: 'hard'
  });

  const [hForm, setHForm] = useState({
    name: '',
    date: '',
    is_recurring: true
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [blackoutData, holidayData] = await Promise.all([
        calendarService.getBlackoutPeriods(),
        calendarService.getPublicHolidays()
      ]);
      setBlackouts(blackoutData);
      setHolidays(holidayData);
    } catch (err) {
      showToast('Failed to load calendar data', 'err');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ───── Blackout CRUD ─────

  function openAddBlackout() {
    setBForm({ title: '', description: '', start_date: '', end_date: '', department: 'ALL', severity: 'hard' });
    setEditing(null);
    setModal('blackout-add');
  }

  function openEditBlackout(b) {
    setBForm({
      title: b.title,
      description: b.description,
      start_date: b.start_date,
      end_date: b.end_date,
      department: b.department,
      severity: b.severity
    });
    setEditing(b);
    setModal('blackout-edit');
  }

  async function saveBlackout() {
    if (!bForm.title || !bForm.start_date || !bForm.end_date) {
      return showToast('Fill all required fields', 'err');
    }

    try {
      if (modal === 'blackout-edit' && editing) {
        await calendarService.updateBlackoutPeriod(editing.id, bForm);
        showToast('Blackout period updated');
      } else {
        await calendarService.addBlackoutPeriod(bForm);
        showToast('Blackout period added');
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      showToast(err.message || 'Failed to save blackout period', 'err');
    }
  }

  async function deleteBlackout(id) {
    if (window.confirm('Are you sure you want to delete this blackout period?')) {
      try {
        await calendarService.deleteBlackoutPeriod(id);
        showToast('Blackout period removed');
        fetchAll();
      } catch (err) {
        showToast(err.message || 'Failed to delete blackout period', 'err');
      }
    }
  }

  // ───── Holiday CRUD ─────

  function openAddHoliday() {
    setHForm({ name: '', date: '', is_recurring: true });
    setEditing(null);
    setModal('holiday-add');
  }

  function openEditHoliday(h) {
    setHForm({ name: h.name, date: h.date, is_recurring: h.is_recurring });
    setEditing(h);
    setModal('holiday-edit');
  }

  async function saveHoliday() {
    if (!hForm.name || !hForm.date) {
      return showToast('Fill all required fields', 'err');
    }

    try {
      if (modal === 'holiday-edit' && editing) {
        await calendarService.updatePublicHoliday(editing.id, hForm);
        showToast('Holiday updated');
      } else {
        await calendarService.addPublicHoliday(hForm);
        showToast('Holiday added');
      }
      setModal(null);
      fetchAll();
    } catch (err) {
      showToast(err.message || 'Failed to save holiday', 'err');
    }
  }

  async function deleteHoliday(id) {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await calendarService.deletePublicHoliday(id);
        showToast('Holiday removed');
        fetchAll();
      } catch (err) {
        showToast(err.message || 'Failed to delete holiday', 'err');
      }
    }
  }

  // ───── Calendar grid ─────

  function buildCalendarDays() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));

    return days;
  }

  function getDayInfo(day) {
    const blackout = blackouts.find(b => inRange(day, b.start_date, b.end_date));
    const holiday = holidays.find(h => {
      const hd = new Date(h.date + 'T00:00:00');
      if (!h.is_recurring) return isSameDay(day, hd);
      return day.getMonth() === hd.getMonth() && day.getDate() === hd.getDate();
    });
    return { blackout, holiday };
  }

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const calDays = buildCalendarDays();
  const today = new Date();

  // ───── Styles ─────
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'rgba(155, 239, 225, 0.58)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderBottom: '1px solid #d6ebe8',
      boxShadow: '0 6px 20px -16px rgba(18, 179, 166, 0.55)'
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
      fontWeight: 600,
      color: '#111827',
      margin: 0,
      letterSpacing: '-0.01em'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#35575b',
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
      fontWeight: 500,
      color: '#1f2937'
    },
    userEmail: {
      fontSize: '0.75rem',
      color: '#35575b'
    },
    logoutButton: {
      padding: '0.5rem 1rem',
      backgroundColor: 'transparent',
      border: '1px solid #83cec6',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#0f766e',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    main: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1.5rem'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 10px 24px -20px rgba(6, 95, 90, 0.9)',
      border: '1px solid #cfe9e5',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      borderBottom: '2px solid #e0f0ed',
      paddingBottom: 0
    },
    tabButton: (isActive) => ({
      padding: '0.75rem 1.5rem',
      border: 'none',
      cursor: 'pointer',
      background: 'transparent',
      fontSize: '0.875rem',
      fontWeight: isActive ? 600 : 500,
      color: isActive ? '#0f766e' : '#6b7280',
      borderBottom: isActive ? '3px solid #0f766e' : '3px solid transparent',
      transition: 'all 0.2s',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }),
    calendarContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 10px 24px -20px rgba(6, 95, 90, 0.9)',
      border: '1px solid #cfe9e5',
      overflow: 'hidden'
    },
    monthNav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem',
      borderBottom: '1px solid #cfe9e5'
    },
    monthTitle: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#1f2937'
    },
    legend: {
      display: 'flex',
      gap: '2rem',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #cfe9e5',
      flexWrap: 'wrap'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      color: '#35575b'
    },
    dayHeaders: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      borderBottom: '1px solid #cfe9e5'
    },
    dayHeader: {
      padding: '0.75rem 0',
      textAlign: 'center',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#35575b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)'
    },
    dayCell: (hasEvent, blackoutSeverity, isToday) => ({
      minHeight: '100px',
      padding: '0.75rem',
      borderRight: '1px solid #edf3f2',
      borderBottom: '1px solid #edf3f2',
      background: hasEvent
        ? blackoutSeverity === 'hard'
          ? '#fff0f0'
          : blackoutSeverity === 'soft'
          ? '#fffbf0'
          : '#f0f8fc'
        : '#ffffff',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s'
    }),
    dayNumber: (isToday) => ({
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: isToday ? 700 : 500,
      color: isToday ? '#fff' : '#1f2937',
      background: isToday ? '#0f766e' : 'transparent'
    }),
    eventText: (color) => ({
      marginTop: '0.5rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      color: color,
      lineHeight: 1.3,
      overflow: 'hidden',
      maxHeight: '28px'
    })
  };

  const cssGlobals = `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.25rem;
    }
    .modal-content {
      background: #ffffff;
      border-radius: '12px';
      padding: '1.75rem';
      width: 100%;
      max-width: 480px;
      border: 1px solid #cfe9e5;
      box-shadow: 0 20px 40px -16px rgba(6, 95, 90, 0.6);
    }
    .toast {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      padding: '0.75rem 1.25rem';
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 6px 20px -16px rgba(18, 179, 166, 0.55);
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;

  // ───── Render ─────

  return (
    <>
      <style>{cssGlobals}</style>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.titleSection}>
              <h1 style={styles.mainTitle}>Work Calendar</h1>
              <p style={styles.subtitle}>Manage blackout periods and public holidays</p>
            </div>
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userEmail}>{user?.email}</div>
              </div>
              <button
                onClick={() => navigate('/hr-dashboard')}
                style={{
                  ...styles.logoutButton,
                  marginRight: '0.5rem',
                  color: '#0891b2'
                }}
              >
                ← Dashboard
              </button>
              <button
                onClick={logout}
                style={styles.logoutButton}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.main}>
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={openAddBlackout}
              style={btnStyle('#0f766e', '#fff')}
            >
              + Add Blackout Period
            </button>
            <button
              onClick={openAddHoliday}
              style={btnStyle('#0891b2', '#fff')}
            >
              + Add Public Holiday
            </button>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {['calendar', 'blackouts', 'holidays'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={styles.tabButton(tab === t)}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{...styles.card, textAlign: 'center', color: '#6b7280'}}>
              Loading calendar data...
            </div>
          ) : (
            <>
              {/* ── CALENDAR VIEW ── */}
              {tab === 'calendar' && (
                <div style={styles.calendarContainer}>
                  {/* Month nav */}
                  <div style={styles.monthNav}>
                    <button onClick={prevMonth} style={navBtn}>←</button>
                    <span style={styles.monthTitle}>
                      {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button onClick={nextMonth} style={navBtn}>→</button>
                  </div>

                  {/* Legend */}
                  <div style={styles.legend}>
                    <div style={styles.legendItem}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#dc2626' }} />
                      Hard Blackout
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ea8500' }} />
                      Soft Warning
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0891b2' }} />
                      Public Holiday
                    </div>
                  </div>

                  {/* Day headers */}
                  <div style={styles.dayHeaders}>
                    {DAYS.map(d => (
                      <div key={d} style={styles.dayHeader}>{d}</div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div style={styles.daysGrid}>
                    {calDays.map((day, i) => {
                      if (!day) {
                        return (
                          <div
                            key={`e-${i}`}
                            style={{
                              minHeight: '100px',
                              borderRight: '1px solid #edf3f2',
                              borderBottom: '1px solid #edf3f2',
                              background: '#fafbfc'
                            }}
                          />
                        );
                      }

                      const { blackout, holiday } = getDayInfo(day);
                      const isToday = isSameDay(day, today);

                      return (
                        <div
                          key={day.toISOString()}
                          style={styles.dayCell(
                            !!blackout || !!holiday,
                            blackout?.severity,
                            isToday
                          )}
                        >
                          <div style={styles.dayNumber(isToday)}>
                            {day.getDate()}
                          </div>

                          {blackout && (
                            <div style={styles.eventText(
                              blackout.severity === 'hard' ? '#dc2626' : '#ea8500'
                            )}>
                              {blackout.title}
                            </div>
                          )}
                          {holiday && !blackout && (
                            <div style={styles.eventText('#0891b2')}>
                              {holiday.name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── BLACKOUTS LIST ── */}
              {tab === 'blackouts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {blackouts.length === 0 && (
                    <div style={{...styles.card, textAlign: 'center', color: '#6b7280'}}>
                      No blackout periods configured.
                    </div>
                  )}
                  {blackouts.map(b => (
                    <div
                      key={b.id}
                      style={{
                        ...styles.card,
                        borderLeft: `4px solid ${b.severity === 'hard' ? '#dc2626' : '#ea8500'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {b.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              background: b.severity === 'hard' ? '#fff0f0' : '#fffbf0',
                              color: b.severity === 'hard' ? '#dc2626' : '#ea8500',
                              border: `1px solid ${b.severity === 'hard' ? '#fde2e2' : '#fed7a8'}`
                            }}
                          >
                            {b.severity === 'hard' ? 'Hard Block' : 'Soft Warning'}
                          </span>
                          {b.department !== 'ALL' && (
                            <span style={{
                              fontSize: '0.65rem',
                              color: '#0f766e',
                              background: '#ecf9f7',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              {b.department}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          {fmt(b.start_date)} — {fmt(b.end_date)}
                        </div>
                        {b.description && (
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                            {b.description}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditBlackout(b)}
                          style={iconBtn('#0f766e')}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBlackout(b.id)}
                          style={iconBtn('#dc2626')}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── HOLIDAYS LIST ── */}
              {tab === 'holidays' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {holidays.length === 0 && (
                    <div style={{...styles.card, textAlign: 'center', color: '#6b7280'}}>
                      No public holidays configured.
                    </div>
                  )}
                  {holidays.map(h => (
                    <div
                      key={h.id}
                      style={{
                        ...styles.card,
                        borderLeft: '4px solid #0891b2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {h.name}
                          </span>
                          {h.is_recurring && (
                            <span style={{
                              fontSize: '0.65rem',
                              color: '#0891b2',
                              background: '#ecf8fa',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              RECURRING
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {fmt(h.date)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditHoliday(h)}
                          style={iconBtn('#0f766e')}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteHoliday(h.id)}
                          style={iconBtn('#dc2626')}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* ── MODALS ── */}
        {modal && (
          <div
            className="modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModal(null);
            }}
          >
            <div className="modal-content">
              {/* Blackout modal */}
              {(modal === 'blackout-add' || modal === 'blackout-edit') && (
                <>
                  <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>
                    {modal === 'blackout-add' ? 'Add Blackout Period' : 'Edit Blackout Period'}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Field label="Title *">
                      <input
                        style={inputStyle}
                        value={bForm.title}
                        onChange={e => setBForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Month-end Reporting"
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
                        value={bForm.description}
                        onChange={e => setBForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Additional context..."
                      />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Field label="Start Date *">
                        <input
                          type="date"
                          style={inputStyle}
                          value={bForm.start_date}
                          onChange={e => setBForm(p => ({ ...p, start_date: e.target.value }))}
                        />
                      </Field>
                      <Field label="End Date *">
                        <input
                          type="date"
                          style={inputStyle}
                          value={bForm.end_date}
                          onChange={e => setBForm(p => ({ ...p, end_date: e.target.value }))}
                        />
                      </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Field label="Department">
                        <select
                          style={inputStyle}
                          value={bForm.department}
                          onChange={e => setBForm(p => ({ ...p, department: e.target.value }))}
                        >
                          {DEPARTMENTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Severity">
                        <select
                          style={inputStyle}
                          value={bForm.severity}
                          onChange={e => setBForm(p => ({ ...p, severity: e.target.value }))}
                        >
                          <option value="hard">Hard Block</option>
                          <option value="soft">Soft Warning</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button onClick={() => setModal(null)} style={cancelBtn}>
                      Cancel
                    </button>
                    <button
                      onClick={saveBlackout}
                      style={btnStyle('#0f766e', '#fff')}
                    >
                      {modal === 'blackout-add' ? 'Add Period' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}

              {/* Holiday modal */}
              {(modal === 'holiday-add' || modal === 'holiday-edit') && (
                <>
                  <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>
                    {modal === 'holiday-add' ? 'Add Public Holiday' : 'Edit Public Holiday'}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Field label="Holiday Name *">
                      <input
                        style={inputStyle}
                        value={hForm.name}
                        onChange={e => setHForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Independence Day"
                      />
                    </Field>
                    <Field label="Date *">
                      <input
                        type="date"
                        style={inputStyle}
                        value={hForm.date}
                        onChange={e => setHForm(p => ({ ...p, date: e.target.value }))}
                      />
                    </Field>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={hForm.is_recurring}
                        onChange={e => setHForm(p => ({ ...p, is_recurring: e.target.checked }))}
                        style={{ width: '16px', height: '16px', accentColor: '#0891b2' }}
                      />
                      Recurring annually
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button onClick={() => setModal(null)} style={cancelBtn}>
                      Cancel
                    </button>
                    <button
                      onClick={saveHoliday}
                      style={btnStyle('#0891b2', '#fff')}
                    >
                      {modal === 'holiday-add' ? 'Add Holiday' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className="toast"
            style={{
              background: toast.type === 'ok' ? '#ecf9f7' : '#fff0f0',
              border: `1px solid ${toast.type === 'ok' ? '#9dd7d0' : '#fde2e2'}`,
              color: toast.type === 'ok' ? '#0f766e' : '#dc2626'
            }}
          >
            {toast.type === 'ok' ? '✓ ' : '✕ '}{toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
