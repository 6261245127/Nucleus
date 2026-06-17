'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Megaphone, Wallet, LogOut, Loader2, Users, Settings, CreditCard, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.onboardingCompleted && user.role === 'VIEWER') {
        router.push('/onboarding');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const navLinks = user.role === 'ADMIN'
    ? [
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'Campaigns', href: '/dashboard/admin/campaigns', icon: Megaphone },
        { name: 'Withdrawals', href: '/dashboard/admin/withdrawals', icon: CreditCard },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
      ]
    : user.role === 'CREATOR' 
    ? [
        { name: 'Dashboard', href: '/dashboard/creator', icon: LayoutDashboard },
        { name: 'Campaigns', href: '/dashboard/creator/campaigns', icon: Megaphone },
        { name: 'Wallet', href: '/dashboard/creator/wallet', icon: Wallet },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard/viewer', icon: LayoutDashboard },
        { name: 'Tasks', href: '/dashboard/viewer/tasks', icon: Megaphone },
        { name: 'Wallet', href: '/dashboard/viewer/wallet', icon: Wallet },
      ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            The Social Bite
          </span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex md:hidden items-center justify-between px-4 border-b border-border bg-card">
          <span className="text-lg font-bold">The Social Bite</span>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-5 h-5 text-destructive" />
          </Button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
