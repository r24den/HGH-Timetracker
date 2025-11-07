import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { timeService } from '../services/timeService';
import { Users, Clock, TrendingUp, Calendar, Code } from 'lucide-react';

const AdminDashboard = () => {
  const employees = employeeService.getAllEmployees();
  const allEntries = timeService.getAllEntries();
  
  const totalOvertime = employees.reduce((sum, emp) => sum + emp.overtimeHours, 0);
  const activeEntries = allEntries.filter(entry => !entry.clockOut).length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyHours = allEntries
    .filter(entry => {
      const date = new Date(entry.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, entry) => sum + entry.totalHours, 0);

  const stats = [
    {
      title: 'Mitarbeiter',
      value: employees.length,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Registrierte Mitarbeiter'
    },
    {
      title: 'Zeiteinträge',
      value: allEntries.length,
      icon: Clock,
      color: 'bg-green-500',
      description: 'Erfasste Arbeitszeiten'
    },
    {
      title: 'Überstunden',
      value: `${totalOvertime.toFixed(1)}h`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'Gesamt'
    },
    {
      title: 'Monatsstunden',
      value: `${monthlyHours.toFixed(1)}h`,
      icon: Calendar,
      color: 'bg-purple-500',
      description: 'Aktueller Monat'
    }
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold">Übersicht</h1>
          <p className="text-sm text-muted-foreground">Willkommen im Admin-Dashboard</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Aktuelle Mitarbeiter</h2>
            <div className="space-y-3">
              {employees.slice(0, 5).map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.employmentType} - {employee.dailyHours}h/Tag</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${employee.overtimeHours >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {employee.overtimeHours >= 0 ? '+' : ''}{employee.overtimeHours.toFixed(1)}h
                    </p>
                    <p className="text-xs text-gray-500">Überstunden</p>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <p className="text-center text-gray-500 py-4">Keine Mitarbeiter vorhanden</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Schnellzugriff</h2>
            <div className="space-y-3">
              <Link
                to="/employees"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-blue-900">Mitarbeiter verwalten</p>
                    <p className="text-sm text-blue-700">Neue Mitarbeiter anlegen</p>
                  </div>
                </div>
              </Link>
              <Link
                to="/time-tracking"
                className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-900">Zeiterfassung</p>
                    <p className="text-sm text-green-700">Arbeitszeiten erfassen und verwalten</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Entwicklernotiz */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gray-200 p-3 rounded-lg">
              <Code className="text-gray-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Entwicklerinformation</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>App-Entwickler:</strong> Lars Meyer-Brandt</p>
                <p><strong>Version:</strong> 1.0.0 (Stand 2025)</p>
                <p className="pt-2 border-t border-gray-300 mt-2">
                  © 2025 Lars Meyer-Brandt. Alle Rechte vorbehalten.<br />
                  Alle Urheberrechte an dieser Software liegen bei Lars Meyer-Brandt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;