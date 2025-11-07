import { Employee, EmploymentType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'employees';

const getEmploymentDefaults = (type: EmploymentType) => {
  switch (type) {
    case 'Vollzeit':
      return { weeklyHours: 38.5, dailyHours: 7.7, vacationDays: 30 };
    case 'Teilzeit':
      return { weeklyHours: 20, dailyHours: 4, vacationDays: 15 };
    case 'Geringfügig':
      return { weeklyHours: 10, dailyHours: 2, vacationDays: 5 };
  }
};

export const employeeService = {
  getAllEmployees: (): Employee[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getEmployeeById: (id: string): Employee | null => {
    const employees = employeeService.getAllEmployees();
    return employees.find(emp => emp.id === id) || null;
  },

  createEmployee: (name: string, password: string, employmentType: EmploymentType): Employee => {
    const defaults = getEmploymentDefaults(employmentType);
    const newEmployee: Employee = {
      id: uuidv4(),
      name,
      password,
      employmentType,
      weeklyHours: defaults.weeklyHours,
      dailyHours: defaults.dailyHours,
      vacationDays: defaults.vacationDays,
      remainingVacationDays: defaults.vacationDays,
      overtimeHours: 0,
      isAdmin: false
    };

    const employees = employeeService.getAllEmployees();
    employees.push(newEmployee);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    
    console.log('Neuer Mitarbeiter erstellt:', newEmployee);
    return newEmployee;
  },

  updateEmployee: (employee: Employee): void => {
    const employees = employeeService.getAllEmployees();
    const index = employees.findIndex(emp => emp.id === employee.id);
    if (index !== -1) {
      employees[index] = employee;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
      console.log('Mitarbeiter aktualisiert:', employee);
    }
  },

  deleteEmployee: (id: string): void => {
    const employees = employeeService.getAllEmployees();
    const filtered = employees.filter(emp => emp.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('Mitarbeiter gelöscht:', id);
  },

  updateOvertime: (employeeId: string, hours: number): void => {
    const employee = employeeService.getEmployeeById(employeeId);
    if (employee) {
      employee.overtimeHours = hours;
      employeeService.updateEmployee(employee);
    }
  },

  deductVacationDays: (employeeId: string, days: number): boolean => {
    const employee = employeeService.getEmployeeById(employeeId);
    if (employee && employee.remainingVacationDays >= days) {
      employee.remainingVacationDays -= days;
      employeeService.updateEmployee(employee);
      return true;
    }
    return false;
  }
};