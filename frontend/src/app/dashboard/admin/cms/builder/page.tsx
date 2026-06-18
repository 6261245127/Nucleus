'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Eye, 
  EyeOff, 
  Edit3, 
  X, 
  Loader2,
  Plus,
  Trash2,
  Layout,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface CMSSection {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any;
  order: number;
  isVisible: boolean;
}

export default function CMSPageBuilder() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<CMSSection[]>([]);
  
  // Editor State
  const [editSection, setEditSection] = useState<CMSSection | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, category: string = 'OTHER') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const res = await fetch('/api/admin/cms/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      
      updateContentField(fieldName, data.media.url);
      toast.success('Image uploaded and applied!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    if (token) {
      fetchSections();
    }
  }, [token]);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/admin/cms/sections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load sections');
      const data = await res.json();
      setSections(data.sections || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (section: CMSSection) => {
    const updated = { ...section, isVisible: !section.isVisible };
    
    // Update local UI state
    setSections(prev => prev.map(s => s.id === section.id ? updated : s));

    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error('Failed to update visibility');
      toast.success(`${section.type} section visibility updated`);
    } catch (error: any) {
      toast.error(error.message);
      fetchSections();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    // Swap elements
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate orders
    const updatedSections = newSections.map((sec, idx) => ({ ...sec, order: idx }));
    setSections(updatedSections);

    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSections)
      });
      if (!res.ok) throw new Error('Failed to save layout order');
      toast.success('Landing page layout order updated');
    } catch (error: any) {
      toast.error(error.message);
      fetchSections();
    }
  };

  const handleOpenEdit = (section: CMSSection) => {
    setEditSection(JSON.parse(JSON.stringify(section))); // deep copy
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSection) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editSection)
      });
      if (!res.ok) throw new Error('Failed to save section content');
      toast.success('Section content updated successfully');
      setEditSection(null);
      fetchSections();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper helpers for editPlan features/items
  const updateContentField = (key: string, val: any) => {
    if (!editSection) return;
    setEditSection(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content: {
          ...prev.content,
          [key]: val
        }
      };
    });
  };

  const handleListFieldChange = (listKey: string, index: number, fieldKey: string, val: any) => {
    if (!editSection) return;
    const list = [...(editSection.content[listKey] || [])];
    list[index] = { ...list[index], [fieldKey]: val };
    updateContentField(listKey, list);
  };

  const addListItem = (listKey: string, defaultObj: any) => {
    if (!editSection) return;
    const list = [...(editSection.content[listKey] || [])];
    updateContentField(listKey, [...list, defaultObj]);
  };

  const removeListItem = (listKey: string, index: number) => {
    if (!editSection) return;
    const list = [...(editSection.content[listKey] || [])];
    list.splice(index, 1);
    updateContentField(listKey, list);
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
            <h1 className="text-3xl font-bold tracking-tight">Landing Page Builder</h1>
            <p className="text-white/60 mt-1">Reorder home page sections, toggle visibility, and update custom titles and texts.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Layout list */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white">Page Sections Layout</CardTitle>
            <CardDescription className="text-white/50">Manage rendering order and visibility.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section, idx) => (
                  <div 
                    key={section.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      editSection?.id === section.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToggleVisibility(section)}
                        className={`rounded-lg ${section.isVisible ? 'text-green-400' : 'text-white/30 hover:text-white'}`}
                      >
                        {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{section.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-white/40 truncate max-w-[150px]">{section.title || 'No Title'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="w-8 h-8 text-white/50 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="w-8 h-8 text-white/50 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(section)}
                        className="w-8 h-8 text-blue-400 hover:text-blue-300"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Editor Card */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl lg:col-span-2">
          {editSection ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" /> Edit {editSection.type.replace(/_/g, ' ')} Section
                  </CardTitle>
                  <CardDescription className="text-white/50">Edit title, subtitle, and custom variables.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditSection(null)} className="text-white hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSaveContent} className="space-y-6">
                  {/* Title & Subtitle */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-white">Section Title</Label>
                      <Input
                        value={editSection.title || ''}
                        onChange={(e) => setEditSection(prev => prev ? { ...prev, title: e.target.value } : null)}
                        placeholder="Section Title"
                        className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Section Subtitle</Label>
                      <Input
                        value={editSection.subtitle || ''}
                        onChange={(e) => setEditSection(prev => prev ? { ...prev, subtitle: e.target.value } : null)}
                        placeholder="Section Subtitle"
                        className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Section specific fields */}
                  {editSection.type === 'HERO' && (
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <h4 className="font-semibold text-white/80">Hero Media & Call-To-Action Options</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Primary Button Text</Label>
                          <Input
                            value={editSection.content.ctaText || ''}
                            onChange={(e) => updateContentField('ctaText', e.target.value)}
                            placeholder="Get Started"
                            className="bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Primary Button Link</Label>
                          <Input
                            value={editSection.content.ctaLink || ''}
                            onChange={(e) => updateContentField('ctaLink', e.target.value)}
                            placeholder="/register"
                            className="bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Secondary Button Text</Label>
                          <Input
                            value={editSection.content.secondaryCtaText || ''}
                            onChange={(e) => updateContentField('secondaryCtaText', e.target.value)}
                            placeholder="Learn More"
                            className="bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Secondary Button Link</Label>
                          <Input
                            value={editSection.content.secondaryCtaLink || ''}
                            onChange={(e) => updateContentField('secondaryCtaLink', e.target.value)}
                            placeholder="#how-it-works"
                            className="bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Hero Background / Main Image</Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            value={editSection.content.heroImage || ''}
                            onChange={(e) => updateContentField('heroImage', e.target.value)}
                            placeholder="/uploads/hero.png"
                            className="bg-white/5 border-white/10 text-white rounded-xl flex-1"
                          />
                          <div className="relative overflow-hidden inline-block shrink-0">
                            <Button type="button" disabled={uploadingImage} variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl relative">
                              {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                              Upload
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingImage}
                              onChange={(e) => handleImageUpload(e, 'heroImage', 'HERO')}
                              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {editSection.type === 'TRUST' && (
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <h4 className="font-semibold text-white/80">Trust Metrics List</h4>
                      <div className="space-y-3">
                        {(editSection.content.stats || []).map((stat: any, index: number) => (
                          <div key={index} className="flex gap-2 items-center border border-white/5 p-3 rounded-xl bg-white/5">
                            <div className="flex-1 space-y-1">
                              <Label className="text-xs">Value (e.g. 100k+)</Label>
                              <Input
                                value={stat.value || ''}
                                onChange={(e) => handleListFieldChange('stats', index, 'value', e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label className="text-xs">Label (e.g. Active Users)</Label>
                              <Input
                                value={stat.label || ''}
                                onChange={(e) => handleListFieldChange('stats', index, 'label', e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeListItem('stats', index)}
                              className="text-red-400 mt-5 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addListItem('stats', { label: 'New Metric', value: '0' })}
                          className="bg-primary/20 text-primary hover:bg-primary/30 rounded-xl"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Metric
                        </Button>
                      </div>
                    </div>
                  )}

                  {editSection.type === 'HOW_IT_WORKS' && (
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <h4 className="font-semibold text-white/80">Workflow Steps</h4>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {(editSection.content.steps || []).map((step: any, index: number) => (
                          <div key={index} className="space-y-2 border border-white/5 p-3 rounded-xl bg-white/5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white/40">Step #{index + 1}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeListItem('steps', index)}
                                className="text-red-400 rounded-lg w-8 h-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={step.title || ''}
                                onChange={(e) => handleListFieldChange('steps', index, 'title', e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={step.description || ''}
                                onChange={(e) => handleListFieldChange('steps', index, 'description', e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addListItem('steps', { title: 'New Step', description: 'Step description' })}
                          className="bg-primary/20 text-primary hover:bg-primary/30 rounded-xl"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Step
                        </Button>
                      </div>
                    </div>
                  )}

                  {editSection.type === 'FEATURES' && (
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <h4 className="font-semibold text-white/80">Features Items</h4>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {(editSection.content.features || []).map((feat: any, index: number) => (
                          <div key={index} className="space-y-2 border border-white/5 p-3 rounded-xl bg-white/5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white/40">Feature #{index + 1}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => removeListItem('features', index)}
                                className="text-red-400 rounded-lg w-8 h-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={feat.title || ''}
                                onChange={(e) => handleListFieldChange('features', index, 'title', e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                value={feat.description || ''}
                                onChange={(e) => handleListFieldChange('features', index, 'description', e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl text-sm"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addListItem('features', { title: 'New Feature', description: 'Feature description' })}
                          className="bg-primary/20 text-primary hover:bg-primary/30 rounded-xl"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Feature Item
                        </Button>
                      </div>
                    </div>
                  )}

                  {editSection.type === 'FINAL_CTA' && (
                    <div className="space-y-4 border-t border-white/5 pt-4">
                      <h4 className="font-semibold text-white/80">Call-To-Action Settings</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>CTA Button Text</Label>
                          <Input
                            value={editSection.content.ctaText || ''}
                            onChange={(e) => updateContentField('ctaText', e.target.value)}
                            placeholder="Sign Up Now"
                            className="bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA Button Link</Label>
                          <Input
                            value={editSection.content.ctaLink || ''}
                            onChange={(e) => updateContentField('ctaLink', e.target.value)}
                            placeholder="/register"
                            className="bg-white/5 border-white/10 text-white rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing / Testimonial / FAQs notice */}
                  {['PRICING', 'TESTIMONIALS', 'FAQ'].includes(editSection.type) && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-xs leading-relaxed text-white/70">
                      <strong>Note:</strong> The core items of this section (pricing cards, testimonial cards, or accordion questions) are managed in their dedicated managers:
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        <li>For pricing plans: <Link href="/dashboard/admin/cms/pricing" className="text-primary underline">Manage Pricing Plans</Link></li>
                        <li>For testimonial quotes: <Link href="/dashboard/admin/cms/testimonials" className="text-primary underline">Manage Testimonials</Link></li>
                        <li>For frequently asked questions: <Link href="/dashboard/admin/cms/faqs" className="text-primary underline">Manage FAQs</Link></li>
                      </ul>
                      However, you can still edit this section's main title and description above.
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                    <Button type="button" variant="outline" onClick={() => setEditSection(null)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Section Content
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Layout className="w-16 h-16 text-white/10 mb-4" />
              <h3 className="text-xl font-bold">No Section Selected</h3>
              <p className="text-sm text-white/40 max-w-sm mt-1">
                Select a section from the left side panel to customize its layout options, titles, subtitles, and buttons.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
