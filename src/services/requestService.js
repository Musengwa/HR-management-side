import { supabase } from '../lib/supabase';

export const requestService = {
  async getLeaveRecordsWithEmployee() {
    const { data, error } = await supabase
      .from('leave_records')
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          email,
          job_title,
          department,
          balance_annual,
          balance_sick,
          balance_maternity,
          balance_paternity,
          balance_compassionate,
          balance_study
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateLeaveRecordDecision(recordId, decisionData) {
    const { final_decision, days_approved, decision_json, chat_transcript } = decisionData;
    
    const updatePayload = {
      final_decision,
      days_approved: days_approved || null,
      decision: decision_json,
      updated_at: new Date()
    };

    if (chat_transcript) {
      updatePayload.chat_transcript = chat_transcript;
    }

    const { data, error } = await supabase
      .from('leave_records')
      .update(updatePayload)
      .eq('id', recordId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async getFilteredRequests(filters) {
    let query = supabase
      .from('leave_records')
      .select(`
        *,
        employee:employee_id (
          id,
          name,
          email,
          job_title,
          department,
          balance_annual,
          balance_sick,
          balance_maternity,
          balance_paternity,
          balance_compassionate,
          balance_study
        )
      `);
    
    if (filters.leave_type && filters.leave_type !== 'all') {
      query = query.eq('leave_type', filters.leave_type);
    }
    if (filters.final_decision && filters.final_decision !== 'all') {
      query = query.eq('final_decision', filters.final_decision);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};