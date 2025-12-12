import React from 'react';
import { PipelineTabs } from './ui/PipelineTabs';
import { AppView } from '../types';
import { Bell, Search, UserCircle, ShieldCheck } from 'lucide-react';
import { AITutor } from './AITutor';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, isAdmin, toggleAdmin }) => {
  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-24 relative overflow-hidden bg-[#f8faff]">
      {/* Background Ambient Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation (Mobile/Desktop) */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-panel z-30 flex items-center justify-between px-6 md:pl-28">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
          <span className="font-semibold text-slate-800 tracking-tight hidden sm:block">SCL Academy</span>
        </div>
        
        <div className="flex items-center space-x-4">
           {/* Role Switcher for Demo */}
           <button 
             onClick={toggleAdmin}
             className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm transition-all"
           >
              {isAdmin ? <ShieldCheck size={14} className="text-blue-600" /> : <UserCircle size={14} className="text-emerald-600" />}
              <span className="text-xs font-medium">View: {isAdmin ? 'Admin' : 'Learner'}</span>
           </button>

          <div className="hidden md:flex items-center bg-slate-100/50 rounded-full px-4 py-1.5 border border-slate-200/50">
            <Search size={14} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm text-slate-600 placeholder-slate-400 w-32 lg:w-48 font-light"
            />
          </div>
          <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 border-2 border-white shadow-sm" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-6 max-w-7xl mx-auto min-h-screen">
        {children}
      </main>

      {/* Navigation */}
      <PipelineTabs currentView={currentView} onChange={onChangeView} isAdmin={isAdmin} />

      {/* AI Tutor Widget */}
      <AITutor />
    </div>
  );
};