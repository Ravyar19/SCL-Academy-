import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

const data = [
  { name: 'Sustainability', value: 85, fullMark: 100 },
  { name: 'Logistics', value: 92, fullMark: 100 },
  { name: 'Safety', value: 78, fullMark: 100 },
  { name: 'Compliance', value: 95, fullMark: 100 },
  { name: 'Innovation', value: 65, fullMark: 100 },
];

const activityData = [
  { day: 'Mon', hours: 2 },
  { day: 'Tue', hours: 3.5 },
  { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 4 },
  { day: 'Fri', hours: 3 },
  { day: 'Sat', hours: 1 },
  { day: 'Sun', hours: 0.5 },
];

interface AnalyticsProps {
  isAdmin?: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ isAdmin = false }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <h2 className="text-2xl font-light text-slate-800 mb-4">
        {isAdmin ? 'Team Performance Analytics' : 'Personal Performance Analytics'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-wide">
             {isAdmin ? 'Team Skill Gaps' : 'My Skill Distribution'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e2e8f0" strokeWidth={0.5} />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-sm font-medium text-slate-500 mb-6 uppercase tracking-wide">
             {isAdmin ? 'Team Activity (Avg Hours)' : 'Weekly Activity'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#3b82f6" 
                  radius={[4, 4, 4, 4]} 
                  barSize={32}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="flex flex-col md:flex-row items-center justify-between p-8 bg-gradient-to-r from-blue-900 to-blue-800 text-white !border-none">
        <div>
          <h3 className="text-xl font-light mb-2">
             {isAdmin ? 'Improve Team Performance' : 'Ready to level up?'}
          </h3>
          <p className="text-blue-200 text-sm font-light max-w-md">
             {isAdmin 
                ? 'Assign the "Advanced Compliance" module to bridge the skill gap in Safety.' 
                : 'Your logistics score is in the top 15%. Take the "Advanced Compliance" certification to reach Expert level.'}
          </p>
        </div>
        <button className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-900 rounded-xl font-medium text-sm hover:bg-blue-50 transition-colors shadow-lg">
           {isAdmin ? 'Assign Course' : 'Start Certification'}
        </button>
      </GlassCard>
    </div>
  );
};