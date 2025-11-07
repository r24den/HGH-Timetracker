export type EmploymentType = 'Vollzeit' | 'Teilzeit' | 'Geringfügig';

export type AbsenceType = 'Urlaub' | 'Krankenstand' | 'Zeitausgleich' | 'Pflegeurlaub';

export interface Employee {
  id: string;
  name: string;
  password: string;
  employmentType: EmploymentType;
  weeklyHours: number;
  dailyHours: number;
  vacationDays: number;
  remainingVacationDays: number;
  overtimeHours: number;
  isAdmin: boolean;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  projectId?: string;
  totalHours: number;
  isManual: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Absence {
  id: string;
  employeeId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  days: number;
  hours?: number; // Für Zeitausgleich in Stunden
  approved: boolean;
  notes?: string;
}