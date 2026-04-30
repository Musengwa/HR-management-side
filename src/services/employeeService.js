import { supabase } from '../lib/supabase';

export const employeeService = {
  async getEmployeeByCredentials(name, email) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('name', name)
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getEmployeeById(id) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateEmployeeBalance(employeeId, leaveType, daysToSubtract) {
    // Map leave type to balance column
    const balanceMap = {
      annual: 'balance_annual',
      sick: 'balance_sick',
      maternity: 'balance_maternity',
      paternity: 'balance_paternity',
      compassionate: 'balance_compassionate',
      study: 'balance_study'
    };

    const balanceColumn = balanceMap[leaveType];
    if (!balanceColumn) {
      throw new Error(`Unknown leave type: ${leaveType}`);
    }

    // Get current balance
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select(balanceColumn)
      .eq('id', employeeId)
      .single();
    
    if (fetchError) throw fetchError;

    const currentBalance = employee[balanceColumn];
    if (currentBalance < daysToSubtract) {
      throw new Error(`Insufficient ${leaveType} balance. Available: ${currentBalance}`);
    }

    const newBalance = currentBalance - daysToSubtract;
    const { error: updateError } = await supabase
      .from('employees')
      .update({ [balanceColumn]: newBalance, updated_at: new Date() })
      .eq('id', employeeId);
    
    if (updateError) throw updateError;
    return true;
  },

  async getAllEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, email, job_title, department');
    
    if (error) throw error;
    return data;
  }
};