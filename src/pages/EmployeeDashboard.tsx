import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';
import { timeService } from '../services/timeService';
import { projectService } from '../services/projectService';
import { Clock, Plus, Calendar } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const EmployeeDashboard = () => {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:00',
    clockOut: '16:00',
    breakMinutes: 30,
    projectId: ''
  });
  const { toast } = useToast();

  const projects = projectService.getActiveProjects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;

    if (!formData.date || !formData.clockIn || !formData.clockOut) {
      toast({
        title: "Fehler",
        description: "Bitte alle Felder ausfüllen.",
        variant: "destructive"
      });
      return;
    }

    const entry = timeService.createManualEntry(
      currentUser.id,
      formData.date,
      formData.clockIn,
      formData.clockOut,
      formData.breakMinutes,
      formData.projectId || undefined
    );

    setFormData({
      date: new Date().toISOString().split('T')[0],
      clockIn: '08:00',
      clockOut: '16:00',
      breakMinutes: 30,
      projectId: ''
    });
    setShowForm(false);
    
    toast({
      title: "Arbeitszeit erfasst",
      description: `${entry.totalHours.toFixed(2)} Stunden wurden eingetragen.`
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Zeiterfassung</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Arbeitszeit erfassen
        </button>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {showForm && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6">Arbeitszeit manuell erfassen</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projekt (optional)
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Kein Projekt</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arbeitsbeginn *
                    </label>
                    <input
                      type="time"
                      value={formData.clockIn}
                      onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arbeitsende *
                    </label>
                    <input
                      type="time"
                      value={formData.clockOut}
                      onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pausenzeit (Minuten)
                    </label>
                    <input
                      type="number"
                      value={formData.breakMinutes}
                      onChange={(e) => setFormData({ ...formData, breakMinutes: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Arbeitszeit speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Überstunden</h3>
              <p className="text-3xl font-bold text-orange-600">
                {currentUser?.overtimeHours.toFixed(1)}h
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Basierend auf {currentUser?.dailyHours}h/Tag
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Resturlaub</h3>
              <p className="text-3xl font-bold text-green-600">
                {currentUser?.remainingVacationDays} Tage
              </p>
              <p className="text-xs text-gray-500 mt-1">
                von {currentUser?.vacationDays} Tagen
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sollstunden/Tag</h3>
              <p className="text-3xl font-bold text-blue-600">
                {currentUser?.dailyHours}h
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentUser?.employmentType}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-full">
                <Clock size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Manuelle Zeiterfassung</h2>
                <p className="text-blue-100">Tragen Sie Ihre Arbeitszeiten nachträglich ein</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <p className="text-sm">
                <strong>Hinweis:</strong> Erfassen Sie Ihre Arbeitszeiten manuell, um Fehler wie vergessenes Ausstempeln zu vermeiden. 
                Überstunden werden automatisch basierend auf Ihren Sollstunden ({currentUser?.dailyHours}h/Tag) berechnet.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;