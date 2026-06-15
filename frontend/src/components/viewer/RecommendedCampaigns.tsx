'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import VideoCard from '@/components/player/VideoCard';
import dynamic from 'next/dynamic';

const VideoModal = dynamic(() => import('@/components/player/VideoModal'), { ssr: false });

export default function RecommendedCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  
  const { token } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/recommendations/campaigns', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setCampaigns(data.data?.slice(0, 10) || []); // Get top 10 for a good carousel
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchRecommendations();
  }, [token]);

  const handleTaskClick = (task: any) => {
    if (completedIds.has(task.id)) return; // Already completed
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
        body: JSON.stringify({ progress: 100 }) // Signal complete
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to verify task completion');
      }
      
      setCompletedIds(prev => new Set([...prev, taskId]));
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Recommended For You</h2>
        </div>
        <Link href="/dashboard/viewer/tasks">
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="relative group">
        {isLoading ? (
          <div className="flex justify-center p-12 border rounded-xl bg-card/30"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12 border rounded-xl bg-card/30">No recommendations available yet.</p>
        ) : (
          <div className="flex overflow-x-auto pb-6 pt-2 px-2 -mx-2 gap-4 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="min-w-[300px] md:min-w-[350px] lg:min-w-[400px] snap-center">
                <VideoCard 
                  task={campaign} 
                  isCompleted={completedIds.has(campaign.id)}
                  onClick={handleTaskClick} 
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <VideoModal 
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleTaskComplete}
      />
    </div>
  );
}
