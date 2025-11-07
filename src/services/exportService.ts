import * as XLSX from 'xlsx';
import { employeeService } from './employeeService';
import { timeService } from './timeService';
import { projectService } from './projectService';
import { absenceService } from './absenceService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const exportService = {
  exportToExcel: () => {
    const workbook = XLSX.utils.book_new();

    // Mitarbeiter-Sheet
    const employees = employeeService.getAllEmployees();
    const employeeData = employees.map(emp => ({
      'Name': emp.name,
      'Benutzername (Login)': emp.name,
      'Passwort': emp.password,
      'Beschäftigungsgrad': emp.employmentType,
      'Wochenstunden': emp.weeklyHours,
      'Urlaubstage Gesamt': emp.vacationDays,
      'Resturlaub': emp.remainingVacationDays,
      'Überstunden': emp.overtimeHours.toFixed(2)
    }));
    const employeeSheet = XLSX.utils.json_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(workbook, employeeSheet, 'Mitarbeiter');

    // Zeiteinträge-Sheet
    const timeEntries = timeService.getAllEntries();
    const timeData = timeEntries.map(entry => {
      const employee = employees.find(e => e.id === entry.employeeId);
      const project = projectService.getAllProjects().find(p => p.id === entry.projectId);
      
      return {
        'Datum': format(new Date(entry.date), 'dd.MM.yyyy', { locale: de }),
        'Mitarbeiter': employee?.name || 'Unbekannt',
        'Beginn': entry.clockIn,
        'Ende': entry.clockOut || 'Noch aktiv',
        'Pause (Min)': entry.breakMinutes,
        'Arbeitsstunden': entry.totalHours.toFixed(2),
        'Projekt': project?.name || 'Kein Projekt'
      };
    });
    const timeSheet = XLSX.utils.json_to_sheet(timeData);
    XLSX.utils.book_append_sheet(workbook, timeSheet, 'Zeiterfassung');

    // Projekte-Sheet
    const projects = projectService.getAllProjects();
    const projectData = projects.map(proj => {
      const projectEntries = timeEntries.filter(e => e.projectId === proj.id);
      const totalHours = projectEntries.reduce((sum, e) => sum + e.totalHours, 0);
      
      return {
        'Projektname': proj.name,
        'Beschreibung': proj.description,
        'Status': proj.isActive ? 'Aktiv' : 'Inaktiv',
        'Gesamtstunden': totalHours.toFixed(2)
      };
    });
    const projectSheet = XLSX.utils.json_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Projekte');

    // Abwesenheiten-Sheet
    const absences = absenceService.getAllAbsences();
    const absenceData = absences.map(abs => {
      const employee = employees.find(e => e.id === abs.employeeId);
      
      return {
        'Mitarbeiter': employee?.name || 'Unbekannt',
        'Art': abs.type,
        'Von': format(new Date(abs.startDate), 'dd.MM.yyyy', { locale: de }),
        'Bis': format(new Date(abs.endDate), 'dd.MM.yyyy', { locale: de }),
        'Tage': abs.days,
        'Status': abs.approved ? 'Genehmigt' : 'Ausstehend'
      };
    });
    const absenceSheet = XLSX.utils.json_to_sheet(absenceData);
    XLSX.utils.book_append_sheet(workbook, absenceSheet, 'Abwesenheiten');

    // Zugangsdaten-Sheet (nur für Admin)
    const accessData = employees.map(emp => ({
      'Mitarbeiter': emp.name,
      'Benutzername': emp.name,
      'Passwort': emp.password,
      'Beschäftigungsgrad': emp.employmentType
    }));
    const accessSheet = XLSX.utils.json_to_sheet(accessData);
    XLSX.utils.book_append_sheet(workbook, accessSheet, 'Zugangsdaten');

    // Datei speichern
    const fileName = `HGH-Stundenerfassung-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log('Excel-Export erstellt:', fileName);
  }
};