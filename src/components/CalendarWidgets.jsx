import React, { useState, useEffect } from 'react';
import { calendarService } from '../services/calendarService';

// Mini calendar widget for sidebar/dashboard
export const MiniCalendarWidget = ({ onDateSelect }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [blackouts, setBlackouts] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [b, h] = await Promise.all([
        calendarService.getBlackoutPeriods(),
        calendarService.getPublicHolidays()
      ]);
      setBlackouts(b);
      setHolidays(h);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  }

  function getDayStatus(date) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Check blackout
    const blackout = blackouts.find(b => dateStr >= b.start_date && dateStr <= b.end_date);
    if (blackout) return { type: 'blackout', severity: blackout.severity };
    
    // Check holiday
    const holiday = holidays.find(h => {
      if (!h.is_recurring) return dateStr === h.date;
      const [, month, day] = h.date.split('-');
      const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
      const dateDay = String(date.getDate()).padStart(2, '0');
      return dateMonth === month && dateDay === day;
    });
    if (holiday) return { type: 'holiday' };
    
    return { type: 'normal' };
  }

  function buildDays() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
    
    return days;
  }

  const days = buildDays();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{

      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '30px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <button
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          style={{
            padding: '4px 8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ←
        </button>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>
          {months[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          style={{
            padding: '4px 8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          →
        </button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px', marginBottom: '6px' }}>
        {dayLabels.map(d => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: '#9ca3af',
              padding: '4px 0'
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} style={{ padding: '4px' }} />;
          }

          const status = getDayStatus(day);
          const bgColor =
            status.type === 'blackout'
              ? status.severity === 'hard'
                ? '#fee2e2'
                : '#fef3c7'
              : status.type === 'holiday'
              ? '#e0f2fe'
              : '#ffffff';

          const textColor =
            status.type === 'blackout'
              ? status.severity === 'hard'
                ? '#dc2626'
                : '#d97706'
              : status.type === 'holiday'
              ? '#0891b2'
              : '#1f2937';

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect?.(day)}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                background: bgColor,
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 500,
                color: textColor,
                transition: 'all 0.2s'
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #e5e7eb',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px' }} /> Hard
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px' }} /> Soft
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#0891b2', borderRadius: '2px' }} /> Holiday
        </div>
      </div>
    </div>
  );
};

// Calendar indicators for leave request
export const CalendarIndicator = ({ startDate, endDate, blackouts, holidays }) => {
  const affectedBlackouts = blackouts.filter(b => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const bStart = new Date(b.start_date).getTime();
    const bEnd = new Date(b.end_date).getTime();
    return bStart <= end && bEnd >= start;
  });

  const affectedHolidays = holidays.filter(h => {
    const hDate = new Date(h.date).getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return hDate >= start && hDate <= end;
  });

  if (affectedBlackouts.length === 0 && affectedHolidays.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginTop: '8px',
      padding: '8px',
      borderRadius: '6px',
      background: '#fef9e7',
      border: '1px solid #fce8ac',
      fontSize: '12px'
    }}>
      {affectedBlackouts.length > 0 && (
        <div style={{ color: '#92400e', marginBottom: '4px' }}>
          ⚠️ {affectedBlackouts.length} blackout period{affectedBlackouts.length > 1 ? 's' : ''} overlap
        </div>
      )}
      {affectedHolidays.length > 0 && (
        <div style={{ color: '#155e75' }}>
          📅 {affectedHolidays.length} holiday{affectedHolidays.length > 1 ? 's' : ''} included
        </div>
      )}
    </div>
  );
};

// Quick date range checker
export const DateRangeChecker = ({ onConflictDetected }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [conflicts, setConflicts] = useState(null);
  const [blackouts, setBlackouts] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [b, h] = await Promise.all([
        calendarService.getBlackoutPeriods(),
        calendarService.getPublicHolidays()
      ]);
      setBlackouts(b);
      setHolidays(h);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    }
  }

  function checkDateRange() {
    if (!startDate || !endDate) return;

    const affectedBlackouts = blackouts.filter(b => {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const bStart = new Date(b.start_date).getTime();
      const bEnd = new Date(b.end_date).getTime();
      return bStart <= end && bEnd >= start;
    });

    const affectedHolidays = holidays.filter(h => {
      const hDate = new Date(h.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return hDate >= start && hDate <= end;
    });

    const hasConflicts = affectedBlackouts.length > 0 || affectedHolidays.length > 0;
    setConflicts({ blackouts: affectedBlackouts, holidays: affectedHolidays });
    onConflictDetected?.(hasConflicts, { blackouts: affectedBlackouts, holidays: affectedHolidays });
  }

  useEffect(() => {
    if (startDate && endDate) {
      checkDateRange();
    }
  }, [startDate, endDate]);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            fontSize: '12px'
          }}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            fontSize: '12px'
          }}
        />
      </div>

      {conflicts && (conflicts.blackouts.length > 0 || conflicts.holidays.length > 0) && (
        <div style={{
          padding: '8px',
          borderRadius: '4px',
          background: '#fef9e7',
          border: '1px solid #fce8ac',
          fontSize: '11px',
          color: '#92400e'
        }}>
          {conflicts.blackouts.length > 0 && (
            <div>⚠️ {conflicts.blackouts.length} blackout(s)</div>
          )}
          {conflicts.holidays.length > 0 && (
            <div>📅 {conflicts.holidays.length} holiday(s)</div>
          )}
        </div>
      )}
    </div>
  );
};
