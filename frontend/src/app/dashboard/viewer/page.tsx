'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Trophy, Users, TrendingUp, Loader2, Target, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { motion } from 'framer-motion';

import RecommendedCampaigns from '@/components/viewer/RecommendedCampaigns';
import NicheInsights from '@/components/viewer/NicheInsights';
import CreatorDiscovery from '@/components/viewer/CreatorDiscovery';

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

export default function ViewerDashboard() {
  const { user, token } = useAuth();
  
  const { data, error, isLoading } = useSWR(
    token ? ['/api/dashboard/viewer', token] : null,
    ([url, t]) => fetcher(url, t),
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  const stats = [
    { title: 'Total Coins Earned', value: data?.totalCoins || 0, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { title: 'Tasks Completed', value: data?.tasksCompleted || 0, icon: Trophy, color: 'text-green-400', bg: 'bg-green-500/20' },
    { title: 'Referral Bonus', value: data?.referralEarnings || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { title: 'This Week', value: `+${data?.weeklyEarnings || 0}`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      {/* Premium Header */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-[#0A1128] to-[#0A1128] border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-white/70">Welcome back to CreatorBoost</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.name}</span> 👋
            </h1>
            <p className="text-white/60 mt-2 text-lg">
              You have <strong className="text-white">12 new tasks</strong> waiting for you today.
            </p>
          </div>
          <Link href="/dashboard/viewer/tasks">
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-[0_0_30px_-10px_rgba(139,92,246,0.6)] text-white font-bold rounded-2xl">
              Start Earning Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-[#0A1128]/80 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/50 mb-1">{stat.title}</p>
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mt-2 text-primary" />
                      ) : (
                        <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-secondary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recommended For You - Full Width */}
      <RecommendedCampaigns />

      {/* Bottom Grid: Daily Missions & Gamification */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Daily Missions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Calendar className="w-32 h-32" /></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-secondary" /> Daily Missions
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Complete 5 Tasks</p>
                    <p className="text-xs text-white/50">Reward: +50 Bonus Coins</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">3/5</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Watch 1 Gaming Video</p>
                    <p className="text-xs text-white/50">Reward: +20 Bonus Coins</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-green-400">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <NicheInsights />
        </div>

        {/* Gamification & Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-[#0A1128] to-primary/5 border-primary/20 shadow-2xl relative overflow-hidden">
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-5 h-5 text-primary" /> Your Growth Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-center backdrop-blur-md">
                  <p className="text-sm text-white/50 mb-2 font-medium">Current Level</p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                    {data?.gamification?.level || 1}
                  </p>
                </div>
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-center backdrop-blur-md">
                  <p className="text-sm text-white/50 mb-2 font-medium">Active Streak</p>
                  <p className="text-4xl font-black text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]">
                    {data?.gamification?.currentStreak || 0} 🔥
                  </p>
                </div>
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl text-center backdrop-blur-md">
                  <p className="text-sm text-white/50 mb-2 font-medium">Total Lifetime Tasks</p>
                  <p className="text-4xl font-black text-green-400">
                    {data?.gamification?.totalTasks || 0}
                  </p>
                </div>
              </div>
              
              {/* Next Level Progress */}
              {(() => {
                const total = data?.gamification?.totalTasks || 0;
                let nextMilestone = 10;
                let levelName = "Level 2";
                if (total >= 100) return <div className="text-sm text-green-400 font-bold p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center">🎉 Max Level Reached! You are an Elite Viewer.</div>;
                if (total >= 50) { nextMilestone = 100; levelName = "Level 4"; }
                else if (total >= 10) { nextMilestone = 50; levelName = "Level 3"; }
                
                const percent = Math.floor((total / nextMilestone) * 100);
                return (
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between text-sm mb-3 font-bold text-white">
                      <span>Progress to {levelName}</span>
                      <span className="text-primary">{total} / {nextMilestone} Tasks</span>
                    </div>
                    <div className="w-full bg-black/60 rounded-full h-4 border border-white/10 overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full shadow-[0_0_15px_rgba(139,92,246,0.8)] relative"
                      >
                        <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-white/40 mt-3 text-center">Reach {levelName} to unlock a 1.2x coin multiplier on all tasks!</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
          
          <CreatorDiscovery />
        </div>
      </div>
    </motion.div>
  );
}
