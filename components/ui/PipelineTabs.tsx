import React from 'react';
import { AppView } from '../../types';
import { Home, BookOpen, PenTool, BarChart2, User, Headphones } from 'lucide-react';

interface PipelineTabsProps {
  currentView: AppView;
  onChange: (view: AppView) => void;
  isAdmin: boolean;
}

export const PipelineTabs: React.FC<PipelineTabsProps> = ({ currentView, onChange, isAdmin }) => {
  const tabs = [
    { id: AppView.DASHBOARD, label: 'Home', icon: Home, visible: true },
    { id: AppView.COURSES, label: 'Courses', icon: BookOpen, visible: !isAdmin },
    { id: AppView.PODCAST, label: 'Podcasts', icon: Headphones, visible: true },
    { id: AppView.CREATE, label: 'Create', icon: PenTool, visible: isAdmin },
    { id: AppView.ANALYTICS, label: 'Analytics', icon: BarChart2, visible: true },
    { id: AppView.PROFILE, label: 'Profile', icon: User, visible: true },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-panel rounded-full px-2 py-2 flex items-center space-x-1 shadow-2xl shadow-blue-900/10">
        {tabs.filter(t => t.visible).map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                relative px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300
                ${isActive ? 'text-blue-700 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}
              `}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-sm font-medium ${isActive ? 'opacity-100' : 'hidden md:block'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};