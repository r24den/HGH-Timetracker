import { TimeEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { employeeService } from './employeeService';

const STORAGE_KEY = 'timeEntries';

export const timeService = {
  getAllEntries: (): TimeEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getEntriesByEmployee: (employeeId: string): TimeEntry[] => {
    const entries = timeService.getAllEntries();
    return entries.filter(entry => entry.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createManualEntry: (
    employeeId: string,
    date: string,
    clockIn: string,
    clockOut: string,
    breakMinutes: number,
    projectId?: string
  ): TimeEntry => {
    const clockInTime = new Date(`2000-01-01T${clockIn}`);
    const clockOutTime = new Date(`2000-01-01T${clockOut}`);
    const diffMs = clockOutTime.getTime() - clockInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const totalHours = Math.max(0, diffHours - (breakMinutes / 60));

    const entry: TimeEntry = {
      id: uuidv4(),
      employeeId,
      date,
      clockIn,
      clockOut,
      breakMinutes,
      projectId,
      totalHours,
      isManual: true
    };

    const entries = timeService.getAllEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    // Überstunden berechnen
    timeService.calculateOvertime(employeeId);
    
    console.log('Manueller Zeiteintrag erstellt:', entry);
    return entry;
  },

  updateEntry: (entry: TimeEntry): void => {
    const entries = timeService.getAllEntries();
    const index = entries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      entries[index] = entry;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      
      // Überstunden neu berechnen
      timeService.calculateOvertime(entry.employeeId);
      console.log('Zeiteintrag aktualisiert:', entry);
    }
  },

  deleteEntry: (entryId: string): void => {
    const entries = timeService.getAllEntries();
    const entry = entries.find(e => e.id === entryId);
    const filtered = entries.filter(e => e.id !== entryId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    if (entry) {
      timeService.calculateOvertime(entry.employeeId);
    }
    console.log('Zeiteintrag gelöscht:', entryId);
  },

  calculateOvertime: (employeeId: string): void => {
    const employee = employeeService.getEmployeeById(employeeId);
    if (!employee) return;

    const entries = timeService.getEntriesByEmployee(employeeId);
    
    // Gruppiere Einträge nach Datum
    const entriesByDate = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {} as Record<string, TimeEntry[]>);

    // Berechne Überstunden pro Tag
    let totalOvertime = 0;
    Object.values(entriesByDate).forEach(dayEntries => {
      const dailyTotal = dayEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
      const overtime = dailyTotal - employee.dailyHours;
      if (overtime > 0) {
        totalOvertime += overtime;
      }
    });

    employeeService.updateOvertime(employeeId, totalOvertime);
  },

  clockIn: (employeeId: string, projectId?: string): TimeEntry => {
    const now = new Date();
    const entry: TimeEntry = {
      id: uuidv4(),
      employeeId,
      date: now.toISOString().split('T')[0],
      clockIn: now.toTimeString().split(' ')[0],
      breakMinutes: 0,
      projectId,
      totalHours: 0,
      isManual: false
    };

    const entries = timeService.getAllEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    console.log('Eingestempelt:', entry);
    return entry;
  },

  clockOut: (entryId: string, breakMinutes: number = 0): TimeEntry | null => {
    const entries = timeService.getAllEntries();
    const entry = entries.find(e => e.id === entryId);
    
    if (entry && !entry.clockOut) {
      const now = new Date();
      entry.clockOut = now.toTimeString().split(' ')[0];
      entry.breakMinutes = breakMinutes;
      
      const clockInTime = new Date(`2000-01-01T${entry.clockIn}`);
      const clockOutTime = new Date(`2000-01-01T${entry.clockOut}`);
      const diffMs = clockOutTime.getTime() - clockInTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      entry.totalHours = Math.max(0, diffHours - (breakMinutes / 60));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      
      // Überstunden berechnen
      timeService.calculateOvertime(entry.employeeId);
      
      console.log('Ausgestempelt:', entry);
      return entry;
    }
    
    return null;
  },

  getActiveEntry: (employeeId: string): TimeEntry | null => {
    const entries = timeService.getEntriesByEmployee(employeeId);
    return entries.find(entry => !entry.clockOut) || null;
  },

  getTotalHoursForMonth: (employeeId: string, year: number, month: number): number => {
    const entries = timeService.getEntriesByEmployee(employeeId);
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      })
      .reduce((sum, entry) => sum + entry.totalHours, 0);
  }
};