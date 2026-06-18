'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Share2, Globe, Mail, Phone } from 'lucide-react';

interface LandingFooterProps {
  settings?: {
    websiteName: string;
    logoUrl?: string | null;
    socialLinks?: any;
    copyrightText?: string;
    supportEmail?: string | null;
    contactNumber?: string | null;
  } | null;
  menuItems?: {
    title: string;
    url: string;
  }[];
}

export default function LandingFooter({ settings, menuItems }: LandingFooterProps) {
  const [legalPages, setLegalPages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/legal')
      .then(res => res.json())
      .then(data => {
        if (data.pages) {
          setLegalPages(data.pages);
        }
      })
      .catch(console.error);
  }, []);

  const social = settings?.socialLinks || {};

  const displayLogo = settings?.logoUrl ? (
    <img src={settings.logoUrl} alt={settings.websiteName} className="h-8 object-contain" />
  ) : (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <Zap className="w-5 h-5 text-white" />
    </div>
  );

  return (
    <footer className="bg-[#050B22] border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              {displayLogo}
              <span className="text-xl font-bold text-white tracking-tight">
                {settings?.websiteName || 'The Social Bite'}
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm">
              The premier ecosystem for authentic creator growth and viewer rewards. Connecting audiences with the creators they love.
            </p>
            <div className="flex gap-4">
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </a>
              )}
              {settings?.supportEmail && (
                <a href={`mailto:${settings.supportEmail}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm text-white/50">
              {menuItems && menuItems.length > 0 ? (
                menuItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.url} className="hover:text-white transition-colors">
                      {item.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Contact Support</h4>
            <ul className="space-y-4 text-sm text-white/50">
              {settings?.supportEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors">
                    {settings.supportEmail}
                  </a>
                </li>
              )}
              {settings?.contactNumber && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span className="text-white/50">{settings.contactNumber}</span>
                </li>
              )}
            </ul>
          </div>
          
          {legalPages.length > 0 && (
            <div>
              <h4 className="text-white font-bold mb-6">Legal & Policies</h4>
              <ul className="space-y-4 text-sm text-white/50">
                {legalPages.map((page) => (
                  <li key={page.id}>
                    <Link href={`/legal/${page.slug}`} className="hover:text-white transition-colors">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            {settings?.copyrightText || '© 2026 The Social Bite Inc. All rights reserved.'}
          </p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <span>Status: All systems operational</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
