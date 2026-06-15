'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Megaphone, TrendingUp, CreditCard, Activity, UserPlus, CheckCircle, Loader2, ShieldAlert } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';

const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());

export default function AdminDashboard() {
  const { token } = useAuth();
  
  const { data, error, isLoading } = useSWR(
    token ? ['/api/dashboard/admin', token] : null,
    ([url, t]) => fetcher(url, t),
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  const stats = [
    { title: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { title: 'Total Creators', value: data?.totalCreators || 0, icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { title: 'Active Campaigns', value: data?.totalCampaigns || 0, icon: Megaphone, color: 'text-green-400', bg: 'bg-green-500/20' },
    { title: 'Total Revenue', value: `${data?.platformRevenue || 0} Coins`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      {/* Premium Header */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-red-500/10 via-[#0A1128] to-[#0A1128] border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 text-red-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">God Mode</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Admin Command Center
            </h1>
            <p className="text-white/60 mt-2 text-lg">
              Full platform overview and security controls. All systems are operating normally.
            </p>
          </div>
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
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/50 to-orange-500/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl relative overflow-hidden">
          <CardHeader className="relative z-10">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" /> Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3">
             <div className="text-center p-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
               <CheckCircle className="w-12 h-12 mx-auto text-green-400/50 mb-4" />
               <p className="text-white/80 font-bold text-lg">Inbox Zero</p>
               <p className="text-sm text-white/50 mt-1">No pending withdrawals or flags.</p>
             </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl relative overflow-hidden">
          <CardHeader className="relative z-10">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" /> System Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3">
             <div className="text-center p-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
               <Activity className="w-12 h-12 mx-auto text-white/20 mb-4" />
               <p className="text-white/80 font-bold text-lg">System Logs Clear</p>
               <p className="text-sm text-white/50 mt-1">Real-time platform logs will appear here.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
