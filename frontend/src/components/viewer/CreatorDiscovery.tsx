'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatorDiscovery() {
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingFollow, setTogglingFollow] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await fetch('/api/recommendations/creators', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setCreators(data.data?.slice(0, 4) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchCreators();
  }, [token]);

  const handleFollow = async (creatorId: string, isCurrentlyFollowing: boolean) => {
    setTogglingFollow(creatorId);
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ creatorId, action: isCurrentlyFollowing ? 'unfollow' : 'follow' })
      });
      
      if (!res.ok) throw new Error('Failed to update follow status');
      
      setCreators(prev => prev.map(c => 
        c.id === creatorId ? { ...c, isFollowing: !isCurrentlyFollowing } : c
      ));
      toast.success(isCurrentlyFollowing ? 'Unfollowed creator' : 'Following creator!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTogglingFollow(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Creators to Follow
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : creators.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">No creators found.</p>
        ) : (
          <div className="space-y-4">
            {creators.map(creator => (
              <div key={creator.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {creator.avatarUrl ? (
                      <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      creator.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{creator.name}</p>
                    <p className="text-xs text-muted-foreground">{creator.matchedNichesCount} matching campaigns</p>
                  </div>
                </div>
                <Button 
                  variant={creator.isFollowing ? "outline" : "default"} 
                  size="sm"
                  onClick={() => handleFollow(creator.id, creator.isFollowing)}
                  disabled={togglingFollow === creator.id}
                >
                  {togglingFollow === creator.id ? <Loader2 className="w-4 h-4 animate-spin" /> : creator.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
