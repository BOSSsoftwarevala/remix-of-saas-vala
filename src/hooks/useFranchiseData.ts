import { useState, useEffect } from 'react';

interface FranchiseData {
  id: string;
  territory: string;
  status: 'active' | 'inactive' | 'suspended';
  revenue: number;
  activeLeads: number;
  conversionRate: number;
  totalPayouts: number;
  commissionRate: number;
  createdAt: string;
}

export function useFranchiseData(userId?: string) {
  const [franchiseData, setFranchiseData] = useState<FranchiseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockData: FranchiseData = {
          id: 'franchise-' + userId,
          territory: 'North Region',
          status: 'active',
          revenue: 125000,
          activeLeads: 45,
          conversionRate: 28,
          totalPayouts: 95000,
          commissionRate: 20,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setFranchiseData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch franchise data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { franchiseData, loading, error };
}