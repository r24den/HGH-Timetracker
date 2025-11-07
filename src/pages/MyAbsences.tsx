import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';
import { absenceService } from '../services/absenceService';
import { Calendar, Check, Clock, X, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const MyAbsences = () => {
  const { currentUser } = useAuth();
  const absences = currentUser ? absenceService.getAbsencesByEmployee(currentUser.id) : [];

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

  const approvedAbsences = absences.filter(a => a.approved);
  const pendingAbsences = absences.filter(a => !a.approved);

  const totalTimeCompensation = approvedAbsences
    .filter(a => a.type === 'Zeitausgleich' && a.hours)
    .reduce((sum, a) => sum + (a.hours || 0), 0);

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold">Mein Urlaub</h1>
          <p className="text-sm text-muted-foreground">Übersicht Ihrer Urlaubstage und Abwesenheiten</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="text-green-600" size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Resturlaub</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {currentUser?.remainingVacationDays} Tage
              </p>
              <p className="text-sm text-gray-500 mt-1">
                von {currentUser?.vacationDays} Tagen
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${currentUser && currentUser.overtimeHours >= 0 ? 'bg-orange-100' : 'bg-red-100'} p-2 rounded-lg`}>
                  <Clock className={currentUser && currentUser.overtimeHours >= 0 ? 'text-orange-600' : 'text-red-600'} size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Überstunden</h3>
              </div>
              <p className={`text-3xl font-bold ${currentUser && currentUser.overtimeHours >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                {currentUser && currentUser.overtimeHours >= 0 ? '+' : ''}{currentUser?.overtimeHours.toFixed(1)}h
              </p>
              {currentUser && currentUser.overtimeHours < 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Werden mit neuen Überstunden verrechnet
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Check className="text-blue-600" size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Genehmigt</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {approvedAbsences.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Abwesenheiten</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingDown className="text-green-600" size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Zeitausgleich</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {totalTimeCompensation.toFixed(1)}h
              </p>
              <p className="text-sm text-gray-500 mt-1">Genommen</p>
            </div>
          </div>

          {currentUser && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Urlaubsanspruch</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{
                    width: `${Math.max(0, (currentUser.remainingVacationDays / currentUser.vacationDays) * 100)}%`
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round(Math.max(0, (currentUser.remainingVacationDays / currentUser.vacationDays) * 100))}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {pendingAbsences.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-orange-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="text-orange-600" size={20} />
                  Ausstehende Genehmigungen
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingAbsences.map((absence) => (
                      <tr key={absence.id} className="hover:bg-gray-50">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-green-50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Check className="text-green-600" size={20} />
                Genehmigte Abwesenheiten
              </h2>
            </div>
            {approvedAbsences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {approvedAbsences.map((absence) => (
                      <tr key={absence.id} className="hover:bg-gray-50">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500">Keine genehmigten Abwesenheiten</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyAbsences;