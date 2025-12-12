import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';
import { generatePodcastScript, generatePodcastAudio } from '../services/geminiService';
import { Headphones, Mic2, Sparkles, Play, Pause, Radio, Globe, MapPin, Calendar } from 'lucide-react';
import { Area, Podcast } from '../types';

interface PodcastStudioProps {
  isAdmin: boolean;
  areas: Area[];
  podcasts: Podcast[];
  onPublish: (podcast: Podcast) => void;
}

export const PodcastStudio: React.FC<PodcastStudioProps> = ({ isAdmin, areas, podcasts, onPublish }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [script, setScript] = useState('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Publishing State
  const [publishAreaId, setPublishAreaId] = useState<string>('');
  const [publishTitle, setPublishTitle] = useState('');

  useEffect(() => {
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [audioContext]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setStatus('Drafting script with Gemini...');
    setScript('');
    setAudioBuffer(null);
    setAudioBase64(null);
    setIsPlaying(false);

    const generatedScript = await generatePodcastScript(topic);
    if (!generatedScript) {
      setStatus('Failed to generate script.');
      setLoading(false);
      return;
    }
    setScript(generatedScript);
    setStatus('Synthesizing multi-speaker audio...');

    const base64Audio = await generatePodcastAudio(generatedScript);
    if (!base64Audio) {
      setStatus('Failed to generate audio.');
      setLoading(false);
      return;
    }
    setAudioBase64(base64Audio);

    try {
      setStatus('Processing audio...');
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioContext(ctx);
      
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const decodedBuffer = await ctx.decodeAudioData(bytes.buffer);
      setAudioBuffer(decodedBuffer);
      setStatus('Ready to play!');
    } catch (e) {
      console.error("Audio Decode Error:", e);
      setStatus('Error decoding audio.');
    }

    setLoading(false);
    setPublishTitle(topic.split(' ').slice(0, 5).join(' ') + '...');
  };

  const handlePublishPodcast = () => {
     if (!audioBase64) return;
     const newPodcast: Podcast = {
        id: `p${Date.now()}`,
        title: publishTitle,
        duration: audioBuffer ? `${Math.floor(audioBuffer.duration / 60)}:${Math.floor(audioBuffer.duration % 60).toString().padStart(2, '0')}` : '05:00',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        areaId: publishAreaId || undefined,
        audioData: audioBase64,
        description: script.substring(0, 100) + '...'
     };
     onPublish(newPodcast);
     // Reset
     setTopic('');
     setScript('');
     setAudioBuffer(null);
     setStatus('Published successfully!');
  };

  const togglePlay = () => {
    if (!audioContext || !audioBuffer) return;

    if (isPlaying) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pt-8 space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Studio Section (Admin Only) */}
      {isAdmin && (
        <>
        <div className="text-center">
            <h1 className="text-3xl font-light text-slate-900 mb-2">Audio-Logistik Studio</h1>
            <p className="text-slate-500 font-light">Turn SOPs into podcasts for your region.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[500px]">
            {/* Input Side */}
            <GlassCard className="flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-6 text-blue-800">
                <Mic2 size={20} />
                <h2 className="font-medium">Studio Controls</h2>
            </div>
            
            <div className="flex-1 space-y-4">
                <div>
                <label className="block text-sm text-slate-500 mb-2">Podcast Topic</label>
                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Explain the importance of Just-In-Time delivery..."
                    className="w-full h-32 px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-light resize-none"
                />
                </div>

                {status && (
                <div className="text-sm text-blue-600 font-medium flex items-center animate-pulse">
                    <Radio size={14} className="mr-2" />
                    {status}
                </div>
                )}
            </div>
            
            <div className="pt-4 mt-auto">
                <Button onClick={handleGenerate} isLoading={loading} disabled={!topic || loading} className="w-full">
                <Sparkles size={16} className="mr-2 inline" />
                Generate Episode
                </Button>
            </div>
            </GlassCard>

            {/* Player / Publish Side */}
            <GlassCard className="flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none h-full shadow-2xl">
              {!audioBuffer ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <Headphones size={48} strokeWidth={1} className="mb-4 opacity-50"/>
                    <p className="font-light">Waiting for content...</p>
                 </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-8">
                     {/* Visualizer Background */}
                    {isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center space-x-1 opacity-20 pointer-events-none">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="w-2 bg-blue-400 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 60}%`, animationDuration: `${0.6 + Math.random() * 0.4}s` }} />
                        ))}
                        </div>
                    )}
                    
                    <button 
                        onClick={togglePlay}
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-red-500 text-white' : 'bg-white text-slate-900'}`}
                    >
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                    </button>
                    
                    {/* Publishing Form */}
                    <div className="w-full space-y-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <input 
                           className="w-full bg-transparent border-b border-white/20 text-white placeholder-white/40 pb-2 outline-none"
                           value={publishTitle}
                           onChange={(e) => setPublishTitle(e.target.value)}
                           placeholder="Episode Title"
                        />
                         <div className="flex items-center space-x-2">
                            <Globe size={14} className="text-white/60"/>
                            <select 
                                className="bg-transparent text-sm text-white/80 font-medium border-none outline-none cursor-pointer flex-1"
                                value={publishAreaId}
                                onChange={(e) => setPublishAreaId(e.target.value)}
                            >
                                <option value="" className="text-slate-900">Public (All Regions)</option>
                                {areas.map(area => (
                                    <option key={area.id} value={area.id} className="text-slate-900">{area.name} ({area.code})</option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handlePublishPodcast} className="w-full bg-blue-600 hover:bg-blue-500 border-none">Publish to Library</Button>
                    </div>
                </div>
              )}
            </GlassCard>
        </div>
        </>
      )}

      {/* Library Section */}
      <section>
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light text-slate-800">Available Podcasts</h2>
              <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                  {podcasts.length} Episodes
              </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcasts.map(podcast => (
                  <GlassCard key={podcast.id} hoverEffect className="group cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!podcast.areaId ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              <Headphones size={18} />
                          </div>
                          <div className="text-right">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${!podcast.areaId ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                                  {!podcast.areaId ? 'Public' : areas.find(a => a.id === podcast.areaId)?.code || 'Area'}
                              </span>
                          </div>
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">{podcast.title}</h3>
                      <p className="text-sm text-slate-500 font-light mb-4 line-clamp-2">{podcast.description}</p>
                      <div className="flex items-center text-xs text-slate-400 space-x-4 border-t border-slate-100 pt-4">
                          <span className="flex items-center"><Calendar size={12} className="mr-1"/> {podcast.date}</span>
                          <span className="flex items-center"><Radio size={12} className="mr-1"/> {podcast.duration}</span>
                      </div>
                  </GlassCard>
              ))}
              {podcasts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 font-light">
                      No podcasts available for your region yet.
                  </div>
              )}
          </div>
      </section>
    </div>
  );
};