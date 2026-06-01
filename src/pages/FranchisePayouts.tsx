import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFranchiseData } from '@/hooks/useFranchiseData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  period: string;
  reference: string;
}

export default function FranchisePayouts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { franchiseData, loading } = useFranchiseData(user?.id);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    const mockPayouts: Payout[] = [
      {
        id: '1',
        date: new Date().toISOString(),
        amount: 5000,
        status: 'processed',
        period: 'May 2026',
        reference: 'PAY-2026-05-001',
      },
      {
        id: '2',
        date: new Date(Date.now() - 2592000000).toISOString(),
        amount: 4500,
        status: 'processed',
        period: 'April 2026',
        reference: 'PAY-2026-04-001',
      },
      {
        id: '3',
        date: new Date(Date.now() - 5184000000).toISOString(),
        amount: 5250,
        status: 'pending',
        period: 'March 2026',
        reference: 'PAY-2026-03-001',
      },
    ];
    setPayouts(mockPayouts);
  }, []);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

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
            <h1 className="text-3xl font-black text-foreground">Franchise Payouts</h1>
            <p className="text-sm text-muted-foreground">Track commission and payout history</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 border border-border/60 bg-primary/5">
            <p className="text-xs text-muted-foreground mb-2">Total Payouts</p>
            <p className="text-3xl font-black text-primary">${totalPayouts}</p>
            <p className="text-xs text-green-500 mt-2">All time</p>
          </Card>
          <Card className="p-6 border border-border/60 bg-yellow-500/5">
            <p className="text-xs text-muted-foreground mb-2">Pending Payouts</p>
            <p className="text-3xl font-black text-yellow-600">${pendingPayouts}</p>
            <p className="text-xs text-yellow-600 mt-2">{payouts.filter(p => p.status === 'pending').length} pending</p>
          </Card>
          <Card className="p-6 border border-border/60 bg-green-500/5">
            <p className="text-xs text-muted-foreground mb-2">Average Payout</p>
            <p className="text-3xl font-black text-green-600">${Math.round(totalPayouts / payouts.length)}</p>
            <p className="text-xs text-green-600 mt-2">Per month</p>
          </Card>
        </div>

        {/* Payouts Table */}
        <Card className="overflow-hidden border border-border/60">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60">
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Period</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-border/60 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{payout.period}</td>
                  <td className="px-6 py-4 font-bold text-primary">${payout.amount}</td>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{payout.reference}</td>
                  <td className="px-6 py-4">
                    <Badge className={statusColors[payout.status]}>{payout.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(payout.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-3 w-3" /> Invoice
                    </Button>
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