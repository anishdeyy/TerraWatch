import { api } from './api';
import { Project } from '../types';

export const projectService = {
  getProjects: async (params?: { project_type?: string; status?: string; search?: string }): Promise<Project[]> => {
    const res = await api.get<Project[]>('/projects', { params });
    return res.data;
  },

  getProject: async (id: number): Promise<Project> => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const res = await api.post<Project>('/projects', data);
    return res.data;
  },

  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    const res = await api.put<Project>(`/projects/${id}`, data);
    return res.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};
