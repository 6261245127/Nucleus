'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Settings, 
  Layout, 
  Image, 
  CreditCard, 
  Menu, 
  MessageSquare, 
  HelpCircle, 
  Search, 
  Megaphone, 
  Activity, 
  ShieldAlert,
  FileText
} from 'lucide-react';

export default function CMSHubPage() {
  const sections = [
    {
      title: 'Global Settings',
      description: 'Configure site name, logo, favicon, email, contact, and social links.',
      icon: Settings,
      href: '/dashboard/admin/cms/settings',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Landing Page Builder',
      description: 'Rearrange homepage sections, toggle visibility, and update custom texts.',
      icon: Layout,
      href: '/dashboard/admin/cms/builder',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Media Library',
      description: 'Upload, manage, replace, and organize images across the platform.',
      icon: Image,
      href: '/dashboard/admin/cms/media',
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Pricing & Plans',
      description: 'Manage subscription plans, pricing, tags, features, and billing periods.',
      icon: CreditCard,
      href: '/dashboard/admin/cms/plans',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10'
    },
    {
      title: 'Navigation Menus',
      description: 'Customize header, footer, and sidebar links dynamically.',
      icon: Menu,
      href: '/dashboard/admin/cms/navigation',
      color: 'text-orange-400',
      bg: 'bg-orange-500/10'
    },
    {
      title: 'Testimonials',
      description: 'Manage creator and viewer reviews, roles, ratings, and avatars.',
      icon: MessageSquare,
      href: '/dashboard/admin/cms/testimonials',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10'
    },
    {
      title: 'FAQs Manager',
      description: 'Add, update, reorder, or delete frequently asked questions.',
      icon: HelpCircle,
      href: '/dashboard/admin/cms/faqs',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      title: 'SEO & Meta Tags',
      description: 'Configure titles, keywords, OG shares, and descriptions per page.',
      icon: Search,
      href: '/dashboard/admin/cms/seo',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10'
    },
    {
      title: 'Announcements',
      description: 'Schedule and toggle a global notification bar at the top of the site.',
      icon: Megaphone,
      href: '/dashboard/admin/cms/announcements',
      color: 'text-red-400',
      bg: 'bg-red-500/10'
    },
    {
      title: 'CMS Activity Logs',
      description: 'Track and review every single content change made by administrators.',
      icon: Activity,
      href: '/dashboard/admin/cms/logs',
      color: 'text-gray-400',
      bg: 'bg-gray-500/10'
    },
    {
      title: 'Legal & Policies',
      description: 'Manage Terms of Service, Privacy Policy, and other legal documents.',
      icon: FileText,
      href: '/dashboard/admin/cms/legal',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12 text-white"
    >
      {/* Header Banner */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-[#0A1128] to-[#0A1128] border border-white/10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 text-primary font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Super Admin Console</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Dynamic CMS Control Center
          </h1>
          <p className="text-white/60 mt-2 text-lg max-w-2xl">
            Manage your website content, assets, SEO, structure, and marketing settings live in real-time. No code changes or redeployments needed.
          </p>
        </div>
      </div>

      {/* Grid of options */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col justify-between bg-[#0A1128]/80 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl group overflow-hidden relative">
                <div>
                  <CardHeader className="flex flex-row items-center gap-4 pb-3">
                    <div className={`p-3 rounded-2xl ${sec.bg} ${sec.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white group-hover:text-primary transition-colors">{sec.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <CardDescription className="text-white/60 text-sm leading-relaxed">
                      {sec.description}
                    </CardDescription>
                  </CardContent>
                </div>
                <div className="px-6 pb-6">
                  <Link href={sec.href} className="w-full block">
                    <Button 
                      className="w-full bg-white/5 border border-white/10 hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-white transition-all text-white rounded-xl"
                      variant="outline"
                    >
                      Manage
                    </Button>
                  </Link>
                </div>
                {/* Micro animation bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
