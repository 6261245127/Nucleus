'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Globe, 
  Loader2,
  Share2,
  FileCode
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface SeoConfig {
  id: string;
  pagePath: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string | null;
  ogDescription: string | null;
  keywords: string | null;
  ogImage: string | null;
}

export default function CMSSeoManager() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoConfigs, setSeoConfigs] = useState<SeoConfig[]>([]);
  
  // Active selected path
  const [selectedPath, setSelectedPath] = useState('/');
  
  // Form Editor State
  const [formData, setFormData] = useState({
    metaTitle: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    keywords: '',
    ogImage: ''
  });

  const availablePaths = [
    { path: '/', label: 'Homepage' },
    { path: '/pricing', label: 'Pricing Plan page' },
    { path: '/terms', label: 'Terms & Conditions' },
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/contact', label: 'Contact Us page' }
  ];

  useEffect(() => {
    if (token) {
      fetchSeoConfigs();
    }
  }, [token]);

  useEffect(() => {
    // Populate form based on selected pagePath
    const config = seoConfigs.find(c => c.pagePath === selectedPath);
    if (config) {
      setFormData({
        metaTitle: config.metaTitle || '',
        metaDescription: config.metaDescription || '',
        ogTitle: config.ogTitle || '',
        ogDescription: config.ogDescription || '',
        keywords: config.keywords || '',
        ogImage: config.ogImage || ''
      });
    } else {
      setFormData({
        metaTitle: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
        keywords: '',
        ogImage: ''
      });
    }
  }, [selectedPath, seoConfigs]);

  const fetchSeoConfigs = async () => {
    try {
      const res = await fetch('/api/admin/cms/seo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load SEO configs');
      const data = await res.json();
      setSeoConfigs(data.seo || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.metaTitle || !formData.metaDescription) {
      toast.error('Meta title and description are required');
      return;
    }

    setSaving(true);
    const payload = {
      pagePath: selectedPath,
      ...formData
    };

    try {
      const res = await fetch('/api/admin/cms/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save SEO config');
      toast.success('SEO meta tags updated successfully');
      fetchSeoConfigs();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/cms">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SEO & Meta Tags Manager</h1>
            <p className="text-white/60 mt-1">Configure Search Engine Optimization and Social Share details per page.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Page Selector */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white">Target Page Path</CardTitle>
            <CardDescription className="text-white/50">Choose a page to configure SEO tags.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {availablePaths.map(p => {
              const hasConfig = seoConfigs.some(c => c.pagePath === p.path);
              return (
                <Button
                  key={p.path}
                  variant={selectedPath === p.path ? 'default' : 'ghost'}
                  onClick={() => setSelectedPath(p.path)}
                  className={`justify-between rounded-xl ${
                    selectedPath === p.path 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {p.label}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">{p.path}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* SEO Meta Forms */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl md:col-span-2">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-teal-400" /> Meta Configuration for {selectedPath}
            </CardTitle>
            <CardDescription className="text-white/50">Configure core HTML headers for crawling search bots.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Search Engine Optimization */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white/80 border-b border-white/5 pb-2">Search Engine Fields</h4>
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle" className="text-white">Meta Title Tag (`&lt;title&gt;`)</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="e.g. The Social Bite - Creator Growth & Viewer Rewards"
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDesc" className="text-white">Meta Description Tag</Label>
                    <Textarea
                      id="metaDesc"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="e.g. The premier ecosystem for creator growth and tasks rewards..."
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords" className="text-white">Keywords (comma separated)</Label>
                    <Input
                      id="metaKeywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="creator growth, earn coins, rewards, YouTube, Instagram"
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                    />
                  </div>
                </div>

                {/* Open Graph Social Sharing */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="font-semibold text-white/80 border-b border-white/5 pb-2 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-400" /> Open Graph Social Shares (Facebook, X, WhatsApp)
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="ogTitle" className="text-white">Open Graph Title (`og:title`)</Label>
                    <Input
                      id="ogTitle"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                      placeholder="e.g. The Social Bite - Grow & Earn"
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogDesc" className="text-white">Open Graph Description (`og:description`)</Label>
                    <Textarea
                      id="ogDesc"
                      value={formData.ogDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                      placeholder="e.g. Grow your channel or earn rewards for engagement tasks."
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogImage" className="text-white">Social Share Image URL (`og:image`)</Label>
                    <Input
                      id="ogImage"
                      value={formData.ogImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="https://images.unsplash.com/... or upload in Media Library"
                      className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save SEO Meta Tags
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
