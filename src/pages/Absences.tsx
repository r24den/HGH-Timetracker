import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { absenceService } from '../services/absenceService';
import { employeeService } from '../services/employeeService';
import { Calendar, Check, X, Clock, Plus, Trash2, TrendingDown } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AbsenceType } from '../types';

const Absences = () => {
  const [absences, setAbsences] = useState(absenceService.getAllAbsences());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'Urlaub' as AbsenceType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    days: 1,
    hours: 0,
    notes: ''
  });
  const employees = employeeService.getAllEmployees();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      toast({
        title: "Fehler",
        description: "Bitte alle Pflichtfelder ausfüllen.",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'Zeitausgleich' && formData.hours <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte Stunden für Zeitausgleich eingeben.",
        variant: "destructive"
      });
      return;
    }

    const absence = absenceService.createAbsence(
      formData.employeeId,
      formData.type,
      formData.startDate,
      formData.endDate,
      formData.days,
      formData.type === 'Zeitausgleich' ? formData.hours : undefined,
      formData.notes
    );

    if (!absence) {
      toast({
        title: "Fehler",
        description: "Nicht genug Urlaubstage verfügbar.",
        variant: "destructive"
      });
      return;
    }

    setAbsences(absenceService.getAllAbsences());
    setFormData({
      employeeId: '',
      type: 'Urlaub',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      days: 1,
      hours: 0,
      notes: ''
    });
    setShowForm(false);
    
    const employee = employees.find(e => e.id === formData.employeeId);
    if (formData.type === 'Zeitausgleich') {
      toast({
        title: "Zeitausgleich eingetragen",
        description: `${formData.hours}h wurden von den Überstunden von ${employee?.name} abgezogen.`
      });
    } else {
      toast({
        title: formData.type === 'Krankenstand' ? "Krankenstand eingetragen" : "Urlaub eingetragen",
        description: `${formData.days} Tag(e) für ${employee?.name} erfasst.`
      });
    }
  };

  const handleApprove = (absenceId: string) => {
    const success = absenceService.approveAbsence(absenceId);
    if (success) {
      setAbsences(absenceService.getAllAbsences());
      const absence = absences.find(a => a.id === absenceId);
      if (absence?.type === 'Zeitausgleich') {
        toast({
          title: "Zeitausgleich genehmigt",
          description: `${absence.hours}h wurden von den Überstunden abgezogen.`
        });
      } else {
        toast({
          title: "Urlaub genehmigt",
          description: "Die Urlaubstage wurden vom Guthaben abgezogen."
        });
      }
    } else {
      toast({
        title: "Fehler",
        description: "Nicht genug Urlaubstage verfügbar.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (absenceId: string) => {
    if (confirm('Abwesenheit wirklich löschen?')) {
      absenceService.deleteAbsence(absenceId);
      setAbsences(absenceService.getAllAbsences());
      toast({
        title: "Abwesenheit gelöscht",
        description: "Der Eintrag wurde entfernt."
      });
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.name || 'Unbekannt';
  };

  const getAbsenceTypeColor = (type: string) => {
    switch (type) {
      case 'Urlaub':
        return 'bg-blue-100 text-blue-700';
      case 'Krankenstand':
        return 'bg-red-100 text-red-700';
      case 'Zeitausgleich':
        return 'bg-green-100 text-green-700';
      case 'Pflegeurlaub':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const pendingAbsences = absences.filter(a => !a.approved);
  const approvedAbsences = absences.filter(a => a.approved);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Urlaubsverwaltung</h1>
          <p className="text-sm text-muted-foreground">Urlaub, Zeitausgleich und Krankenstände verwalten</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Neue Abwesenheit
        </button>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Neue Abwesenheit eintragen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mitarbeiter *
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Mitarbeiter auswählen</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} (Resturlaub: {emp.remainingVacationDays} Tage | Überstunden: {emp.overtimeHours.toFixed(1)}h)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Art *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AbsenceType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Urlaub">Urlaub</option>
                    <option value="Zeitausgleich">Zeitausgleich</option>
                    <option value="Krankenstand">Krankenstand</option>
                    <option value="Pflegeurlaub">Pflegeurlaub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Von *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bis *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anzahl Tage *
                  </label>
                  <input
                    type="number"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                {formData.type === 'Zeitausgleich' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zeitausgleich Stunden *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0.5"
                      placeholder="z.B. 8"
                      required
                    />
                  </div>
                )}

                <div className={formData.type === 'Zeitausgleich' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notizen
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> {
                    formData.type === 'Krankenstand' 
                      ? 'Krankenstände werden automatisch genehmigt und ziehen keine Urlaubstage ab.' 
                      : formData.type === 'Zeitausgleich'
                      ? 'Zeitausgleich wird von den Überstunden abgezogen. Negative Überstunden werden mit zukünftigen Überstunden verrechnet.'
                      : 'Urlaub muss genehmigt werden und wird dann vom Urlaubsguthaben abgezogen.'
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Abwesenheit eintragen
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {employee.employmentType}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Resturlaub:</span>
                    <span className="font-semibold text-green-600">
                      {employee.remainingVacationDays} / {employee.vacationDays} Tage
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.max(0, (employee.remainingVacationDays / employee.vacationDays) * 100)}%`
                      }}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Überstunden:</span>
                    <span className={`font-semibold ${employee.overtimeHours >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {employee.overtimeHours >= 0 ? '+' : ''}{employee.overtimeHours.toFixed(1)}h
                    </span>
                  </div>
                  {employee.overtimeHours < 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Negative Überstunden werden mit zukünftigen Überstunden verrechnet
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {pendingAbsences.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              Ausstehende Genehmigungen ({pendingAbsences.length})
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mitarbeiter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Art
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Von
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stunden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Notizen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingAbsences.map((absence) => (
                      <tr key={absence.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {getEmployeeName(absence.employeeId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAbsenceTypeColor(absence.type)}`}>
                            {absence.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(absence.startDate), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(absence.endDate), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {absence.days} Tag(e)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {absence.hours ? `${absence.hours}h` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {absence.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(absence.id)}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Check size={16} />
                              Genehmigen
                            </button>
                            <button
                              onClick={() => handleDelete(absence.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Check className="text-green-500" size={20} />
            Genehmigte Abwesenheiten ({approvedAbsences.length})
          </h2>
          {approvedAbsences.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mitarbeiter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Art
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Von
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stunden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Notizen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {approvedAbsences.map((absence) => (
                      <tr key={absence.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {getEmployeeName(absence.employeeId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAbsenceTypeColor(absence.type)}`}>
                            {absence.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(absence.startDate), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(absence.endDate), 'dd.MM.yyyy', { locale: de })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {absence.days} Tag(e)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {absence.hours ? `${absence.hours}h` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {absence.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(absence.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">Keine genehmigten Abwesenheiten</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Absences;