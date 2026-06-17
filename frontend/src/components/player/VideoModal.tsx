'use client';

import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Play, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

interface Task {
  id: string;
  name: string;
  platform: string;
  url: string;
  rewardPerTask: number;
  creator?: { name: string; avatarUrl: string | null };
}

interface VideoModalProps {
  task: Task | null;
  isOpen: boolean;
  isCompleted?: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => Promise<void>;
}

const extractYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Memoized Player Component to prevent remounts
const NativeYouTubePlayer = memo(({ url, onProgress, onReady, isPlaying, setIsPlaying, onStartPlayback }: { 
  url: string, 
  onProgress: (state: { watchedSeconds: number, totalDuration: number }) => void, 
  onReady: () => void,
  isPlaying: boolean,
  setIsPlaying: (playing: boolean) => void,
  onStartPlayback: () => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const maxTimeRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  const onProgressRef = useRef(onProgress);
  const onReadyRef = useRef(onReady);
  const setIsPlayingRef = useRef(setIsPlaying);
  const onStartPlaybackRef = useRef(onStartPlayback);

  useEffect(() => {
    onProgressRef.current = onProgress;
    onReadyRef.current = onReady;
    setIsPlayingRef.current = setIsPlaying;
    onStartPlaybackRef.current = onStartPlayback;
  }, [onProgress, onReady, setIsPlaying, onStartPlayback]);

  useEffect(() => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;

    const initPlayer = () => {
      if (!containerRef.current) return;
      
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { 
          autoplay: 0, 
          controls: 0, 
          disablekb: 1, 
          fs: 0, 
          rel: 0, 
          modestbranding: 1, 
          playsinline: 1,
          iv_load_policy: 3 
        },
        events: {
          onReady: () => {
            onReadyRef.current();
          },
          onStateChange: (event: any) => {
            if (event.data === 1) { // PLAYING
              setIsPlayingRef.current(true);
              if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                onStartPlaybackRef.current();
              }
              // Clear any existing interval to prevent duplicates
              if (intervalRef.current) clearInterval(intervalRef.current);
              
              intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getDuration && playerRef.current.getCurrentTime) {
                  const currentTime = playerRef.current.getCurrentTime();
                  const totalDuration = playerRef.current.getDuration();
                  
                  // Anti-cheat: If user skips forward by more than 2 seconds, force them back
                  if (currentTime - maxTimeRef.current > 2) {
                    playerRef.current.seekTo(maxTimeRef.current, true);
                  } else {
                    maxTimeRef.current = Math.max(maxTimeRef.current, currentTime);
                  }
                  
                  if (totalDuration > 0) {
                    onProgressRef.current({ 
                      watchedSeconds: maxTimeRef.current, 
                      totalDuration: totalDuration 
                    });
                  }
                }
              }, 500); // Check every 500ms for tighter anti-cheat
            } else if (event.data === 3) { // BUFFERING
              if (intervalRef.current) clearInterval(intervalRef.current);
              setIsPlayingRef.current(true);
            } else if (event.data === 0) { // ENDED
              // If video naturally ended, they reached 100%
              if (playerRef.current && playerRef.current.getDuration) {
                 onProgressRef.current({ 
                    watchedSeconds: playerRef.current.getDuration(), 
                    totalDuration: playerRef.current.getDuration() 
                 });
              }
              setIsPlayingRef.current(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
            } else { // PAUSED, UNSTARTED
              setIsPlayingRef.current(false);
              if (intervalRef.current) clearInterval(intervalRef.current);
            }
          }
        }
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    }

    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [url]);

  return (
    <div className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
      <div className="w-full h-full absolute inset-0 z-0 pointer-events-auto">
        <div ref={containerRef} />
      </div>
    </div>
  );
});

export default function VideoModal({ task, isOpen, isCompleted = false, onClose, onComplete }: VideoModalProps) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [hasNotifiedStart, setHasNotifiedStart] = useState(false);
  
  const [timer, setTimer] = useState(0);
  const REQUIRED_PERCENTAGE = 100;
  const REQUIRED_TIMER_SECONDS = 10;

  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setProgressPercent(0);
      setIsEligible(false);
      setIsReady(false);
      setIsPlaying(false);
      setSecondsRemaining(null);
      setHasNotifiedStart(false);
      setTimer(0);
    }
  }, [isOpen, task]);

  const notifyTaskStarted = useCallback(async () => {
    if (!task || isCompleted || hasNotifiedStart || !token || token === 'mock-token-123') return;
    try {
      await fetch(`/api/tasks/start/${task.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasNotifiedStart(true);
    } catch (err) {
      console.error('Failed to notify task start', err);
    }
  }, [task, isCompleted, hasNotifiedStart, token]);

  useEffect(() => {
    if (!isOpen || !task || isCompleted) return;
    
    const isYouTube = task.platform.toUpperCase() === 'YOUTUBE';
    const isRealYouTubeUrl = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(task.url);
    
    if (isYouTube && isRealYouTubeUrl) return;

    // Trigger start immediately for non-YouTube
    notifyTaskStarted();

    const interval = setInterval(() => {
      setTimer((prev) => {
        const next = prev + 1;
        if (next >= REQUIRED_TIMER_SECONDS) {
          setIsEligible(true);
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, task, isCompleted, notifyTaskStarted]);

  const isYouTube = task ? task.platform.toUpperCase() === 'YOUTUBE' : false;
  const isRealYouTubeUrl = task ? /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(task.url) : false;

  const handleProgress = useCallback((state: { watchedSeconds: number; totalDuration: number }) => {
    if (!isYouTube || isCompleted) return;
    
    const requiredSeconds = Math.ceil(state.totalDuration * (REQUIRED_PERCENTAGE / 100));
    const percent = Math.floor((state.watchedSeconds / requiredSeconds) * 100);
    
    setProgressPercent(Math.min(percent, 100));
    setSecondsRemaining(Math.max(requiredSeconds - state.watchedSeconds, 0));

    if (state.watchedSeconds >= requiredSeconds) {
      setIsEligible(true);
    }
  }, [isYouTube, isCompleted]);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  if (!task) return null;

  const handleClaim = async () => {
    if (!isEligible || isCompleted) return;
    setIsClaiming(true);
    try {
      await onComplete(task.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 transition-all duration-300 ${isOpen ? 'visible opacity-100 bg-black/95 backdrop-blur-md' : 'invisible opacity-0 pointer-events-none'}`}>
      <div className="bg-[#0A0A0A] w-full h-full md:h-auto md:max-w-6xl md:rounded-3xl overflow-y-auto shadow-2xl border-0 md:border border-white/10 flex flex-col max-h-[100vh]">
        
        {/* Premium Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111] sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {task.creator?.avatarUrl ? (
              <Image src={task.creator.avatarUrl} alt="Creator" width={40} height={40} className="rounded-full ring-2 ring-primary/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {task.creator?.name?.[0] || 'C'}
              </div>
            )}
            <div>
              <h2 className="text-lg md:text-xl font-bold leading-tight text-white">{task.name}</h2>
              <p className="text-sm text-white/60 font-medium">By {task.creator?.name || 'Creator'} • {task.platform}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Video Player Area */}
        <div className="relative bg-black w-full aspect-video flex-shrink-0 flex items-center justify-center group">
          {/* Skeleton Loader */}
          {!isReady && isOpen && isYouTube && isRealYouTubeUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-10">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium text-white/50 tracking-wide uppercase">Initializing Secure Player...</p>
            </div>
          )}
          
          {/* Custom Play Overlay when Paused/Ready but not playing */}
          {isReady && !isPlaying && isOpen && isYouTube && isRealYouTubeUrl && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px] transition-all duration-300">
              <div className="w-20 h-20 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.6)] pl-2 scale-100 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-10 h-10" />
              </div>
            </div>
          )}
          
          {isOpen && isYouTube && isRealYouTubeUrl ? (
            <NativeYouTubePlayer 
              url={task.url} 
              onReady={handleReady} 
              onProgress={handleProgress}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              onStartPlayback={notifyTaskStarted}
            />
          ) : isOpen ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#111] to-black text-center p-8">
              <ShieldAlert className="w-16 h-16 text-primary mb-6 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <h3 className="text-2xl font-bold mb-3 text-white">External Content Task</h3>
              <p className="text-white/60 mb-8 max-w-md text-lg leading-relaxed">
                This task requires you to interact with the content natively. We are securely verifying your engagement based on active session time.
              </p>
              <Button size="lg" className="rounded-full px-8 py-6 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all" onClick={() => { notifyTaskStarted(); window.open(task.url, '_blank', 'noopener,noreferrer'); }}>
                Open Content Securely
              </Button>
            </div>
          ) : null}
        </div>

        {/* Verification Footer / Gamification Rewatch Mode */}
        <div className="p-6 md:p-8 bg-[#0A0A0A] border-t border-white/5 mt-auto">
          {isCompleted ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-green-500/10 border border-green-500/20 rounded-xl p-6">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-green-500/20 rounded-full">
                   <CheckCircle2 className="w-8 h-8 text-green-500" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white">Task Already Completed</h3>
                   <p className="text-sm text-green-400/80 font-medium mt-1">You previously earned {task.rewardPerTask} Coins for this task.</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5 px-4 py-2 text-sm font-bold">
                    <RefreshCw className="w-4 h-4 mr-2" /> Rewatch Mode
                 </Badge>
               </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Progress UI */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between items-end text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-white/90">Anti-Cheat Verification</span>
                  </div>
                  <span className="font-bold font-mono text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {isYouTube && isRealYouTubeUrl ? `${progressPercent}%` : `${timer}s / ${REQUIRED_TIMER_SECONDS}s`}
                  </span>
                </div>
                
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear ${isEligible ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-primary/80 to-primary'}`}
                    style={{ width: `${isYouTube && isRealYouTubeUrl ? progressPercent : (timer / REQUIRED_TIMER_SECONDS) * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs md:text-sm text-white/50 font-medium">
                  <p className="flex items-center gap-1.5">
                    {isEligible 
                      ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> <span className="text-green-500">Requirements met. You can claim your reward!</span></>
                      : (isYouTube && isRealYouTubeUrl)
                        ? <><Clock className="w-4 h-4" /> Watch {REQUIRED_PERCENTAGE}% without skipping.</>
                        : <><Clock className="w-4 h-4" /> Keep this window open and active.</>}
                  </p>
                  {!isEligible && isYouTube && isRealYouTubeUrl && secondsRemaining !== null && (
                    <span className="opacity-80">{secondsRemaining}s required remaining</span>
                  )}
                </div>
              </div>

              {/* Claim Button */}
              <Button 
                size="lg" 
                onClick={handleClaim} 
                disabled={!isEligible || isClaiming}
                className={`w-full lg:w-auto min-w-[240px] h-14 text-lg font-bold rounded-xl transition-all duration-500 ${isEligible ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-100 hover:scale-[1.02]' : 'bg-white/5 text-white/40 cursor-not-allowed'}`}
              >
                {isClaiming ? (
                  <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Verifying...</>
                ) : isEligible ? (
                  <><CheckCircle2 className="w-6 h-6 mr-3" /> Claim {task.rewardPerTask} Coins</>
                ) : (
                  'Task Incomplete'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
