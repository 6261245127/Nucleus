'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, LayoutDashboard, Users, Wallet, Loader2, Megaphone, Plus, TrendingUp, BarChart3, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

// Mock chart data for premium look
const chartData = [
  { name: 'Mon', views: 400, clicks: 240 },
  { name: 'Tue', views: 300, clicks: 139 },
  { name: 'Wed', views: 550, clicks: 380 },
  { name: 'Thu', views: 450, clicks: 290 },
  { name: 'Fri', views: 700, clicks: 480 },
  { name: 'Sat', views: 650, clicks: 390 },
  { name: 'Sun', views: 900, clicks: 680 },
];

export default function CreatorDashboard() {
  const { user, token } = useAuth();
  
  const { data, error, isLoading } = useSWR(
    token ? ['/api/dashboard/creator', token] : null,
    ([url, t]) => fetcher(url, t),
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  const stats = [
    { title: 'Total Campaigns', value: data?.totalCampaigns || 0, icon: LayoutDashboard, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { title: 'Active Campaigns', value: data?.activeCampaigns || 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/20' },
    { title: 'Total Engagement', value: data?.totalEngagement || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { title: 'Total Spent', value: `${data?.totalSpent || 0} Coins`, icon: Wallet, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
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
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-white/70">Creator Studio</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.name}</span>
            </h1>
            <p className="text-white/60 mt-2 text-lg">
              Your active campaigns are driving <strong className="text-green-400">+24% more engagement</strong> this week.
            </p>
          </div>
          <Link href="/dashboard/creator/campaigns/new">
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-[0_0_30px_-10px_rgba(139,92,246,0.6)] text-white font-bold rounded-2xl group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              New Campaign
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

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Engagement Overview Chart */}
        <Card className="col-span-4 bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />
          <CardHeader className="relative z-10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Performance Overview
              </CardTitle>
              <p className="text-sm text-white/50 mt-1">Views vs Clicks over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-white/70">
              <span className="w-2 h-2 rounded-full bg-primary" /> Views
              <span className="w-2 h-2 rounded-full bg-secondary ml-2" /> Clicks
            </div>
          </CardHeader>
          <CardContent className="h-[350px] relative z-10">
             {data?.totalCampaigns === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <Megaphone className="w-12 h-12 text-white/20 mb-4" />
                  <p className="text-white/60 font-medium">No campaigns running yet.</p>
                  <p className="text-sm text-white/40 mb-6 mt-1 text-center max-w-sm">Launch your first campaign to start tracking engagement and performance metrics here.</p>
                  <Link href="/dashboard/creator/campaigns/new">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Create Campaign</Button>
                  </Link>
                </div>
             ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A1128', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="clicks" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card className="col-span-3 bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" /> Live Activity Feed
            </CardTitle>
            <p className="text-sm text-white/50">Real-time engagement on your campaigns</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {data?.totalCampaigns === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                    <Eye className="w-8 h-8 text-white/20 mb-3" />
                    <p className="text-sm text-white/60 font-medium">It's quiet here.</p>
                    <p className="text-xs text-white/40 mt-1">Your activity feed will populate once users interact with your campaigns.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                    {/* Mock Activity Items */}
                    <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <p className="text-sm text-white font-medium">User94 completed task</p>
                        <p className="text-xs text-white/50 mt-0.5">Campaign: "Spring Product Launch"</p>
                        <p className="text-xs text-white/30 mt-1">2 mins ago</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm text-white font-medium">Campaign Milestone Reached</p>
                        <p className="text-xs text-white/50 mt-0.5">"Tech Review" crossed 1,000 views!</p>
                        <p className="text-xs text-white/30 mt-1">15 mins ago</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <p className="text-sm text-white font-medium">User77 completed task</p>
                        <p className="text-xs text-white/50 mt-0.5">Campaign: "Spring Product Launch"</p>
                        <p className="text-xs text-white/30 mt-1">22 mins ago</p>
                      </div>
                    </div>
                  </div>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
