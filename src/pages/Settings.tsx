import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Settings as SettingsIcon, Lock, Download, Trash2, Database, Eye, EyeOff, FileSpreadsheet, Key, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { employeeService } from '../services/employeeService';
import { timeService } from '../services/timeService';
import { projectService } from '../services/projectService';
import { absenceService } from '../services/absenceService';
import { exportService } from '../services/exportService';

const Settings = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const { toast } = useToast();

  const employees = employeeService.getAllEmployees();

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Fehler",
        description: "Bitte beide Passwortfelder ausfüllen.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Passwörter stimmen nicht überein.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: "Fehler",
        description: "Passwort muss mindestens 4 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }

    // In production würde hier das Admin-Passwort aktualisiert
    console.log('Neues Admin-Passwort:', newPassword);
    
    toast({
      title: "Passwort geändert",
      description: "Das Admin-Passwort wurde erfolgreich aktualisiert."
    });
    
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExportExcel = () => {
    exportService.exportToExcel();
    
    toast({
      title: "Excel-Export erfolgreich",
      description: "Alle Daten wurden als Excel-Datei exportiert."
    });
  };

  const handleDeleteRequest = () => {
    setShowDeleteDialog(true);
    setDeletePassword('');
  };

  const handleConfirmDelete = () => {
    // Admin-Passwort prüfen (case-insensitive)
    if (deletePassword.toLowerCase() !== 'test') {
      toast({
        title: "Falsches Passwort",
        description: "Das eingegebene Admin-Passwort ist nicht korrekt.",
        variant: "destructive"
      });
      return;
    }

    if (confirm('LETZTE WARNUNG: Wirklich ALLE Daten unwiderruflich löschen?')) {
      localStorage.clear();
      
      toast({
        title: "Daten gelöscht",
        description: "Alle Daten wurden gelöscht. Seite wird neu geladen.",
        variant: "destructive"
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const getStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold">Einstellungen</h1>
          <p className="text-sm text-muted-foreground">System- und Sicherheitseinstellungen</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Zugangsdaten Übersicht */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Key className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Mitarbeiter-Zugangsdaten</h2>
                  <p className="text-sm text-gray-600">Übersicht aller Benutzernamen und Passwörter</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                {showPasswords ? (
                  <>
                    <EyeOff size={16} />
                    Passwörter verbergen
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    Passwörter anzeigen
                  </>
                )}
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Hinweis:</strong> Diese Informationen sind vertraulich und sollten sicher aufbewahrt werden. 
                Mitarbeiter verwenden ihren Namen als Benutzernamen (Groß-/Kleinschreibung wird ignoriert).
              </p>
            </div>

            {employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mitarbeiter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Benutzername (Login)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passwort
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beschäftigungsgrad
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{employee.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-mono">
                            {employee.name}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {showPasswords ? (
                            <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-mono">
                              {employee.password}
                            </code>
                          ) : (
                            <span className="text-gray-400">••••••••</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {employee.employmentType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Keine Mitarbeiter vorhanden
              </div>
            )}
          </div>

          {/* Passwort ändern */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Lock className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Admin-Passwort ändern</h2>
                <p className="text-sm text-gray-600">Ändern Sie das Passwort für den Administrator-Zugang</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Neues Passwort
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Neues Passwort eingeben"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Passwort wiederholen"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Passwort ändern
              </button>
            </form>
          </div>

          {/* Datenexport */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileSpreadsheet className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Daten exportieren</h2>
                <p className="text-sm text-gray-600">Exportieren Sie alle Daten als Excel-Datei (.xlsx)</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Der Excel-Export enthält:</strong>
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>Mitarbeiterdaten mit Zugangsinformationen</li>
                <li>Alle Zeiterfassungen</li>
                <li>Projektübersicht mit Stunden</li>
                <li>Abwesenheiten und Urlaube</li>
                <li>Separates Sheet mit allen Zugangsdaten</li>
              </ul>
            </div>

            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              Excel-Datei exportieren
            </button>
          </div>

          {/* Speicherinformationen */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Database className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Speicherinformationen</h2>
                <p className="text-sm text-gray-600">Übersicht über gespeicherte Daten</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Mitarbeiter</p>
                <p className="text-2xl font-bold text-gray-800">
                  {employeeService.getAllEmployees().length}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Zeiteinträge</p>
                <p className="text-2xl font-bold text-gray-800">
                  {timeService.getAllEntries().length}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Projekte</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projectService.getAllProjects().length}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Speicher</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getStorageSize()} KB
                </p>
              </div>
            </div>
          </div>

          {/* Gefahrenzone */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-red-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-600">Gefahrenzone</h2>
                <p className="text-sm text-gray-600">Vorsicht: Diese Aktionen können nicht rückgängig gemacht werden</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Wichtiger Hinweis:</strong> Das Löschen aller Daten erfordert die Eingabe des Admin-Passworts zur Bestätigung.
                Diese Aktion kann nicht rückgängig gemacht werden!
              </p>
            </div>

            {!showDeleteDialog ? (
              <button
                onClick={handleDeleteRequest}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={20} />
                Alle Daten löschen
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border-2 border-red-300">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <AlertTriangle size={20} />
                  <span>Admin-Passwort zur Bestätigung erforderlich</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin-Passwort eingeben
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Admin-Passwort"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={20} />
                    Bestätigen und löschen
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeletePassword('');
                    }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;