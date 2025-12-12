import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Users, BookOpen, TrendingUp, AlertCircle, Plus, MapPin, ArrowRight } from 'lucide-react';
import { Area } from '../types';

interface AdminDashboardProps {
  onCreateClick: () => void;
  areas: Area[];
  onCreateArea: (name: string) => void;
  totalCourses: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCreateClick, areas, onCreateArea, totalCourses }) => {
  const [newAreaName, setNewAreaName] = useState('');

  const handleCreate = () => {
    if (newAreaName.trim()) {
      onCreateArea(newAreaName);
      setNewAreaName('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <section>
        <h1 className="text-3xl font-light text-slate-900 mb-2">
          Admin Overview
        </h1>
        <p className="text-slate-500 font-light mb-8">
          Manage team training, monitor progress, and configure regional areas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-slate-500 uppercase">Active Learners</p>
              <p className="text-2xl font-medium text-slate-800">42</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
          </GlassCard>
           <GlassCard className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-slate-500 uppercase">Courses Live</p>
              <p className="text-2xl font-medium text-slate-800">{totalCourses}</p>
            </div>
             <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BookOpen size={20} />
            </div>
          </GlassCard>
          <GlassCard className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-slate-500 uppercase">Avg. Completion</p>
              <p className="text-2xl font-medium text-slate-800">85%</p>
            </div>
             <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <TrendingUp size={20} />
            </div>
          </GlassCard>
          <GlassCard className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 transition-colors border-dashed border-2 border-blue-200" onClick={onCreateClick}>
             <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <Plus size={18} />
                </div>
                <span className="font-medium text-blue-700">New Course</span>
             </div>
          </GlassCard>
        </div>
      </section>

      {/* Area Management Section */}
      <section>
        <h2 className="text-lg font-medium text-slate-800 mb-4 flex items-center space-x-2">
          <MapPin size={18} className="text-blue-600" />
          <span>Area Management</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="col-span-1 bg-white/60">
             <h3 className="text-sm font-semibold text-slate-700 mb-4">Add New Area</h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-xs text-slate-500 mb-1">City Name</label>
                 <input 
                    type="text" 
                    placeholder="e.g. Köln" 
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                 />
                 {newAreaName && (
                   <p className="text-[10px] text-slate-400 mt-2">
                     Auto-generated Code: <span className="font-mono text-blue-600 font-medium">{newAreaName.substring(0, 2).toUpperCase()}1</span>
                   </p>
                 )}
               </div>
               <button 
                onClick={handleCreate}
                disabled={!newAreaName.trim()}
                className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors"
               >
                 Create Area
               </button>
             </div>
          </GlassCard>

          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
             {areas.map((area) => (
               <GlassCard key={area.id} className="flex flex-col justify-center items-center text-center p-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-2 border border-blue-100">
                    {area.code}
                  </div>
                  <h4 className="text-sm font-medium text-slate-800">{area.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Active Region</p>
               </GlassCard>
             ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-medium text-slate-800">Team Progress</h2>
            {[
                { name: 'Sarah Miller', role: 'Site Engineer', course: 'Sustainable Logistics L2', progress: 75, status: 'On Track' },
                { name: 'David Chen', role: 'Logistics Manager', course: 'Compliance Basics', progress: 30, status: 'Delayed' },
                { name: 'Marcus Berg', role: 'Site Engineer', course: 'Crane Coordination', progress: 90, status: 'On Track' },
                { name: 'Lena Weber', role: 'SME', course: 'Construction 4.0', progress: 100, status: 'Completed' },
            ].map((user, i) => (
                <GlassCard key={i} className="flex items-center justify-between p-4 hover:bg-white/60 transition-colors">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-800">{user.name}</h3>
                            <p className="text-xs text-slate-500">{user.course}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                         <div className="w-24 bg-slate-100 rounded-full h-1.5">
                             <div className={`h-1.5 rounded-full ${user.status === 'Delayed' ? 'bg-orange-400' : 'bg-emerald-500'}`} style={{ width: `${user.progress}%` }} />
                         </div>
                         <span className={`text-xs px-2 py-1 rounded-full ${user.status === 'Delayed' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {user.status}
                         </span>
                    </div>
                </GlassCard>
            ))}
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-medium text-slate-800">Needs Attention</h2>
            <GlassCard className="bg-red-50/50 border-red-100">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="text-red-500 mt-1" size={18} />
                    <div>
                        <h4 className="text-sm font-medium text-red-700">Low Engagement Alert</h4>
                        <p className="text-xs text-red-600/80 mt-1 leading-relaxed">
                            3 Site Engineers haven't started "Safety Protocols" assigned 2 weeks ago.
                        </p>
                        <button className="mt-3 text-xs font-medium text-red-700 underline">Send Reminder</button>
                    </div>
                </div>
            </GlassCard>
        </section>
      </div>
    </div>
  );
};