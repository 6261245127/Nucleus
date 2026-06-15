'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NicheInsights() {
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('/api/recommendations/insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setInsights(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchInsights();
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Niche Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center">No niche data available.</p>
        ) : (
          <div className="space-y-3">
            {insights.map((item, i) => (
              <div key={item.niche} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{i === 0 ? '🔥' : i === 1 ? '📈' : '💰'}</span>
                  <span className="font-medium text-sm">{item.niche}</span>
                </div>
                <Badge variant="secondary" className="font-mono">{item.activeCount} active</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
