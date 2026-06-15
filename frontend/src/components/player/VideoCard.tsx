'use client';

import { Play, Coins, Clock, User, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Task {
  id: string;
  name: string;
  platform: string;
  url: string;
  rewardPerTask: number;
  niche?: string;
  creator: { name: string; avatarUrl?: string };
}

interface VideoCardProps {
  task: Task;
  isCompleted?: boolean;
  onClick: (task: Task) => void;
}

import { memo } from 'react';

export const extractYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const VideoCard = memo(function VideoCard({ task, isCompleted, onClick }: VideoCardProps) {
  const isYouTube = task.platform.toUpperCase() === 'YOUTUBE';
  const ytId = isYouTube ? extractYouTubeId(task.url) : null;
  // If we can't extract, use hqdefault instead of maxresdefault to prevent broken images for some videos
  const thumbnailUrl = ytId 
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80`;

  return (
    <Card 
      onClick={() => onClick(task)}
      className={`group relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl bg-[#0A0A0A] border-white/5 rounded-2xl ${isCompleted ? 'hover:shadow-green-500/20 hover:border-green-500/30 ring-1 ring-green-500/20' : 'hover:shadow-primary/20 hover:border-primary/30'}`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#111]">
        <Image 
          src={thumbnailUrl} 
          alt={task.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isCompleted ? 'opacity-80' : ''}`}
        />
        
        {/* Deep shadow at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`text-white p-4 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-300 ${isCompleted ? 'bg-green-500/90 shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'bg-primary/90'}`}>
            {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg">
            {task.platform}
          </Badge>
          
          {isCompleted ? (
            <Badge className="bg-green-500/20 border border-green-500/30 text-green-400 font-bold backdrop-blur-md shadow-lg flex items-center gap-1.5 px-3 py-1">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </Badge>
          ) : (
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 font-bold backdrop-blur-md shadow-lg border-none flex items-center gap-1.5 px-3 py-1">
              <Coins className="w-4 h-4" />
              +{task.rewardPerTask} Coins
            </Badge>
          )}
        </div>

        {/* Bottom Metadata overlayed on image */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3 py-1 text-xs font-medium text-white shadow-lg">
            {task.creator?.avatarUrl ? (
               <img src={task.creator.avatarUrl} alt="Creator" className="w-5 h-5 rounded-full" />
            ) : (
               <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold">
                 {task.creator?.name?.[0] || 'C'}
               </div>
            )}
            <span className="line-clamp-1 max-w-[100px]">{task.creator.name}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-xs font-medium text-white shadow-lg">
            <Clock className="w-3.5 h-3.5" />
            {isYouTube ? '1-3 min' : '10 sec'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative z-10 bg-[#0A0A0A]">
        <h3 className={`font-bold text-lg line-clamp-2 transition-colors ${isCompleted ? 'text-green-400/90 group-hover:text-green-400' : 'text-white/90 group-hover:text-white'}`}>{task.name}</h3>
        
        {isCompleted && (
          <p className="text-sm text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-500" />
            Earned: <span className="text-white">+{task.rewardPerTask} Coins</span>
          </p>
        )}
        
        {!isCompleted && task.niche && (
          <div className="mt-3">
             <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
               {task.niche}
             </span>
          </div>
        )}
      </div>
    </Card>
  );
});

export default VideoCard;
