'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Globe, Mail, Phone, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function CMSGlobalSettings() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    websiteName: 'The Social Bite',
    logoUrl: '',
    faviconUrl: '',
    websiteUrl: 'http://localhost:3000',
    supportEmail: 'support@thesocialbite.com',
    contactNumber: '+91 99999 88888',
    socialLinks: {
      twitter: '',
      instagram: '',
      youtube: ''
    },
    copyrightText: '© 2026 The Social Bite Inc. All rights reserved.'
  });

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/cms/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      if (data.settings) {
        setSettings({
          websiteName: data.settings.websiteName || '',
          logoUrl: data.settings.logoUrl || '',
          faviconUrl: data.settings.faviconUrl || '',
          websiteUrl: data.settings.websiteUrl || '',
          supportEmail: data.settings.supportEmail || '',
          contactNumber: data.settings.contactNumber || '',
          socialLinks: {
            twitter: data.settings.socialLinks?.twitter || '',
            instagram: data.settings.socialLinks?.instagram || '',
            youtube: data.settings.socialLinks?.youtube || '',
            ...(data.settings.socialLinks || {})
          },
          copyrightText: data.settings.copyrightText || ''
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (key: string, val: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSocialChange = (key: string, val: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: val
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      toast.success('Website settings updated successfully');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12 text-white">
      {/* Back & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/cms">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Global Website Settings</h1>
            <p className="text-white/60 mt-1">Configure foundational settings and copyright information.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Settings */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" /> Basic Site Info
            </CardTitle>
            <CardDescription className="text-white/50">Core website identity and URLs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteName" className="text-white">Website Name</Label>
              <Input
                id="websiteName"
                value={settings.websiteName}
                onChange={(e) => handleTextChange('websiteName', e.target.value)}
                placeholder="The Social Bite"
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="text-white">Website URL</Label>
              <Input
                id="websiteUrl"
                value={settings.websiteUrl}
                onChange={(e) => handleTextChange('websiteUrl', e.target.value)}
                placeholder="https://thesocialbite.com"
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-white">Website Logo URL</Label>
              <Input
                id="logoUrl"
                value={settings.logoUrl}
                onChange={(e) => handleTextChange('logoUrl', e.target.value)}
                placeholder="/uploads/logo.png"
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
              {settings.logoUrl && (
                <div className="mt-2 p-2 bg-white/5 rounded-xl border border-white/10 inline-block">
                  <p className="text-xs text-white/40 mb-1">Preview:</p>
                  <img src={settings.logoUrl} alt="Logo Preview" className="h-8 object-contain" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl" className="text-white">Favicon URL</Label>
              <Input
                id="faviconUrl"
                value={settings.faviconUrl}
                onChange={(e) => handleTextChange('faviconUrl', e.target.value)}
                placeholder="/favicon.ico"
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact info */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-400" /> Support & Contact
            </CardTitle>
            <CardDescription className="text-white/50">Contact info displayed in headers and footers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail" className="text-white">Support Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleTextChange('supportEmail', e.target.value)}
                  placeholder="support@thesocialbite.com"
                  className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="text-white">Contact Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="contactNumber"
                  value={settings.contactNumber}
                  onChange={(e) => handleTextChange('contactNumber', e.target.value)}
                  placeholder="+91 99999 88888"
                  className="pl-10 bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="copyrightText" className="text-white">Footer Copyright Text</Label>
              <Input
                id="copyrightText"
                value={settings.copyrightText}
                onChange={(e) => handleTextChange('copyrightText', e.target.value)}
                placeholder="© 2026 The Social Bite Inc. All rights reserved."
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social channels */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-purple-400" /> Social Links
            </CardTitle>
            <CardDescription className="text-white/50">Redirect URLs for social media buttons.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="twitterLink" className="text-white">Twitter / X</Label>
              <Input
                id="twitterLink"
                value={settings.socialLinks.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="https://twitter.com/username"
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramLink" className="text-white">Instagram</Label>
              <Input
                id="instagramLink"
                value={settings.socialLinks.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/username"
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeLink" className="text-white">YouTube</Label>
              <Input
                id="youtubeLink"
                value={settings.socialLinks.youtube}
                onChange={(e) => handleSocialChange('youtube', e.target.value)}
                placeholder="https://youtube.com/c/channelname"
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
