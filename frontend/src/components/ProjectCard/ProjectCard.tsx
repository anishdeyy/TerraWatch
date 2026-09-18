import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, MapPin, Trees, ArrowRight, Shield } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'CARBON':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'BIODIVERSITY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'AGROFORESTRY':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REFORESTATION':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeColor(project.project_type)}`}>
            {project.project_type}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {project.status}
          </span>
        </div>

        <h3 className="font-bold text-base text-slate-900 line-clamp-1 mb-1.5">
          {project.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {project.description || 'Comprehensive ecological project.'}
        </p>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Area</span>
            <span className="font-bold text-slate-800">{project.total_area_hectares} ha</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Managed Sites</span>
            <span className="font-bold text-slate-800">{project.site_count} Sites</span>
          </div>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
        >
          <span>Inspect Project Dossier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
