import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FolderKanban, CheckCircle } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { Project, ProjectType } from '../../types';
import { ProjectCard } from '../../components/ProjectCard/ProjectCard';
import { useAuth } from '../../context/AuthContext';

export const Projects: React.FC = () => {
  const { isAnalyst } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('REFORESTATION');
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects({
        search: search || undefined,
        project_type: typeFilter || undefined
      });
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await projectService.createProject({
        name,
        description,
        project_type: projectType,
        status: 'ACTIVE'
      });
      setName('');
      setDescription('');
      setShowCreateModal(false);
      await loadProjects();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Environmental Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage carbon sequestration, biodiversity corridors, and agroforestry programs
          </p>
        </div>

        {isAnalyst && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProjects()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        >
          <option value="">All Project Types</option>
          <option value="REFORESTATION">Reforestation</option>
          <option value="AGROFORESTRY">Agroforestry</option>
          <option value="BIODIVERSITY">Biodiversity</option>
          <option value="CARBON">Carbon Storage</option>
          <option value="CONSERVATION">Conservation</option>
          <option value="RESTORATION">Restoration</option>
        </select>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Environmental Project</h3>
            <p className="text-xs text-slate-500 mb-4">Set up a new carbon and biodiversity monitoring initiative</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aravalli Ridge Rewilding Corridor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Project Classification</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="REFORESTATION">Reforestation</option>
                  <option value="AGROFORESTRY">Agroforestry</option>
                  <option value="BIODIVERSITY">Biodiversity</option>
                  <option value="CARBON">Carbon Storage</option>
                  <option value="CONSERVATION">Conservation</option>
                  <option value="RESTORATION">Restoration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Primary ecological goals, species inventory targets, and regional context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
