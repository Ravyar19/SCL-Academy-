import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CourseCreator } from './components/CourseCreator';
import { Analytics } from './components/Analytics';
import { PodcastStudio } from './components/PodcastStudio';
import { AppView, UserRole, User, Area, Course, Podcast } from './types';
import { GlassCard } from './components/ui/GlassCard';
import { MapPin } from 'lucide-react';

// --- Mock Data Initialization ---

const INITIAL_AREAS: Area[] = [
  { id: 'a1', name: 'München', code: 'MU1' },
  { id: 'a2', name: 'Berlin', code: 'BE1' },
  { id: 'a3', name: 'Hamburg', code: 'HA1' }
];

const INITIAL_COURSES: Course[] = [
  { 
    id: 'c1', 
    title: "Advanced Crane Coordination", 
    description: "Master the coordination of multiple cranes on complex sites.",
    category: "Logistics", 
    duration: "45 min", 
    difficulty: 'Advanced', 
    progress: 0, 
    chapters: [], 
    areaId: undefined 
  }, // Public
  { 
    id: 'c2', 
    title: "SCL Environmental Compliance", 
    description: "Detailed guide on environmental compliance for SCL projects.",
    category: "Sustainability", 
    duration: "30 min", 
    difficulty: 'Intermediate', 
    progress: 0, 
    chapters: [], 
    areaId: 'a1' 
  }, // Munich only
  { 
    id: 'c3', 
    title: "Berlin City Regulations", 
    description: "Navigate specific construction regulations in Berlin.",
    category: "Compliance", 
    duration: "60 min", 
    difficulty: 'Beginner', 
    progress: 0, 
    chapters: [], 
    areaId: 'a2' 
  }, // Berlin only
  { 
    id: 'c4', 
    title: "Construction 4.0 Basics", 
    description: "Introduction to digital tools and automation in construction.",
    category: "Innovation", 
    duration: "60 min", 
    difficulty: 'Beginner', 
    progress: 0, 
    chapters: [], 
    areaId: undefined 
  } // Public
];

const INITIAL_PODCASTS: Podcast[] = [
  { id: 'p1', title: 'Weekly Site Briefing', duration: '12:00', date: 'Oct 24', areaId: undefined, description: 'General updates for all sites.' },
  { id: 'p2', title: 'Munich Traffic Updates', duration: '05:30', date: 'Oct 23', areaId: 'a1', description: 'Specific logistic routes for MU1.' }
];

const mockUserBase: User = {
  id: 'u1',
  name: 'Alex Weber',
  role: UserRole.ENGINEER,
  xp: 1240,
  streak: 12,
  areaId: 'a1' // Default to Munich
};

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // --- Centralized State ---
  const [user, setUser] = useState<User>(mockUserBase);
  const [areas, setAreas] = useState<Area[]>(INITIAL_AREAS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [podcasts, setPodcasts] = useState<Podcast[]>(INITIAL_PODCASTS);

  // --- Actions ---

  const handleCreateArea = (name: string) => {
    // Generate code: First 2 chars uppercase + '1' (simple logic for now)
    const code = name.substring(0, 2).toUpperCase() + '1';
    const newArea: Area = {
      id: `a${Date.now()}`,
      name,
      code
    };
    setAreas([...areas, newArea]);
  };

  const handleCreateCourse = (course: Course) => {
    setCourses([...courses, course]);
    setCurrentView(AppView.DASHBOARD); // Return to dashboard after create
  };

  const handlePublishPodcast = (podcast: Podcast) => {
    setPodcasts([podcast, ...podcasts]);
  };

  const toggleAdmin = () => {
    setIsAdmin(prev => !prev);
    setCurrentView(AppView.DASHBOARD);
  };

  // --- Filtering Logic ---
  const getFilteredContent = <T extends { areaId?: string }>(content: T[]): T[] => {
    if (isAdmin) return content; // Admin sees all
    return content.filter(item => !item.areaId || item.areaId === user.areaId);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return isAdmin 
          ? <AdminDashboard 
              onCreateClick={() => setCurrentView(AppView.CREATE)} 
              areas={areas}
              onCreateArea={handleCreateArea}
              totalCourses={courses.length}
            /> 
          : <Dashboard 
              user={user} 
              courses={getFilteredContent(courses)}
            />;
          
      case AppView.CREATE:
        if (!isAdmin) return <Dashboard user={user} courses={getFilteredContent(courses)} />;
        return (
          <CourseCreator 
            areas={areas}
            onSave={handleCreateCourse}
          />
        );
        
      case AppView.ANALYTICS:
        return <Analytics isAdmin={isAdmin} />;

      case AppView.PODCAST:
        return (
          <PodcastStudio 
            isAdmin={isAdmin}
            areas={areas}
            podcasts={getFilteredContent(podcasts)}
            onPublish={handlePublishPodcast}
          />
        );
        
      case AppView.COURSES:
         if (isAdmin) return <AdminDashboard onCreateClick={() => setCurrentView(AppView.CREATE)} areas={areas} onCreateArea={handleCreateArea} totalCourses={courses.length}/>;
        return (
          <div className="flex flex-col items-center min-h-[60vh] text-slate-400 font-light animate-in fade-in max-w-4xl mx-auto w-full">
             <div className="w-full mb-8">
               <h2 className="text-xl font-medium text-slate-800 mb-2">Course Library</h2>
               <p className="text-slate-500 text-sm">Training modules available for {user.areaId ? areas.find(a => a.id === user.areaId)?.code : 'All Regions'}.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                 {getFilteredContent(courses).map(course => (
                   <GlassCard key={course.id} hoverEffect className="text-left group cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                         <span className={`text-[10px] px-2 py-0.5 rounded-full border ${!course.areaId ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                           {!course.areaId ? 'Public' : areas.find(a => a.id === course.areaId)?.code}
                         </span>
                         <span className="text-xs text-slate-400">{course.difficulty}</span>
                       </div>
                       <h3 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{course.title}</h3>
                       <p className="text-xs text-slate-500 mt-1">{course.category} • {course.duration || 'Flexible'}</p>
                   </GlassCard>
                 ))}
             </div>
          </div>
        );
        
      case AppView.PROFILE:
        return (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
             <GlassCard className="text-center relative overflow-hidden">
               <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 mx-auto mb-4 border-4 border-white shadow-lg" />
               <h2 className="text-2xl font-medium text-slate-800">{isAdmin ? 'Admin User' : user.name}</h2>
               <p className="text-slate-500 font-light mb-6">{isAdmin ? 'System Administrator' : user.role}</p>
               
               {/* Area Selector for Demo Purposes */}
               {!isAdmin && (
                 <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">My Area Assignment</label>
                    <div className="flex flex-wrap justify-center gap-2">
                      {areas.map(area => (
                        <button
                          key={area.id}
                          onClick={() => setUser({...user, areaId: area.id})}
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1
                            ${user.areaId === area.id 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}
                          `}
                        >
                          <MapPin size={12} />
                          <span>{area.name} ({area.code})</span>
                        </button>
                      ))}
                    </div>
                 </div>
               )}

               {!isAdmin && (
               <div className="flex justify-center space-x-8 text-center border-t border-slate-100 pt-6">
                 <div>
                   <div className="text-xl font-semibold text-slate-800">{user.xp}</div>
                   <div className="text-xs text-slate-400 uppercase">XP</div>
                 </div>
                 <div>
                   <div className="text-xl font-semibold text-slate-800">{user.streak}</div>
                   <div className="text-xs text-slate-400 uppercase">Streak</div>
                 </div>
                 <div>
                   <div className="text-xl font-semibold text-slate-800">8</div>
                   <div className="text-xs text-slate-400 uppercase">Certificates</div>
                 </div>
               </div>
               )}
               
               {isAdmin && (
                 <div className="border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-500">System Status: <span className="text-emerald-600 font-medium">Operational</span></p>
                 </div>
               )}
             </GlassCard>
          </div>
        );
      default:
        return <Dashboard user={user} courses={getFilteredContent(courses)} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView} 
      isAdmin={isAdmin} 
      toggleAdmin={toggleAdmin}
    >
      {renderView()}
    </Layout>
  );
}

export default App;