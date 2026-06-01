import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FranchiseUser {
  id: string;
  name: string;
  email: string;
  territory: string;
  status: 'active' | 'inactive' | 'suspended';
  revenue: number;
  leads: number;
  joinDate: string;
}

export default function AdminFranchiseManager() {
  const navigate = useNavigate();
  const [franchises, setFranchises] = useState<FranchiseUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const mockFranchises: FranchiseUser[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@franchise.com',
        territory: 'North Region',
        status: 'active',
        revenue: 45000,
        leads: 125,
        joinDate: '2025-01-15',
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@franchise.com',
        territory: 'South Region',
        status: 'active',
        revenue: 38000,
        leads: 98,
        joinDate: '2025-02-20',
      },
      {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@franchise.com',
        territory: 'East Region',
        status: 'inactive',
        revenue: 12000,
        leads: 32,
        joinDate: '2025-03-10',
      },
    ];
    setFranchises(mockFranchises);
  }, []);

  const filteredFranchises = franchises.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.territory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-foreground">Franchise Manager</h1>
              <p className="text-sm text-muted-foreground">Manage all franchises</p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Franchise
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by name, email, or territory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border border-border/60">
            <p className="text-xs text-muted-foreground mb-2">Total Franchises</p>
            <p className="text-3xl font-black text-foreground">{franchises.length}</p>
          </Card>
          <Card className="p-6 border border-border/60">
            <p className="text-xs text-muted-foreground mb-2">Active</p>
            <p className="text-3xl font-black text-green-600">{franchises.filter(f => f.status === 'active').length}</p>
          </Card>
          <Card className="p-6 border border-border/60">
            <p className="text-xs text-muted-foreground mb-2">Total Revenue</p>
            <p className="text-3xl font-black text-primary">${franchises.reduce((sum, f) => sum + f.revenue, 0)}</p>
          </Card>
        </div>

        {/* Franchises Table */}
        <Card className="overflow-hidden border border-border/60">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60">
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Territory</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Leads</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFranchises.map((franchise) => (
                <tr key={franchise.id} className="border-b border-border/60 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{franchise.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{franchise.territory}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{franchise.email}</td>
                  <td className="px-6 py-4 font-bold text-primary">${franchise.revenue}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{franchise.leads}</td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[franchise.status]}>{franchise.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Edit className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}