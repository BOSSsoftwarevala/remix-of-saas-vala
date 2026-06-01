import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseData } from '@/hooks/useFranchiseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  createdAt: string;
  value: number;
}

export default function FranchiseLeads() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { franchiseData, loading } = useFranchiseData(user?.id);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Mock leads data
    const mockLeads: Lead[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-234-567-8900',
        status: 'new',
        createdAt: new Date().toISOString(),
        value: 5000,
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+1-234-567-8901',
        status: 'contacted',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        value: 7500,
      },
      {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '+1-234-567-8902',
        status: 'converted',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        value: 10000,
      },
    ];
    setLeads(mockLeads);
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

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
              <h1 className="text-3xl font-black text-foreground">Franchise Leads</h1>
              <p className="text-sm text-muted-foreground">Manage and track your leads</p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border/60 bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Leads Table */}
        <Card className="overflow-hidden border border-border/60">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60">
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Value</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/60 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{lead.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">${lead.value}</td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No leads found</p>
          </div>
        )}
      </main>
    </div>
  );
}