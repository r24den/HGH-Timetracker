import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { projectService } from '../services/projectService';
import { timeService } from '../services/timeService';
import { Plus, FolderKanban, Clock, Edit, Trash2, Check, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Projects = () => {
  const [projects, setProjects] = useState(projectService.getAllProjects());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [editData, setEditData] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Fehler",
        description: "Bitte Projektname eingeben.",
        variant: "destructive"
      });
      return;
    }

    const newProject = projectService.createProject(formData.name, formData.description);
    setProjects(projectService.getAllProjects());
    setFormData({ name: '', description: '' });
    setShowForm(false);
    
    toast({
      title: "Projekt erstellt",
      description: `${newProject.name} wurde erfolgreich angelegt.`
    });
  };

  const handleEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditData({
        name: project.name,
        description: project.description
      });
      setEditingId(projectId);
    }
  };

  const handleSaveEdit = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.name = editData.name;
      project.description = editData.description;
      projectService.updateProject(project);
      setProjects(projectService.getAllProjects());
      setEditingId(null);
      
      toast({
        title: "Projekt aktualisiert",
        description: `${project.name} wurde erfolgreich geändert.`
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', description: '' });
  };

  const handleDelete = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (confirm(`Projekt "${project?.name}" wirklich löschen? Alle zugehörigen Zeiteinträge behalten das Projekt als Referenz.`)) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
      
      toast({
        title: "Projekt gelöscht",
        description: "Das Projekt wurde entfernt."
      });
    }
  };

  const getProjectHours = (projectId: string) => {
    const entries = timeService.getAllEntries();
    return entries
      .filter(entry => entry.projectId === projectId)
      .reduce((sum, entry) => sum + entry.totalHours, 0);
  };

  const toggleProjectStatus = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.isActive = !project.isActive;
      projectService.updateProject(project);
      setProjects(projectService.getAllProjects());
      
      toast({
        title: project.isActive ? "Projekt aktiviert" : "Projekt deaktiviert",
        description: `${project.name} wurde ${project.isActive ? 'aktiviert' : 'deaktiviert'}.`
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b bg-white px-6 py-4">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Projektverwaltung</h1>
          <p className="text-sm text-muted-foreground">Projekte und Baustellen verwalten</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Neues Projekt
        </button>
      </header>
      
      <main className="flex-1 overflow-auto p-6 bg-gray-50">
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Neues Projekt anlegen</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projektname
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Baustelle West"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Projektbeschreibung"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Projekt anlegen
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const totalHours = getProjectHours(project.id);
            const isEditing = editingId === project.id;
            
            return (
              <div
                key={project.id}
                className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${
                  project.isActive ? 'border-gray-200' : 'border-gray-300 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${project.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FolderKanban className={project.isActive ? 'text-blue-600' : 'text-gray-400'} size={24} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleProjectStatus(project.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        project.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {project.isActive ? 'Aktiv' : 'Inaktiv'}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Projektname"
                    />
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Beschreibung"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(project.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Check size={16} />
                        Speichern
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                      {project.description || 'Keine Beschreibung'}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t mb-4">
                      <Clock size={16} />
                      <span className="font-medium">{totalHours.toFixed(1)}h</span>
                      <span className="text-gray-500">erfasst</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <Edit size={16} />
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <FolderKanban className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500">Keine Projekte vorhanden</p>
            <p className="text-sm text-gray-400 mt-1">Legen Sie das erste Projekt an</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;