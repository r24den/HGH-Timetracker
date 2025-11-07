import { Employee } from '../types';

const ADMIN_USERNAME = 'test';
const ADMIN_PASSWORD = 'test';

export const authService = {
  login: (username: string, password: string): Employee | null => {
    const normalizedUsername = username.toLowerCase().trim();
    const normalizedPassword = password.toLowerCase().trim();

    // Check admin login
    if (normalizedUsername === ADMIN_USERNAME.toLowerCase() && 
        normalizedPassword === ADMIN_PASSWORD.toLowerCase()) {
      const admin = authService.getAdmin();
      sessionStorage.setItem('currentUser', JSON.stringify(admin));
      return admin;
    }

    // Check employee login
    const employees = authService.getAllEmployees();
    const employee = employees.find(emp => 
      emp.name.toLowerCase() === normalizedUsername && 
      emp.password.toLowerCase() === normalizedPassword
    );

    if (employee) {
      sessionStorage.setItem('currentUser', JSON.stringify(employee));
      return employee;
    }

    return null;
  },

  logout: () => {
    sessionStorage.removeItem('currentUser');
  },

  getCurrentUser: (): Employee | null => {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  getAdmin: (): Employee => {
    return {
      id: 'admin',
      name: 'Administrator',
      password: ADMIN_PASSWORD,
      employmentType: 'Vollzeit',
      weeklyHours: 38.5,
      dailyHours: 7.7,
      vacationDays: 30,
      remainingVacationDays: 30,
      overtimeHours: 0,
      isAdmin: true
    };
  },

  getAllEmployees: (): Employee[] => {
    const employeesStr = localStorage.getItem('employees');
    return employeesStr ? JSON.parse(employeesStr) : [];
  },

  updateAdminPassword: (newPassword: string) => {
    // In a real app, this would update the database
    console.log('Admin password updated to:', newPassword);
  }
};