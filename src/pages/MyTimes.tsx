import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';
import { timeService } from '../services/timeService';
import { projectService } from '../services/projectService';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const MyTimes = () => {
  const { currentUser } = useAuth();
  const entries = currentUser ? timeService.getEntriesByEmployee(currentUser.id) : [];
  const projects = projectService.getAllProjects();

  const getProjectName = (projectId?: string) => {
    if (!projectId) return '-';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unbekannt';
  };

  const getTotalHours = () => {
    return entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  };

  const getCurrentMonthHours = () => {
    const now = new Date();
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === now.getMonth() && 
               entryDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, entry) => sum + entry.totalHours, 0);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold">Meine Zeiten</h1>
          <p className="text-sm text-muted-foreground">Übersicht Ihrer geleisteten Arbeitszeiten</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Aktueller Monat</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {getCurrentMonthHours().toFixed(1)}h
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="text-green-600" size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Gesamt</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {getTotalHours().toFixed(1)}h
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Clock className="text-orange-600" size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Überstunden</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {currentUser?.overtimeHours.toFixed(1)}h
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Zeiteinträge</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beginn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ende
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pause
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arbeitsstunden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projekt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {format(new Date(entry.date), 'dd.MM.yyyy', { locale: de })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.clockIn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.clockOut || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.breakMinutes} Min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-600">
                          {entry.totalHours.toFixed(2)}h
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getProjectName(entry.projectId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {entries.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500">Keine Zeiteinträge vorhanden</p>
                  <p className="text-sm text-gray-400 mt-1">Ihre erfassten Arbeitszeiten erscheinen hier</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyTimes;