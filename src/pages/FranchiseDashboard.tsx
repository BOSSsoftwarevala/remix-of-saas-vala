import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseData } from '@/hooks/useFranchiseData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, Users, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FranchiseDashboard() {
  const { user } = useAuth();
  const { franchiseData, loading } = useFranchiseData(user?.id);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${franchiseData?.revenue || 0}`,
      icon: DollarSign,
      trend: '+12%',
      color: 'text-green-500',
    },
    {
      label: 'Active Leads',
      value: franchiseData?.activeLeads || 0,
      icon: Users,
      trend: '+5',
      color: 'text-blue-500',
    },
    {
      label: 'Conversion Rate',
      value: `${franchiseData?.conversionRate || 0}%`,
      icon: TrendingUp,
      trend: '+2%',
      color: 'text-purple-500',
    },
    {
      label: 'Total Payouts',
      value: `$${franchiseData?.totalPayouts || 0}`,
      icon: DollarSign,
      trend: 'Pending',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-2">Franchise Dashboard</h1>
          <p className="text-muted-foreground">Manage your franchise territory and performance</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['week', 'month', 'quarter', 'year'].map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-5 border border-border/60 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-foreground">{stat.value}</p>
                    <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" /> {stat.trend}
                    </p>
                  </div>
                  <div className={cn('p-3 rounded-lg bg-primary/10', stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Recent Leads</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage and track your pipeline</p>
            <Button variant="outline" className="w-full">View All</Button>
          </Card>
          <Card className="p-6 border border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Performance</h3>
            <p className="text-sm text-muted-foreground mb-4">Analytics and metrics</p>
            <Button variant="outline" className="w-full">View Analytics</Button>
          </Card>
          <Card className="p-6 border border-border/60 hover:border-primary/50 transition-colors cursor-pointer">
            <h3 className="font-bold text-foreground mb-2">Payouts</h3>
            <p className="text-sm text-muted-foreground mb-4">Commission tracking</p>
            <Button variant="outline" className="w-full">View Payouts</Button>
          </Card>
        </div>

        {/* Franchise Status */}
        <Card className="p-6 mt-8 border border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Franchise Status</h3>
              <p className="text-sm text-muted-foreground mt-1">Territory: {franchiseData?.territory || 'Not assigned'}</p>
            </div>
            <Badge className="bg-green-600 text-white">{franchiseData?.status || 'Active'}</Badge>
          </div>
        </Card>
      </main>
    </div>
  );
}