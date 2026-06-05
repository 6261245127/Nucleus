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

export default function TaskMarketplace() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
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
      // Mock tasks for dev mode
      setTasks([
        { id: '1', name: 'Watch Summer Reel', platform: 'INSTAGRAM', url: 'https://instagram.com/reel/123', description: 'Watch this reel and leave a genuine comment.', rewardPerTask: 5, creator: { name: 'FashionBrand' } },
        { id: '2', name: 'Like Tech Review Video', platform: 'YOUTUBE', url: 'https://youtube.com/watch?v=abc', description: 'Watch at least 30 seconds and like the video.', rewardPerTask: 10, creator: { name: 'TechGuru' } },
        { id: '3', name: 'Share Product Post', platform: 'FACEBOOK', url: 'https://facebook.com/post/456', description: 'View the post and share to your story.', rewardPerTask: 3, creator: { name: 'ShopEasy' } },
        { id: '4', name: 'Follow & Engage on Threads', platform: 'THREADS', url: 'https://threads.net/@brand', description: 'Follow the account and reply to latest thread.', rewardPerTask: 8, creator: { name: 'NewsDaily' } },
        { id: '5', name: 'Watch Dance Reel', platform: 'INSTAGRAM', url: 'https://instagram.com/reel/789', description: 'Watch the full reel and double-tap.', rewardPerTask: 4, creator: { name: 'DanceStudio' } },
        { id: '6', name: 'Subscribe & Watch Tutorial', platform: 'YOUTUBE', url: 'https://youtube.com/watch?v=def', description: 'Subscribe to the channel and watch the full tutorial.', rewardPerTask: 15, creator: { name: 'CodeAcademy' } },
      ]);
      setIsLoading(false);
    }
  }, [token]);

  const handleComplete = async (task: TaskItem) => {
    setLoadingId(task.id);

    // Open the content URL in a new tab
    window.open(task.url, '_blank');

    // Simulate a short delay (in production, we'd verify engagement)
    await new Promise((r) => setTimeout(r, 2000));

    try {
      if (token && token !== 'mock-token-123') {
        const res = await fetch(`/api/tasks/complete/${task.id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.message || 'Failed to complete task');
          setLoadingId(null);
          return;
        }
      }

      setCompletedIds((prev) => new Set([...prev, task.id]));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const Icon = platformIcons[task.platform] || MessageCircle;
            const gradient = platformColors[task.platform] || 'from-gray-500 to-gray-600';
            const isCompleted = completedIds.has(task.id);
            const isProcessing = loadingId === task.id;

            return (
              <Card key={task.id} className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${isCompleted ? 'opacity-60' : ''}`}>
                {/* Platform stripe */}
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
                <CardContent className="pt-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{task.name}</h3>
                        <p className="text-xs text-muted-foreground">by {task.creator.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
                      <Coins className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">+{task.rewardPerTask}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {isCompleted ? (
                      <Button disabled className="w-full bg-green-500/10 text-green-500 hover:bg-green-500/10">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed! +{task.rewardPerTask} coins
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleComplete(task)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Verifying...</>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Complete & Earn {task.rewardPerTask} Coins
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
