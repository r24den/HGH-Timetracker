import { Project } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'projects';

const defaultProjects: Project[] = [
  { id: '1', name: 'Baustelle Nord', description: 'Neubau Wohnkomplex', isActive: true },
  { id: '2', name: 'Baustelle Süd', description: 'Sanierung Altbau', isActive: true },
  { id: '3', name: 'Baustelle Ost', description: 'Gewerbegebiet', isActive: true },
  { id: '4', name: 'Büro/Verwaltung', description: 'Administrative Tätigkeiten', isActive: true }
];

export const projectService = {
  getAllProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
      return defaultProjects;
    }
    return JSON.parse(data);
  },

  getActiveProjects: (): Project[] => {
    return projectService.getAllProjects().filter(p => p.isActive);
  },

  createProject: (name: string, description: string): Project => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      isActive: true
    };

    const projects = projectService.getAllProjects();
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    
    console.log('Neues Projekt erstellt:', newProject);
    return newProject;
  },

  updateProject: (project: Project): void => {
    const projects = projectService.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = project;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }
};