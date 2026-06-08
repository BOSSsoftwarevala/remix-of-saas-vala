import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase, Package, ShoppingCart, KeyRound, Star, DollarSign, Trophy,
  TrendingUp, Users, Download, MessageSquare, Sparkles, Plus, Megaphone,
  BarChart3, FileText, Settings, Globe, Wallet, ShieldCheck, Bot,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Stat { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; hint?: string }

function StatCard({ s }: { s: Stat }) {
  const Icon = s.icon;
  return (
    <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{s.label}</p>
          <p className="text-xl font-semibold tracking-tight">{s.value}</p>
          {s.hint && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{s.hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const MODULE_GROUPS: { title: string; items: { name: string; icon: React.ComponentType<{ className?: string }>; href?: string }[] }[] = [
  {
    title: 'Build & Publish',
    items: [
      { name: 'Product Factory', icon: Package, href: '/products' },
      { name: 'Development Center', icon: Sparkles },
      { name: 'Version Control', icon: FileText },
      { name: 'Documentation', icon: FileText },
      { name: 'Marketplace', icon: Globe, href: '/marketplace' },
    ],
  },
  {
    title: 'Sell & License',
    items: [
      { name: 'Orders', icon: ShoppingCart },
      { name: 'Customers', icon: Users },
      { name: 'Licenses', icon: KeyRound, href: '/keys' },
      { name: 'Subscriptions', icon: ShieldCheck, href: '/subscription' },
      { name: 'Renewals', icon: TrendingUp },
    ],
  },
  {
    title: 'Grow & Engage',
    items: [
      { name: 'Support', icon: MessageSquare, href: '/support' },
      { name: 'Reviews', icon: Star },
      { name: 'Marketing', icon: Megaphone },
      { name: 'SEO', icon: Globe, href: '/seo-leads' },
      { name: 'AI Product Coach', icon: Bot },
    ],
  },
  {
    title: 'Earn & Achieve',
    items: [
      { name: 'Revenue', icon: DollarSign },
      { name: 'Payouts', icon: Wallet, href: '/wallet' },
      { name: 'Analytics', icon: BarChart3, href: '/analytics-pwa' },
      { name: 'Achievements', icon: Trophy, href: '/admin/achievements' },
      { name: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
];

export default function AuthorDashboard() {
  const { user, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [downloads, setDownloads] = useState(0);
  const [supportOpen, setSupportOpen] = useState(0);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      // Author scope: own products if not super_admin
      let productQuery = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!isSuperAdmin) productQuery = productQuery.eq('created_by', user.id);
      const { data: prods } = await productQuery.limit(200);
      const productIds = (prods ?? []).map((p: any) => p.id);

      const [ordersRes, licensesRes, reviewsRes, supportRes] = await Promise.all([
        productIds.length
          ? supabase.from('marketplace_orders').select('id, status, amount, currency, product_id, created_at').in('product_id', productIds).order('created_at', { ascending: false }).limit(50)
          : Promise.resolve({ data: [] as any[] }),
        productIds.length
          ? supabase.from('license_keys').select('id, key_code, status, product_id, expires_at, created_at').in('product_id', productIds).order('created_at', { ascending: false }).limit(50)
          : Promise.resolve({ data: [] as any[] }),
        productIds.length
          ? supabase.from('marketplace_reviews').select('id, rating, comment, product_id, created_at').in('product_id', productIds).order('created_at', { ascending: false }).limit(50)
          : Promise.resolve({ data: [] as any[] }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'pending']),
      ]);

      if (cancelled) return;
      setProducts(prods ?? []);
      setOrders((ordersRes as any).data ?? []);
      setLicenses((licensesRes as any).data ?? []);
      setReviews((reviewsRes as any).data ?? []);
      setDownloads((prods ?? []).reduce((acc: number, p: any) => acc + (p.download_count || 0), 0));
      setSupportOpen((supportRes as any).count ?? 0);
      setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [user?.id, isSuperAdmin]);

  const stats: Stat[] = useMemo(() => {
    const active = products.filter((p) => p.status === 'active').length;
    const draft = products.filter((p) => p.status === 'draft').length;
    const completed = orders.filter((o) => ['completed', 'success'].includes(String(o.status).toLowerCase()));
    const revenue = completed.reduce((s, o) => s + Number(o.amount || 0), 0);
    const activeLicenses = licenses.filter((l) => l.status === 'active').length;
    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
      : '—';
    return [
      { label: 'Total Products', value: products.length, icon: Package, hint: `${active} active · ${draft} draft` },
      { label: 'Active Licenses', value: activeLicenses, icon: KeyRound },
      { label: 'Orders', value: orders.length, icon: ShoppingCart, hint: `${completed.length} completed` },
      { label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: DollarSign },
      { label: 'Downloads', value: downloads.toLocaleString('en-IN'), icon: Download },
      { label: 'Reviews', value: reviews.length, icon: Star, hint: `Avg ${avgRating}` },
      { label: 'Support Open', value: supportOpen, icon: MessageSquare },
      { label: 'Customers', value: new Set(orders.map((o) => o.user_id).filter(Boolean)).size || completed.length, icon: Users },
    ];
  }, [products, orders, licenses, reviews, downloads, supportOpen]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name?.toLowerCase().includes(q) || p.product_code?.toLowerCase().includes(q));
  }, [products, productSearch]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Hero */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-purple-500/[0.08] via-transparent to-blue-500/[0.05] p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center ring-1 ring-white/10">
              <Briefcase className="h-7 w-7 text-purple-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-300/80 font-semibold">Author Hub</p>
              <h1 className="text-2xl font-bold tracking-tight">Software Author Dashboard</h1>
              <p className="text-sm text-muted-foreground">Create · Publish · Sell · License · Support · Earn</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/add-product"><Plus className="h-4 w-4" /> New Product</Link>
            </Button>
            <Button asChild variant="premium">
              <Link to="/marketplace"><Globe className="h-4 w-4" /> View Marketplace</Link>
            </Button>
          </div>
        </div>

        {/* Command Center */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[88px] rounded-lg" />)
            : stats.map((s) => <StatCard key={s.label} s={s} />)}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Command Center</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="modules">All Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Latest Orders</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm border-b border-white/[0.04] pb-2">
                      <span className="truncate">{o.id.slice(0, 8)}…</span>
                      <Badge variant="outline">{o.status}</Badge>
                      <span className="font-medium">{o.currency || '₹'} {Number(o.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  {!orders.length && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Recent Reviews</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {reviews.slice(0, 5).map((r) => (
                    <div key={r.id} className="text-sm border-b border-white/[0.04] pb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{r.rating}/5</span>
                      </div>
                      {r.comment && <p className="text-muted-foreground line-clamp-2">{r.comment}</p>}
                    </div>
                  ))}
                  {!reviews.length && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="max-w-sm" />
              <Button asChild variant="outline"><Link to="/admin/add-product"><Plus className="h-4 w-4" /> Create</Link></Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.slice(0, 50).map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.product_code}</TableCell>
                        <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                        <TableCell>{p.currency || '₹'} {Number(p.price || 0).toLocaleString()}</TableCell>
                        <TableCell>{p.download_count || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm"><Link to={`/product/${p.id}`}>View</Link></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filteredProducts.length && (
                      <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No products. Create your first one.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}…</TableCell>
                        <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                        <TableCell>{o.currency || '₹'} {Number(o.amount || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {!orders.length && <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No orders yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenses" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-mono text-xs">{l.key_code}</TableCell>
                        <TableCell><Badge variant="outline">{l.status}</Badge></TableCell>
                        <TableCell className="text-xs">{l.expires_at ? new Date(l.expires_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {!licenses.length && <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No licenses generated.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 flex gap-3">
                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm">{r.comment || <span className="text-muted-foreground italic">No comment</span>}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!reviews.length && <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>}
          </TabsContent>

          <TabsContent value="modules" className="mt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {MODULE_GROUPS.map((g) => (
                <Card key={g.title}>
                  <CardHeader className="pb-2"><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">{g.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-1">
                    {g.items.map((it) => {
                      const Icon = it.icon;
                      const body = (
                        <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-white/[0.05] text-sm transition-colors">
                          <Icon className="h-4 w-4 text-primary/80" />
                          <span>{it.name}</span>
                          {!it.href && <Badge variant="outline" className="ml-auto text-[9px]">Soon</Badge>}
                        </div>
                      );
                      return it.href ? <Link key={it.name} to={it.href}>{body}</Link> : <div key={it.name}>{body}</div>;
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}