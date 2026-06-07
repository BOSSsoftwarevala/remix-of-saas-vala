import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Award, Sparkles, Users, Plus, Copy, Archive, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category_id: string | null;
  applies_to_role: string | null;
  xp_reward: number;
  point_reward: number;
  rarity: string;
  status: string;
  is_repeatable: boolean;
  archived_at: string | null;
  created_at: string;
}

interface Category { id: string; name: string; slug: string }

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const ROLES = ['', 'developer', 'reseller', 'vendor', 'franchise', 'customer', 'support', 'marketing', 'finance', 'admin'];

const emptyForm: Partial<Achievement> = {
  code: '', name: '', description: '', category_id: null, applies_to_role: '',
  xp_reward: 0, point_reward: 0, rarity: 'common', status: 'active', is_repeatable: false,
};

export default function AchievementsAdmin() {
  const { toast } = useToast();
  const [items, setItems] = useState<Achievement[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocksToday, setUnlocksToday] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [topAchievers, setTopAchievers] = useState<{ user_id: string; count: number }[]>([]);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Achievement> | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: achs }, { data: c }] = await Promise.all([
      supabase.from('achievements').select('*').order('created_at', { ascending: false }),
      supabase.from('achievement_categories').select('id, name, slug').order('sort_order'),
    ]);
    setItems((achs as Achievement[]) ?? []);
    setCats((c as Category[]) ?? []);

    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const { count: todayCount } = await supabase
      .from('achievement_logs').select('*', { count: 'exact', head: true })
      .gte('unlocked_at', startOfDay.toISOString());
    setUnlocksToday(todayCount ?? 0);

    const { count: pendCount } = await supabase
      .from('reward_transactions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    setPendingRewards(pendCount ?? 0);

    const { data: lb } = await supabase
      .from('leaderboards').select('user_id, score').eq('scope', 'global').order('score', { ascending: false }).limit(5);
    setTopAchievers((lb ?? []).map((r: any) => ({ user_id: r.user_id, count: Number(r.score) })));

    setLoading(false);
  };

  useEffect(() => { void loadAll(); }, []);

  const filtered = useMemo(() => items.filter(i => {
    if (!showArchived && i.archived_at) return false;
    if (showArchived && !i.archived_at) return false;
    if (search && !`${i.name} ${i.code}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, search, showArchived]);

  const totalActive = items.filter(i => !i.archived_at && i.status === 'active').length;

  const openCreate = () => { setEditing({ ...emptyForm }); setOpen(true); };
  const openEdit = (a: Achievement) => { setEditing({ ...a }); setOpen(true); };
  const cloneOne = async (a: Achievement) => {
    const { id, created_at, ...rest } = a;
    const payload = { ...rest, code: `${a.code}-copy-${Date.now().toString(36)}`, name: `${a.name} (Copy)`, archived_at: null };
    const { error } = await supabase.from('achievements').insert(payload as any);
    if (error) toast({ title: 'Clone failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Cloned' }); void loadAll(); }
  };
  const archive = async (a: Achievement) => {
    const { error } = await supabase.from('achievements').update({ archived_at: a.archived_at ? null : new Date().toISOString() }).eq('id', a.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: a.archived_at ? 'Restored' : 'Archived' }); void loadAll(); }
  };
  const remove = async (a: Achievement) => {
    if (!confirm(`Delete achievement "${a.name}"?`)) return;
    const { error } = await supabase.from('achievements').delete().eq('id', a.id);
    if (error) toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Deleted' }); void loadAll(); }
  };

  const save = async () => {
    if (!editing) return;
    const payload: any = {
      code: editing.code?.trim(),
      name: editing.name?.trim(),
      description: editing.description ?? null,
      category_id: editing.category_id || null,
      applies_to_role: editing.applies_to_role || null,
      xp_reward: Number(editing.xp_reward ?? 0),
      point_reward: Number(editing.point_reward ?? 0),
      rarity: editing.rarity || 'common',
      status: editing.status || 'active',
      is_repeatable: !!editing.is_repeatable,
    };
    if (!payload.code || !payload.name) { toast({ title: 'Code and name required', variant: 'destructive' }); return; }
    const res = editing.id
      ? await supabase.from('achievements').update(payload).eq('id', editing.id)
      : await supabase.from('achievements').insert(payload);
    if (res.error) { toast({ title: 'Save failed', description: res.error.message, variant: 'destructive' }); return; }
    toast({ title: editing.id ? 'Updated' : 'Created' });
    setOpen(false); setEditing(null); void loadAll();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" /> Achievement Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Central gamification system — rewards, XP, ranks, trophies and leaderboards across SaaS VALA.
            </p>
          </div>
        </header>

        <Tabs defaultValue="center">
          <TabsList>
            <TabsTrigger value="center">Command Center</TabsTrigger>
            <TabsTrigger value="library">Achievement Library</TabsTrigger>
          </TabsList>

          <TabsContent value="center" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Achievements" value={totalActive} icon={<Award className="h-4 w-4" />} />
              <StatCard label="Unlocked Today" value={unlocksToday} icon={<Sparkles className="h-4 w-4" />} />
              <StatCard label="Pending Rewards" value={pendingRewards} icon={<Trophy className="h-4 w-4" />} />
              <StatCard label="Top Achievers" value={topAchievers.length} icon={<Users className="h-4 w-4" />} />
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Leaderboard — Global</CardTitle></CardHeader>
              <CardContent>
                {topAchievers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No leaderboard data yet. Snapshots will appear here once XP starts flowing.</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>User</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {topAchievers.map((u, idx) => (
                        <TableRow key={u.user_id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-mono text-xs">{u.user_id}</TableCell>
                          <TableCell className="text-right">{u.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <Input placeholder="Search by name or code…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
                <div className="flex items-center gap-2">
                  <Switch id="archived" checked={showArchived} onCheckedChange={setShowArchived} />
                  <Label htmlFor="archived" className="text-sm">Show archived</Label>
                </div>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Achievement</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>{editing?.id ? 'Edit Achievement' : 'Create Achievement'}</DialogTitle></DialogHeader>
                  {editing && (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Code</Label><Input value={editing.code ?? ''} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></div>
                        <div><Label>Name</Label><Input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                      </div>
                      <div><Label>Description</Label><Textarea rows={2} value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Category</Label>
                          <Select value={editing.category_id ?? '__none'} onValueChange={(v) => setEditing({ ...editing, category_id: v === '__none' ? null : v })}>
                            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">None</SelectItem>
                              {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label>Applies to role</Label>
                          <Select value={editing.applies_to_role || '__any'} onValueChange={(v) => setEditing({ ...editing, applies_to_role: v === '__any' ? '' : v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__any">Any role</SelectItem>
                              {ROLES.filter(Boolean).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><Label>XP</Label><Input type="number" value={editing.xp_reward ?? 0} onChange={(e) => setEditing({ ...editing, xp_reward: Number(e.target.value) })} /></div>
                        <div><Label>Points</Label><Input type="number" value={editing.point_reward ?? 0} onChange={(e) => setEditing({ ...editing, point_reward: Number(e.target.value) })} /></div>
                        <div><Label>Rarity</Label>
                          <Select value={editing.rarity || 'common'} onValueChange={(v) => setEditing({ ...editing, rarity: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{RARITIES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2"><Switch checked={!!editing.is_repeatable} onCheckedChange={(v) => setEditing({ ...editing, is_repeatable: v })} /><Label>Repeatable</Label></div>
                        <div><Label className="mr-2">Status</Label>
                          <Select value={editing.status || 'active'} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                            <SelectTrigger className="w-32 inline-flex"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={save}>{editing?.id ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Rarity</TableHead>
                      <TableHead className="text-right">XP</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No achievements yet. Click "New Achievement" to create one.</TableCell></TableRow>
                    ) : filtered.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-xs">{a.code}</TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.applies_to_role || 'any'}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{a.rarity}</Badge></TableCell>
                        <TableCell className="text-right">{a.xp_reward}</TableCell>
                        <TableCell className="text-right">{a.point_reward}</TableCell>
                        <TableCell><Badge variant={a.archived_at ? 'secondary' : a.status === 'active' ? 'default' : 'outline'} className="capitalize">{a.archived_at ? 'archived' : a.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(a)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => cloneOne(a)} title="Clone"><Copy className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => archive(a)} title={a.archived_at ? 'Restore' : 'Archive'}><Archive className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => remove(a)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-muted-foreground text-xs">{label}{icon}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}