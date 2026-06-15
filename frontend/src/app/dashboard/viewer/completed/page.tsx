'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, History, Loader2 } from 'lucide-react';
import VideoCard from '@/components/player/VideoCard';
import dynamic from 'next/dynamic';

const VideoModal = dynamic(() => import('@/components/player/VideoModal'), { ssr: false });

interface CompletedTaskItem {
  id: string; // Task ID
  campaignId: string;
  status: string;
  rewardAmount: number;
  createdAt: string;
  campaign: {
    id: string;
    name: string;
    platform: string;
    url: string;
    rewardPerTask: number;
    creator: { name: string; avatarUrl?: string };
  };
}

export default function CompletedTasks() {
  const [tasks, setTasks] = useState<CompletedTaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks/history`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Failed to fetch completed tasks');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchTasks();
    else {
      setIsLoading(false);
    }
  }, [token]);

  const handleTaskClick = (item: CompletedTaskItem) => {
    // Map the nested campaign to the expected Task format for the VideoModal
    const mappedTask = {
      id: item.campaign.id,
      name: item.campaign.name,
      platform: item.campaign.platform,
      url: item.campaign.url,
      rewardPerTask: item.rewardAmount,
      creator: item.campaign.creator,
    };
    setSelectedTask(mappedTask);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <History className="w-8 h-8 text-primary" />
          Completed Tasks
        </h1>
        <p className="text-muted-foreground mt-1">
          Review tasks you have already completed and earned rewards for. You can rewatch the content without earning additional coins.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading your history...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 border border-dashed rounded-xl">
          <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-white/90">No completed tasks yet</h3>
          <p className="text-muted-foreground mt-1">Head over to the Tasks tab to start earning.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((item) => {
            const mappedTask = {
              id: item.campaign.id,
              name: item.campaign.name,
              platform: item.campaign.platform,
              url: item.campaign.url,
              rewardPerTask: item.rewardAmount,
              creator: item.campaign.creator,
            };
            return (
              <VideoCard 
                key={item.id}
                task={mappedTask as any}
                isCompleted={true}
                onClick={() => handleTaskClick(item)}
              />
            );
          })}
        </div>
      )}

      <VideoModal 
        task={selectedTask}
        isOpen={isModalOpen}
        isCompleted={true}
        onClose={() => setIsModalOpen(false)}
        onComplete={async () => {}}
      />
    </div>
  );
}
