'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  X, 
  Loader2,
  Menu as MenuIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  id: string;
  menuType: string;
  title: string;
  url: string;
  icon: string | null;
  order: number;
}

export default function CMSNavigation() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  // Filter by menuType
  const [activeMenuType, setActiveMenuType] = useState('HEADER');

  // Form Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: '',
    menuType: 'HEADER'
  });

  useEffect(() => {
    if (token) {
      fetchMenuItems();
    }
  }, [token]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/admin/cms/navigation', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load menu items');
      const data = await res.json();
      setMenuItems(data.menuItems || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditItemId(null);
    setFormData({
      title: '',
      url: '',
      icon: '',
      menuType: activeMenuType
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditItemId(item.id);
    setFormData({
      title: item.title,
      url: item.url,
      icon: item.icon || '',
      menuType: item.menuType
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      id: editItemId
    };

    try {
      const url = '/api/admin/cms/navigation';
      const method = editItemId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save menu item');
      toast.success(editItemId ? 'Menu item updated' : 'Menu item created');
      setIsEditing(false);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const res = await fetch(`/api/admin/cms/navigation?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete menu item');
      toast.success('Menu item deleted');
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    // Get menu items of the active menuType
    const activeItems = menuItems.filter(item => item.menuType === activeMenuType);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= activeItems.length) return;

    // Swap elements in activeItems
    const temp = activeItems[index];
    activeItems[index] = activeItems[targetIndex];
    activeItems[targetIndex] = temp;

    // Recalculate orders for activeItems
    const updatedActiveItems = activeItems.map((item, idx) => ({ ...item, order: idx }));

    // Merge back into the full list
    const otherItems = menuItems.filter(item => item.menuType !== activeMenuType);
    const mergedList = [...otherItems, ...updatedActiveItems];
    setMenuItems(mergedList);

    try {
      const res = await fetch('/api/admin/cms/navigation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedActiveItems)
      });
      if (!res.ok) throw new Error('Failed to save menu order');
      toast.success('Navigation order updated');
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message);
      fetchMenuItems();
    }
  };

  // Filter menu items for current view
  const currentMenu = menuItems
    .filter(item => item.menuType === activeMenuType)
    .sort((a, b) => a.order - b.order);

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
            <h1 className="text-3xl font-bold tracking-tight">Navigation Menus</h1>
            <p className="text-white/60 mt-1">Configure Header menu and Footer links dynamically.</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Menu Item
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Menu selectors */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white">Menu Target</CardTitle>
            <CardDescription className="text-white/50">Choose menu to edit.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { type: 'HEADER', label: 'Website Header Menu' },
              { type: 'FOOTER', label: 'Website Footer Links' }
            ].map(m => (
              <Button
                key={m.type}
                variant={activeMenuType === m.type ? 'default' : 'ghost'}
                onClick={() => {
                  setActiveMenuType(m.type);
                  setIsEditing(false);
                }}
                className={`justify-start rounded-xl ${
                  activeMenuType === m.type 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <MenuIcon className="w-4 h-4 mr-2" /> {m.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* List of items / Editor */}
        <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl md:col-span-2">
          {isEditing ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
                <div>
                  <CardTitle className="text-white">{editItemId ? 'Edit Menu Item' : 'Add Menu Item'}</CardTitle>
                  <CardDescription className="text-white/50">Modify the fields below to customize link target.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="text-white hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="itemTitle" className="text-white">Link Title</Label>
                      <Input
                        id="itemTitle"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Help Center"
                        className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemUrl" className="text-white">Redirect Link / Anchors</Label>
                      <Input
                        id="itemUrl"
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="e.g. /help or #features"
                        className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemIcon" className="text-white">Lucide Icon name (optional)</Label>
                      <Input
                        id="itemIcon"
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="e.g. Mail, Phone"
                        className="bg-white/5 border-white/10 text-white rounded-xl focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemType" className="text-white">Menu Placement</Label>
                      <Select 
                        value={formData.menuType} 
                        onValueChange={(val) => setFormData(prev => ({ ...prev, menuType: val }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                          <SelectValue placeholder="Placement" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A1128] border-white/10 text-white">
                          <SelectItem value="HEADER">Header</SelectItem>
                          <SelectItem value="FOOTER">Footer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Link
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MenuIcon className="w-5 h-5 text-primary" /> Active Links List
                </CardTitle>
                <CardDescription className="text-white/50">
                  Currently displaying links registered under {activeMenuType}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : currentMenu.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <MenuIcon className="w-12 h-12 mx-auto text-white/20 mb-4" />
                    <p className="text-white/80 font-bold">No links configured</p>
                    <p className="text-sm text-white/50 mt-1">Add links to the {activeMenuType.toLowerCase()} menu.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentMenu.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 border border-white/5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            {item.title}
                          </p>
                          <p className="text-xs text-white/40">{item.url}</p>
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
                            disabled={idx === currentMenu.length - 1}
                            className="w-8 h-8 text-white/50 hover:text-white disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(item)}
                            className="w-8 h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
