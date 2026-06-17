'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Coins, CheckCircle2, Camera, Play, Globe, MessageCircle } from 'lucide-react';

interface TaskItem {
  id: string;
  name: string;
  platform: string;
  url: string;
  description?: string;
  rewardPerTask: number;
  creator: { name: string; avatarUrl?: string };
}

const platformIcons: Record<string, any> = {
  INSTAGRAM: Camera,
  YOUTUBE: Play,
  FACEBOOK: Globe,
  THREADS: MessageCircle,
};

const platformColors: Record<string, string> = {
  INSTAGRAM: 'from-pink-500 to-purple-500',
  YOUTUBE: 'from-red-500 to-red-600',
  FACEBOOK: 'from-blue-500 to-blue-600',
  THREADS: 'from-gray-700 to-black',
};

import VideoCard from '@/components/player/VideoCard';
import dynamic from 'next/dynamic';

const VideoModal = dynamic(() => import('@/components/player/VideoModal'), { ssr: false });

export default function TaskMarketplace() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/tasks/available`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(Array.isArray(data) ? data : (data.tasks || []));
        }
      } catch (err) {
        console.error('Failed to fetch tasks');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchTasks();
    else {
      setIsLoading(false);
    }
  }, [token]);

  const handleTaskClick = (task: TaskItem) => {
    if (completedIds.has(task.id)) return;
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskComplete = async (taskId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/tasks/complete/${taskId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ progress: 100 })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to complete task');
      }

      setCompletedIds((prev) => new Set([...prev, taskId]));
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Complete tasks to earn coins. Watch videos, like posts, and get rewarded!
        </p>
      </div>

      {/* Filter bar placeholder */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Instagram', 'YouTube', 'Facebook', 'Threads'].map((platform) => (
          <Badge
            key={platform}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors px-3 py-1"
          >
            {platform}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading available tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No tasks available right now. Check back later!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <VideoCard 
              key={task.id}
              task={task as any}
              isCompleted={completedIds.has(task.id)}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}

      <VideoModal 
        task={selectedTask as any}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleTaskComplete}
      />
    </div>
  );
}
