'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';

export default function NewCampaignPage() {
  const [formData, setFormData] = useState({
    name: '',
    platform: 'INSTAGRAM',
    url: '',
    description: '',
    durationDays: 7,
    niche: 'General',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, platform: value });
  };

  const handleNicheChange = (value: string) => {
    setFormData({ ...formData, niche: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        durationDays: Number(formData.durationDays),
      };

      const res = await fetch(`/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create campaign');
      }

      router.push('/dashboard/creator/campaigns');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">Launch a new promotion campaign to get engagement.</p>
        </div>
        <Link href="/dashboard/creator/campaigns">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Fill in the details for your new campaign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input id="name" placeholder="E.g. Summer Promo 2026" required value={formData.name} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={formData.platform} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                    <SelectItem value="FACEBOOK">Facebook</SelectItem>
                    <SelectItem value="YOUTUBE">YouTube</SelectItem>
                    <SelectItem value="THREADS">Threads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Post/Video URL</Label>
                <Input id="url" type="url" placeholder="https://..." required value={formData.url} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description & Instructions</Label>
              <Textarea 
                id="description" 
                placeholder="What should users do? E.g. Watch the video, like, and leave a genuine comment." 
                value={formData.description} 
                onChange={handleChange} 
              />
            </div>



            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationDays">Campaign Duration (Days)</Label>
                <Input id="durationDays" type="number" min="1" required value={formData.durationDays} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Niche/Category</Label>
                <Select value={formData.niche} onValueChange={handleNicheChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Fitness">Fitness</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Submit for Approval'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
