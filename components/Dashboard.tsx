import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { Play, Award, Zap, TrendingUp } from 'lucide-react';
import { User, Course } from '../types';

interface DashboardProps {
  user: User;
  courses: Course[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, courses }) => {
  // Recommend top 3 courses
  const recommendedCourses = courses.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-3xl font-light text-slate-900 mb-2">
          Welcome back, <span className="font-medium">{user.name}</span>
        </h1>
        <p className="text-slate-500 font-light mb-8 max-w-lg">
          You are on a <span className="text-orange-500 font-medium">{user.streak} day streak</span>. 
          Let's continue optimizing your sustainable logistics path.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="col-span-2 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
                In Progress
              </span>
              <h2 className="text-2xl font-light text-slate-800 mb-2">Sustainable Site Logistics Level 2</h2>
              <div className="w-full bg-slate-100 h-1 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-blue-600 w-[65%]" />
              </div>
              <p className="text-slate-500 text-sm mb-6 font-light">
                Next: Waste management optimization protocols.
              </p>
              <button className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 transition-colors">
                <div className="w-8 h-8 rounded-full border border-blue-200 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </div>
                <span className="text-sm font-medium">Continue Learning</span>
              </button>
            </div>
            {/* Background decoration */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Award size={20} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-light text-slate-800">{user.xp}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Total XP</div>
              </div>
            </GlassCard>
            <GlassCard className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-orange-50 text-orange-500">
                <Zap size={20} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-light text-slate-800">{user.streak}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Day Streak</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-normal text-slate-800">Recommended for you</h2>
          <button className="text-sm text-blue-600 hover:underline">View all</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course, idx) => (
            <GlassCard key={idx} hoverEffect className="group cursor-pointer">
              <div className={`w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4`}>
                <TrendingUp size={18} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span>{course.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{course.duration || '30 min'}</span>
              </div>
            </GlassCard>
          ))}
          {recommendedCourses.length === 0 && (
             <p className="text-slate-400 font-light text-sm col-span-full">No specific courses available for your region yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};