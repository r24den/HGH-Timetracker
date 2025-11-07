import { Absence, AbsenceType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { employeeService } from './employeeService';

const STORAGE_KEY = 'absences';

export const absenceService = {
  getAllAbsences: (): Absence[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getAbsencesByEmployee: (employeeId: string): Absence[] => {
    const absences = absenceService.getAllAbsences();
    return absences.filter(absence => absence.employeeId === employeeId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  },

  createAbsence: (
    employeeId: string,
    type: AbsenceType,
    startDate: string,
    endDate: string,
    days: number,
    hours?: number,
    notes?: string
  ): Absence | null => {
    // Bei Urlaub prüfen ob genug Urlaubstage vorhanden
    if (type === 'Urlaub') {
      const employee = employeeService.getEmployeeById(employeeId);
      if (!employee || employee.remainingVacationDays < days) {
        console.log('Nicht genug Urlaubstage verfügbar');
        return null;
      }
    }

    const newAbsence: Absence = {
      id: uuidv4(),
      employeeId,
      type,
      startDate,
      endDate,
      days,
      hours: type === 'Zeitausgleich' ? hours : undefined,
      approved: type === 'Krankenstand', // Krankenstand automatisch genehmigt
      notes
    };

    const absences = absenceService.getAllAbsences();
    absences.push(newAbsence);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(absences));
    
    // Bei Urlaub Urlaubstage abziehen wenn genehmigt
    if (type === 'Urlaub' && newAbsence.approved) {
      employeeService.deductVacationDays(employeeId, days);
    }
    
    // Bei Zeitausgleich Überstunden abziehen (auch wenn negativ)
    if (type === 'Zeitausgleich' && hours && newAbsence.approved) {
      absenceService.deductOvertimeHours(employeeId, hours);
    }
    
    console.log('Neue Abwesenheit erstellt:', newAbsence);
    return newAbsence;
  },

  approveAbsence: (absenceId: string): boolean => {
    const absences = absenceService.getAllAbsences();
    const absence = absences.find(a => a.id === absenceId);
    if (absence && !absence.approved) {
      absence.approved = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(absences));
      
      // Bei Urlaub Urlaubstage abziehen
      if (absence.type === 'Urlaub') {
        const success = employeeService.deductVacationDays(absence.employeeId, absence.days);
        if (!success) {
          console.log('Fehler beim Abziehen der Urlaubstage');
          return false;
        }
      }
      
      // Bei Zeitausgleich Überstunden abziehen
      if (absence.type === 'Zeitausgleich' && absence.hours) {
        absenceService.deductOvertimeHours(absence.employeeId, absence.hours);
      }
      
      console.log('Abwesenheit genehmigt:', absence);
      return true;
    }
    return false;
  },

  deductOvertimeHours: (employeeId: string, hours: number): void => {
    const employee = employeeService.getEmployeeById(employeeId);
    if (employee) {
      // Überstunden abziehen - kann auch negativ werden
      employee.overtimeHours -= hours;
      employeeService.updateEmployee(employee);
      console.log(`Zeitausgleich: ${hours}h von Überstunden abgezogen. Neuer Stand: ${employee.overtimeHours.toFixed(2)}h`);
    }
  },

  deleteAbsence: (absenceId: string): void => {
    const absences = absenceService.getAllAbsences();
    const absence = absences.find(a => a.id === absenceId);
    
    if (absence && absence.approved) {
      // Wenn genehmigter Urlaub gelöscht wird, Tage zurückgeben
      if (absence.type === 'Urlaub') {
        const employee = employeeService.getEmployeeById(absence.employeeId);
        if (employee) {
          employee.remainingVacationDays += absence.days;
          employeeService.updateEmployee(employee);
        }
      }
      
      // Wenn genehmigter Zeitausgleich gelöscht wird, Stunden zurückgeben
      if (absence.type === 'Zeitausgleich' && absence.hours) {
        const employee = employeeService.getEmployeeById(absence.employeeId);
        if (employee) {
          employee.overtimeHours += absence.hours;
          employeeService.updateEmployee(employee);
        }
      }
    }
    
    const filtered = absences.filter(a => a.id !== absenceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('Abwesenheit gelöscht:', absenceId);
  }
};