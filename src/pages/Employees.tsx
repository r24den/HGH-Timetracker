import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { employeeService } from '../services/employeeService';
import { EmploymentType } from '../types';
import { Plus, Trash2, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Employees = () => {
  const [employees, setEmployees] = useState(employeeService.getAllEmployees());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    employmentType: 'Vollzeit' as EmploymentType
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.password) {
      toast({
        title: "Fehler",
        description: "Bitte alle Felder ausfüllen.",
        variant: "destructive"
      });
      return;
    }

    const newEmployee = employeeService.createEmployee(
      formData.name,
      formData.password,
      formData.employmentType
    );

    setEmployees([...employees, newEmployee]);
    setFormData({ name: '', password: '', employmentType: 'Vollzeit' });
    setShowForm(false);
    
    toast({
      title: "Mitarbeiter erstellt",
      description: `${newEmployee.name} wurde erfolgreich angelegt.`
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Mitarbeiter wirklich löschen?')) {
      employeeService.deleteEmployee(id);
      setEmployees(employees.filter(emp => emp.id !== id));
      toast({
        title: "Mitarbeiter gelöscht",
        description: "Der Mitarbeiter wurde entfernt."
      });
    }
  };

  const getOvertimeColor = (hours: number) => {
    if (hours === 0) return 'text-gray-600';
    if (hours > 0) return 'text-orange-600';
    return 'text-blue-600';
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Mitarbeiterverwaltung</h1>
          <p className="text-sm text-muted-foreground">Mitarbeiter anlegen und verwalten</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Neuer Mitarbeiter
        </button>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Neuen Mitarbeiter anlegen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Max Mustermann"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passwort
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Passwort"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschäftigungsgrad
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Vollzeit">Vollzeit (38,5h/Woche, 7,7h/Tag, 30 Urlaubstage)</option>
                  <option value="Teilzeit">Teilzeit (20h/Woche, 4h/Tag, 15 Urlaubstage)</option>
                  <option value="Geringfügig">Geringfügig (10h/Woche, 2h/Tag, 5 Urlaubstage)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mitarbeiter anlegen
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beschäftigungsgrad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sollstunden/Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wochenstunden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urlaubstage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Überstunden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {employee.employmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock size={14} />
                        <span className="font-medium">{employee.dailyHours}h</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.weeklyHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {employee.remainingVacationDays} / {employee.vacationDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className={getOvertimeColor(employee.overtimeHours)} />
                        <span className={`text-sm font-semibold ${getOvertimeColor(employee.overtimeHours)}`}>
                          {employee.overtimeHours > 0 ? '+' : ''}{employee.overtimeHours.toFixed(1)}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Keine Mitarbeiter vorhanden</p>
                <p className="text-sm text-gray-400 mt-1">Legen Sie den ersten Mitarbeiter an</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Employees;