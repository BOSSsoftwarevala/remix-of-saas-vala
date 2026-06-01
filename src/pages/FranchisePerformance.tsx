import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseData } from '@/hooks/useFranchiseData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Users, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FranchisePerformance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { franchiseData, loading } = useFranchiseData(user?.id);
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const metrics = [
    {
      id: 'revenue',
      label: 'Revenue',
      icon: TrendingUp,
      value: '$125,000',
      change: '+12.5%',
      data: [30, 35, 32, 40, 38, 45, 50],
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users,
      value: '342',
      change: '+8.2%',
      data: [20, 25, 22, 28, 30, 35, 40],
    },
    {
      id: 'conversions',
      label: 'Conversions',
      icon: Target,
      value: '28',
      change: '+5.3%',
      data: [5, 6, 5, 7, 7, 8, 9],
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground">Performance Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your franchise performance metrics</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.id;
            return (
              <Card
                key={metric.id}
                className={`p-6 border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border/60 hover:border-primary/50'
                }`}
                onClick={() => setSelectedMetric(metric.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
                    <p className="text-2xl font-black text-foreground mb-2">{metric.value}</p>
                    <p className="text-xs text-green-500 font-semibold">{metric.change}</p>
                  </div>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Chart Placeholder */}
        <Card className="p-8 border border-border/60 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-6">
            {metrics.find(m => m.id === selectedMetric)?.label} Trend (Last 7 Days)
          </h3>
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Chart visualization coming soon</p>
          </div>
        </Card>

        {/* Performance Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border border-border/60">
            <h3 className="font-bold text-foreground mb-4">Top Products</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-border/60 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-foreground">Product {i}</p>
                    <p className="text-xs text-muted-foreground">$12,500 revenue</p>
                  </div>
                  <span className="text-sm font-bold text-primary">+{15 - i * 2}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 border border-border/60">
            <h3 className="font-bold text-foreground mb-4">Territory Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Market Penetration</p>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-green-500"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-5/6 bg-blue-500"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}