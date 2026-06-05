'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Megaphone, TrendingUp, CreditCard, Activity, UserPlus, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Users', value: '2,847', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', change: '+124 this week' },
    { title: 'Total Creators', value: '312', icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10', change: '+18 this week' },
    { title: 'Active Campaigns', value: '89', icon: Megaphone, color: 'text-green-500', bg: 'bg-green-500/10', change: '12 pending review' },
    { title: 'Total Revenue', value: '₹4,52,000', icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10', change: '+22% this month' },
    { title: 'Pending Payouts', value: '₹38,500', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-500/10', change: '7 requests' },
    { title: 'Tasks Today', value: '1,234', icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/10', change: '+340 from yesterday' },
  ];

  const pendingActions = [
    { type: 'Campaign', label: 'FashionBrand "Summer Promo"', action: 'Needs Approval', badge: 'bg-yellow-500/10 text-yellow-500' },
    { type: 'Withdrawal', label: 'User @john requested ₹500', action: 'Pending Review', badge: 'bg-orange-500/10 text-orange-500' },
    { type: 'Creator', label: 'New creator registration: TechGuru', action: 'Verify Account', badge: 'bg-blue-500/10 text-blue-500' },
    { type: 'Campaign', label: 'ShopEasy "Flash Sale"', action: 'Needs Approval', badge: 'bg-yellow-500/10 text-yellow-500' },
    { type: 'Withdrawal', label: 'User @sarah requested ₹1,200', action: 'Pending Review', badge: 'bg-orange-500/10 text-orange-500' },
  ];

  const recentActivity = [
    { text: 'Campaign "Tech Review" approved', time: '5 min ago', icon: CheckCircle, color: 'text-green-500' },
    { text: 'User @alex completed 15 tasks', time: '12 min ago', icon: Activity, color: 'text-blue-500' },
    { text: 'Withdrawal of ₹800 paid to @mike', time: '1 hour ago', icon: CreditCard, color: 'text-orange-500' },
    { text: '23 new users signed up today', time: '2 hours ago', icon: UserPlus, color: 'text-purple-500' },
    { text: 'Campaign "Dance Reel" budget exhausted', time: '3 hours ago', icon: Megaphone, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Full platform overview and control center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-accent/50" />
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <Badge className={item.badge} variant="outline">{item.action}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`p-2 rounded-full bg-muted`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
