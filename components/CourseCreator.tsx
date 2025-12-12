import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { generatePodcastScript, generatePodcastAudio, generateSlideDeck, generateEducationalText, generateVideo, refineText } from '../services/geminiService';
import { Course, Chapter, CourseModule, ModuleType, ContentBlock, BlockType, Area } from '../types';
import { 
  Headphones, FileText, LayoutTemplate, Plus, Play, Pause, 
  Loader2, Save, Trash2, Mic2, Folder, ChevronRight, ChevronDown, 
  Settings, Sparkles, Layout, Image as ImageIcon, Type, Heading, MoreVertical, GripVertical, Video as VideoIcon, AlignLeft, Wand2, Globe, MapPin
} from 'lucide-react';

interface CourseCreatorProps {
  areas: Area[];
  onSave?: (course: Course) => void;
}

export const CourseCreator: React.FC<CourseCreatorProps> = ({ areas, onSave }) => {
  // --- State ---
  const [course, setCourse] = useState<Course>({
    id: `c${Date.now()}`,
    title: 'Untitled Course',
    description: '',
    category: 'Logistics',
    difficulty: 'Intermediate',
    progress: 0,
    areaId: undefined, // Default Public
    chapters: [
      { 
        id: 'c1', 
        title: 'Chapter 1: Foundations', 
        sourceContent: '',
        modules: [
          {
            id: 'm1',
            title: 'Welcome to Logistics',
            type: ModuleType.MIXED,
            duration: '5 min',
            completed: false,
            blocks: [
              { id: 'b1', type: 'heading', content: 'Introduction to Sustainable Logistics' },
              { id: 'b2', type: 'text', content: 'This course covers the essential protocols for reducing waste and optimizing crane usage on urban sites.' }
            ]
          }
        ] 
      }
    ]
  });

  const [activeChapterId, setActiveChapterId] = useState<string>('c1');
  const [activeModuleId, setActiveModuleId] = useState<string | null>('m1');
  
  // Processing States (Global for toolbar feedback)
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Audio Playback
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [playingBlockId, setPlayingBlockId] = useState<string | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // --- Helpers ---
  const activeChapter = course.chapters.find(c => c.id === activeChapterId);
  const activeModule = activeChapter?.modules.find(m => m.id === activeModuleId);

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const updateModule = (chapterId: string, moduleId: string, updates: Partial<CourseModule>) => {
    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => 
        c.id === chapterId ? {
          ...c,
          modules: c.modules.map(m => m.id === moduleId ? { ...m, ...updates } : m)
        } : c
      )
    }));
  };

  const addBlock = (type: BlockType, content: string = '', metadata?: any) => {
    if (!activeModule || !activeChapter) return;
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content,
      metadata
    };
    updateModule(activeChapter.id, activeModule.id, {
      blocks: [...activeModule.blocks, newBlock]
    });
    return newBlock.id;
  };

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    if (!activeModule || !activeChapter) return;
    updateModule(activeChapter.id, activeModule.id, {
      blocks: activeModule.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
    });
  };

  const deleteBlock = (blockId: string) => {
    if (!activeModule || !activeChapter) return;
    updateModule(activeChapter.id, activeModule.id, {
      blocks: activeModule.blocks.filter(b => b.id !== blockId)
    });
  };

  const handlePublish = () => {
    if (onSave) {
      onSave(course);
    }
  };

  // --- AI Generators ---

  const handleRefineBlock = async (blockId: string) => {
    if (!activeModule || !activeChapter) return;
    const block = activeModule.blocks.find(b => b.id === blockId);
    if (!block || !block.content) return;

    updateBlock(blockId, { metadata: { ...block.metadata, isRefining: true } });
    const refined = await refineText(block.content);
    updateBlock(blockId, { 
        content: refined,
        metadata: { ...block.metadata, isRefining: false } 
    });
  };

  const handleGeneratePodcastBlock = async () => {
    setIsGenerating(true);
    setLoadingMessage('Drafting script...');
    const topic = activeModule?.title || "Logistics";
    const script = await generatePodcastScript(topic, activeChapter?.sourceContent);
    if (script) {
      setLoadingMessage('Recording audio...');
      const audioBase64 = await generatePodcastAudio(script);
      if (audioBase64) {
        addBlock('audio', script, { audioData: audioBase64, duration: '2:30' });
      }
    }
    setIsGenerating(false);
  };

  const handleGenerateSlidesBlock = async () => {
    setIsGenerating(true);
    setLoadingMessage('Designing slides...');
    const topic = activeModule?.title || "Logistics";
    const result = await generateSlideDeck(topic, activeChapter?.sourceContent);
    if (result && result.slides) {
      addBlock('slides', 'Summary Deck', { slides: result.slides });
    }
    setIsGenerating(false);
  };

  const handleGenerateTextBlock = async () => {
    setIsGenerating(true);
    setLoadingMessage('Writing content...');
    const topic = activeModule?.title || "Logistics";
    const text = await generateEducationalText(topic, activeChapter?.sourceContent);
    if (text) addBlock('text', text);
    setIsGenerating(false);
  };

  const handleGenerateVideoBlock = async () => {
    const blockId = addBlock('video', '', { loading: true });
    setIsGenerating(true);
    setLoadingMessage('Starting video render...');
    const topic = activeModule?.title || "Logistics";
    generateVideo(topic).then((videoUrl) => {
        if (videoUrl && blockId) {
            updateBlock(blockId, { content: videoUrl, metadata: { loading: false } });
        } else if (blockId) {
            updateBlock(blockId, { content: '', metadata: { loading: false, error: true } });
        }
    });
    setTimeout(() => setIsGenerating(false), 1000);
  };

  // --- Audio Player Logic ---
  const playAudio = async (base64: string, blockId: string) => {
    if (playingBlockId === blockId) {
      sourceNodeRef.current?.stop();
      setPlayingBlockId(null);
      return;
    }
    if (sourceNodeRef.current) sourceNodeRef.current.stop();

    const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) setAudioContext(ctx);

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    
    const buffer = await ctx.decodeAudioData(bytes.buffer);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setPlayingBlockId(null);
    source.start();
    sourceNodeRef.current = source;
    setPlayingBlockId(blockId);
  };

  // --- Renderers ---

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <input
            className="w-full text-2xl font-bold text-slate-800 bg-transparent outline-none placeholder-slate-300 mb-2"
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Heading 1"
          />
        );
      case 'subheading':
        return (
          <input
            className="w-full text-lg font-medium text-slate-700 bg-transparent outline-none placeholder-slate-300 mb-2"
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Heading 2"
          />
        );
      case 'text':
        return (
          <div className="relative group/text">
             <textarea
                className="w-full bg-transparent outline-none text-slate-600 font-light leading-relaxed resize-none overflow-hidden mb-2 rounded-md focus:bg-slate-50/50 transition-colors p-1 -ml-1"
                value={block.content}
                onChange={(e) => {
                    updateBlock(block.id, { content: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
                placeholder="Type / for commands..."
                style={{ minHeight: '1.5em' }}
                rows={1}
                onFocus={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
            />
            <button 
                onClick={() => handleRefineBlock(block.id)}
                className="absolute right-0 -top-2 px-2 py-1 bg-white border border-slate-100 shadow-sm rounded-full text-slate-400 hover:text-purple-600 hover:border-purple-200 opacity-0 group-hover/text:opacity-100 transition-all text-xs font-medium flex items-center gap-1 z-10"
                title="Refine text with AI"
                disabled={block.metadata?.isRefining}
            >
               {block.metadata?.isRefining ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12} />}
               <span>Refine</span>
            </button>
          </div>
        );
      case 'callout':
         return (
             <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex items-start space-x-3 mb-4">
                 <Sparkles size={18} className="text-blue-500 mt-0.5 shrink-0" />
                 <textarea
                    className="w-full bg-transparent outline-none text-blue-900 font-medium resize-none"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                 />
             </div>
         );
      case 'video':
        return (
          <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative group mb-4 shadow-md">
            {block.metadata?.loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
                    <span className="text-xs uppercase tracking-widest font-medium">Generating Video...</span>
                </div>
            ) : block.content ? (
                <video src={block.content} controls className="w-full h-full object-cover" />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-100/50">
                    <VideoIcon size={32} className="opacity-20 mb-2" />
                    <span className="text-xs">No Video Content</span>
                </div>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center space-x-4 select-none mb-4 hover:border-blue-200 transition-colors">
            <button
              onClick={() => block.metadata?.audioData && playAudio(block.metadata.audioData, block.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${playingBlockId === block.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}
            >
              {playingBlockId === block.id ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-700">Audio Overview</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                 <div className={`h-full bg-blue-500 rounded-full transition-all duration-300 ${playingBlockId === block.id ? 'animate-pulse w-2/3' : 'w-0'}`} />
              </div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400">
                <Headphones size={16} />
            </div>
          </div>
        );
      case 'slides':
        return (
          <div className="w-full overflow-x-auto flex space-x-4 pb-4 select-none mb-4">
            {block.metadata?.slides?.map((slide: any, idx: number) => (
              <div key={idx} className="min-w-[280px] aspect-video bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                 <div className="flex items-center space-x-2 mb-4">
                     <span className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold border border-blue-100">{idx + 1}</span>
                 </div>
                 <h4 className="font-medium text-slate-800 text-sm mb-3 line-clamp-2">{slide.title}</h4>
                 <ul className="flex-1 space-y-2 overflow-hidden">
                     {slide.bullets.map((b: string, i: number) => (
                         <li key={i} className="text-[10px] text-slate-500 leading-relaxed flex items-start">
                             <span className="mr-1.5">•</span>
                             {b}
                         </li>
                     ))}
                 </ul>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderSidebar = () => (
    <div className="w-64 border-r border-slate-200/60 bg-white/40 backdrop-blur-md flex flex-col h-full animate-in slide-in-from-left-4 duration-500">
      <div className="p-4 border-b border-slate-100/50">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Course Outline</h2>
        <div className="flex items-center space-x-2 text-slate-800 font-medium">
          <Layout size={16} className="text-blue-600" />
          <span className="truncate">{course.title}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {course.chapters.map(chapter => (
          <div key={chapter.id} className="space-y-1">
            <div 
              onClick={() => { setActiveChapterId(chapter.id); setActiveModuleId(null); }}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group
                ${activeChapterId === chapter.id && !activeModuleId ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}
              `}
            >
              {activeChapterId === chapter.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="text-sm font-medium truncate flex-1">{chapter.title}</span>
            </div>

            {activeChapterId === chapter.id && (
              <div className="pl-4 space-y-1 border-l border-slate-100 ml-4">
                {chapter.modules.map(module => (
                  <div
                    key={module.id}
                    onClick={() => setActiveModuleId(module.id)}
                    className={`
                      flex items-center space-x-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm
                      ${activeModuleId === module.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}
                    `}
                  >
                    <FileText size={12} />
                    <span className="truncate">{module.title}</span>
                  </div>
                ))}
                <button 
                  onClick={() => {
                      const newId = `m${Date.now()}`;
                      const newModule: CourseModule = {
                          id: newId,
                          title: 'New Page',
                          type: ModuleType.MIXED,
                          duration: '0 min',
                          completed: false,
                          blocks: [{ id: `b${Date.now()}`, type: 'text', content: '' }]
                      };
                      setCourse(prev => ({
                          ...prev,
                          chapters: prev.chapters.map(c => c.id === chapter.id ? { ...c, modules: [...c.modules, newModule] } : c)
                      }));
                      setActiveModuleId(newId);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <Plus size={12} />
                    <span>Add Page</span>
                </button>
              </div>
            )}
          </div>
        ))}
        
        <button 
          onClick={() => {
            const newId = `c${Date.now()}`;
            setCourse(prev => ({
              ...prev,
              chapters: [...prev.chapters, { id: newId, title: 'New Chapter', modules: [], sourceContent: '' }]
            }));
            setActiveChapterId(newId);
            setActiveModuleId(null);
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors mt-4"
        >
          <Plus size={14} />
          <span>Add Chapter</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-100px)] -mx-6 -mt-6">
      {renderSidebar()}
      
      <div className="flex-1 overflow-hidden relative bg-white/30 backdrop-blur-sm">
        {/* Editor Toolbar (Notion-like top bar) */}
        {activeModule && (
            <div className="h-12 border-b border-slate-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <span>{activeChapter?.title}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-800 font-medium">{activeModule.title}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-400 mr-2">{isGenerating ? loadingMessage : 'Auto-saved'}</span>
                    
                    {/* Visibility Selector */}
                    <div className="flex items-center space-x-2 bg-slate-100/50 rounded-lg px-2 py-1">
                        <Globe size={14} className="text-slate-400"/>
                        <select 
                            className="bg-transparent text-xs text-slate-600 font-medium border-none outline-none cursor-pointer"
                            value={course.areaId || ''}
                            onChange={(e) => setCourse({...course, areaId: e.target.value || undefined})}
                        >
                            <option value="">Public</option>
                            {areas.map(area => (
                                <option key={area.id} value={area.id}>{area.name} ({area.code})</option>
                            ))}
                        </select>
                    </div>

                    <Button className="!py-1.5 !px-3 !text-xs" onClick={handlePublish}>Publish</Button>
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <div className="h-[calc(100%-48px)] overflow-y-auto">
            {activeModule ? (
                <div className="max-w-3xl mx-auto py-12 px-8 min-h-full">
                    <input 
                        className="text-4xl font-bold text-slate-900 bg-transparent border-none outline-none w-full mb-8 placeholder-slate-300"
                        value={activeModule.title}
                        onChange={(e) => {
                            if(activeChapter && activeModule) updateModule(activeChapter.id, activeModule.id, { title: e.target.value })
                        }}
                        placeholder="Page Title"
                    />

                    <div className="space-y-4 pb-32">
                        {activeModule.blocks.map((block) => (
                            <div key={block.id} className="group relative flex items-start -ml-12 pl-12">
                                <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 pr-2">
                                    <button 
                                        onClick={() => deleteBlock(block.id)}
                                        className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <div className="cursor-grab text-slate-300 hover:text-slate-500 p-1">
                                        <GripVertical size={14} />
                                    </div>
                                </div>
                                <div className="w-full">
                                    {renderBlock(block)}
                                </div>
                            </div>
                        ))}

                        <div className="group mt-8 pt-4 border-t border-transparent hover:border-slate-100 transition-colors">
                            <div className="flex flex-wrap items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                <button onClick={() => addBlock('text')} className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors shadow-sm">
                                    <Type size={14} /> <span>Text</span>
                                </button>
                                <button onClick={() => addBlock('heading')} className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors shadow-sm">
                                    <Heading size={14} /> <span>Header</span>
                                </button>
                                <button onClick={() => addBlock('callout')} className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors shadow-sm">
                                    <Sparkles size={14} /> <span>Callout</span>
                                </button>
                                <button onClick={() => addBlock('video', '')} className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors shadow-sm">
                                    <VideoIcon size={14} /> <span>Video Embed</span>
                                </button>
                                
                                <div className="w-px h-6 bg-slate-300 mx-2" />
                                
                                <button 
                                    onClick={handleGenerateTextBlock} 
                                    disabled={isGenerating}
                                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs transition-colors border border-emerald-100 shadow-sm"
                                >
                                    <AlignLeft size={14} />
                                    <span>AI Text</span>
                                </button>
                                <button 
                                    onClick={handleGeneratePodcastBlock} 
                                    disabled={isGenerating}
                                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs transition-colors border border-purple-100 shadow-sm"
                                >
                                    {isGenerating && loadingMessage.includes('audio') ? <Loader2 size={14} className="animate-spin" /> : <Mic2 size={14} />}
                                    <span>Audio Overview</span>
                                </button>
                                <button 
                                    onClick={handleGenerateVideoBlock}
                                    disabled={isGenerating} 
                                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs transition-colors border border-rose-100 shadow-sm"
                                >
                                    {isGenerating && loadingMessage.includes('Video') ? <Loader2 size={14} className="animate-spin" /> : <VideoIcon size={14} />}
                                    <span>AI Video</span>
                                </button>
                                <button 
                                    onClick={handleGenerateSlidesBlock}
                                    disabled={isGenerating} 
                                    className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs transition-colors border border-blue-100 shadow-sm"
                                >
                                    {isGenerating && loadingMessage.includes('slides') ? <Loader2 size={14} className="animate-spin" /> : <LayoutTemplate size={14} />}
                                    <span>AI Slides</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : activeChapter ? (
                <div className="max-w-3xl mx-auto py-12 px-8">
                     <div className="mb-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chapter Context</label>
                        <input 
                            value={activeChapter.title}
                            onChange={(e) => updateChapter(activeChapter.id, { title: e.target.value })}
                            className="text-3xl font-light text-slate-800 bg-transparent border-none outline-none w-full placeholder-slate-300"
                        />
                     </div>
                     <div className="bg-white/50 rounded-xl p-6 min-h-[500px] border border-slate-200/60 shadow-sm relative group">
                        <textarea 
                             className="w-full h-full bg-transparent border-none outline-none resize-none font-light text-slate-600 leading-relaxed text-sm min-h-[400px]"
                             placeholder="Paste your Source Material..."
                             value={activeChapter.sourceContent || ''}
                             onChange={(e) => updateChapter(activeChapter.id, { sourceContent: e.target.value })}
                        />
                     </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-light">Select a page to edit</div>
            )}
        </div>
      </div>
    </div>
  );
};