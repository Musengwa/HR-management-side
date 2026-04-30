import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employeeService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('hr_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('hr_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (name, email) => {
    try {
      const employee = await employeeService.getEmployeeByCredentials(name, email);
      
      // Check if employee exists and has HR job title
      if (!employee || employee.job_title !== 'HR') {
        throw new Error('Access denied. Only HR users can access this portal.');
      }
      
      const userData = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        job_title: employee.job_title
      };
      
      setUser(userData);
      localStorage.setItem('hr_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hr_user');
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};