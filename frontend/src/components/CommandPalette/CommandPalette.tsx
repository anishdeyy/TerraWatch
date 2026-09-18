import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Compass,
  FolderPlus,
  PlusCircle,
  Sparkles,
  FileText,
  CreditCard,
  History,
  X,
  MapPin,
  Trees
} from 'lucide-react';
import { api } from '../../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateProject?: () => void;
  onOpenCreateSite?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCreateProject,
  onOpenCreateSite
}) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live dynamic search from backend
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(search.trim())}`);
        setSearchResults(res.data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  if (!isOpen) return null;

  const defaultCommands = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { label: 'Open Map Explorer', icon: Compass, action: () => navigate('/map') },
    { label: 'Browse Projects', icon: FolderPlus, action: () => navigate('/projects') },
    { label: 'Ask TerraWatch AI', icon: Sparkles, action: () => navigate('/ai') },
    { label: 'Generate Environmental Report', icon: FileText, action: () => navigate('/reports') },
    { label: 'View Subscription Pricing', icon: CreditCard, action: () => navigate('/pricing') },
    { label: 'View Order History', icon: History, action: () => navigate('/orders') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, sites, coordinates, or type command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2 max-h-80 overflow-y-auto">
          {/* Dynamic Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-2">
              <span className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Found Results
              </span>
              {searchResults.map((item, idx) => (
                <button
                  key={`res-${idx}`}
                  onClick={() => {
                    navigate(item.link);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 text-left text-sm text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.category === 'project' ? (
                      <Trees className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <MapPin className="w-4 h-4 text-blue-600" />
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                    </div>
                  </div>
                  {item.status && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {item.status}
                    </span>
                  )}
                </button>
              ))}
              <div className="border-t border-slate-100 my-1"></div>
            </div>
          )}

          {/* Default Commands */}
          <span className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Navigation Commands
          </span>
          {defaultCommands
            .filter(c => c.label.toLowerCase().includes(search.toLowerCase()))
            .map((cmd, idx) => (
              <button
                key={`cmd-${idx}`}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-left text-sm font-medium text-slate-700 hover:text-emerald-900 transition-colors"
              >
                <cmd.icon className="w-4 h-4 text-slate-400" />
                <span>{cmd.label}</span>
              </button>
            ))}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Use <b>Esc</b> to close</span>
          <span><b>Ctrl + K</b></span>
        </div>
      </div>
    </div>
  );
};
