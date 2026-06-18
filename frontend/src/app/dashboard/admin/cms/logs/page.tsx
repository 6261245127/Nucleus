'use client';

import { useState, useEffect, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Activity, 
  Loader2,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  details: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function CMSActivityLogs() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/cms/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load audit logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith('CREATE_')) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (action.startsWith('UPDATE_') || action.startsWith('BULK_')) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    if (action.startsWith('DELETE_')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
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
            <h1 className="text-3xl font-bold tracking-tight">CMS Activity Logs</h1>
            <p className="text-white/60 mt-1">Audit log records detailing every content update made by administrators.</p>
          </div>
        </div>
      </div>

      <Card className="bg-[#0A1128]/80 backdrop-blur-xl border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Administrative Operations Audit Trail
          </CardTitle>
          <CardDescription className="text-white/50">
            Chronological log of changes to global settings, page builder sections, pricing plans, testimonials, faqs, navigation, and SEO configurations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20">
              <Activity className="w-12 h-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/80 font-bold">No activity logs found</p>
              <p className="text-sm text-white/50 mt-1">Actions taken inside CMS Control will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5 border-b border-white/10">
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-white font-bold w-12"></TableHead>
                    <TableHead className="text-white font-bold">Admin Email</TableHead>
                    <TableHead className="text-white font-bold">Action Taken</TableHead>
                    <TableHead className="text-white font-bold">Resource Affected</TableHead>
                    <TableHead className="text-white font-bold">Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    const details = log.details || {};
                    return (
                      <Fragment key={log.id}>
                        <TableRow 
                          className="hover:bg-white/5 border-b border-white/5 cursor-pointer"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        >
                          <TableCell className="text-center">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-white/40" />
                              {log.user?.email || details.adminEmail || 'System/Admin'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeColor(log.action)}`}>
                              {log.action}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-white/70">
                            {log.resource}
                          </TableCell>
                          <TableCell className="text-white/60 text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && (
                          <TableRow className="bg-black/20 hover:bg-black/20 border-b border-white/5">
                            <TableCell colSpan={5} className="p-4">
                              <div className="space-y-4 max-w-4xl">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Change Details</p>
                                
                                <div className="grid gap-4 md:grid-cols-2 text-xs">
                                  {details.previous && (
                                    <div className="space-y-1">
                                      <p className="text-red-400 font-bold">Previous Value:</p>
                                      <pre className="p-3 bg-white/5 rounded-xl border border-white/5 max-h-60 overflow-y-auto font-mono text-[11px] text-white/70 whitespace-pre-wrap">
                                        {JSON.stringify(details.previous, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  
                                  {details.updated && (
                                    <div className="space-y-1">
                                      <p className="text-green-400 font-bold">New Value:</p>
                                      <pre className="p-3 bg-white/5 rounded-xl border border-white/5 max-h-60 overflow-y-auto font-mono text-[11px] text-white/70 whitespace-pre-wrap">
                                        {JSON.stringify(details.updated, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {!details.previous && !details.updated && (
                                    <div className="space-y-1 md:col-span-2">
                                      <p className="text-white/60 font-semibold">Metadata details:</p>
                                      <pre className="p-3 bg-white/5 rounded-xl border border-white/5 max-h-60 overflow-y-auto font-mono text-[11px] text-white/70 whitespace-pre-wrap">
                                        {JSON.stringify(details, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
