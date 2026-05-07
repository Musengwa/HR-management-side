import { supabase } from '../lib/supabase';

export const calendarService = {
  // ───── Blackout Periods ─────
  
  async getBlackoutPeriods() {
    const { data, error } = await supabase
      .from('blackout_periods')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addBlackoutPeriod(blackoutData) {
    const { data, error } = await supabase
      .from('blackout_periods')
      .insert([blackoutData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async updateBlackoutPeriod(id, blackoutData) {
    const { data, error } = await supabase
      .from('blackout_periods')
      .update(blackoutData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deleteBlackoutPeriod(id) {
    const { error } = await supabase
      .from('blackout_periods')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // ───── Public Holidays ─────
  
  async getPublicHolidays() {
    const { data, error } = await supabase
      .from('public_holidays')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addPublicHoliday(holidayData) {
    const { data, error } = await supabase
      .from('public_holidays')
      .insert([holidayData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async updatePublicHoliday(id, holidayData) {
    const { data, error } = await supabase
      .from('public_holidays')
      .update(holidayData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async deletePublicHoliday(id) {
    const { error } = await supabase
      .from('public_holidays')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // ───── Utility functions ─────
  
  isBlackoutDate(date, blackoutPeriods) {
    return blackoutPeriods.find(b => {
      const dateStr = date.toISOString().split('T')[0];
      return dateStr >= b.start_date && dateStr <= b.end_date;
    });
  },

  isHolidayDate(date, holidays) {
    return holidays.find(h => {
      const dateStr = date.toISOString().split('T')[0];
      const holidayDate = h.date;
      
      if (!h.is_recurring) {
        return dateStr === holidayDate;
      }
      // For recurring holidays, check same month and day
      const [, month, day] = holidayDate.split('-');
      const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
      const dateDay = String(date.getDate()).padStart(2, '0');
      return dateMonth === month && dateDay === day;
    });
  },

  getBlackoutForDateRange(startDate, endDate, blackoutPeriods) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return blackoutPeriods.filter(b => {
      const bStart = new Date(b.start_date).getTime();
      const bEnd = new Date(b.end_date).getTime();
      return bStart <= end && bEnd >= start;
    });
  }
};
