import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ScanLine, AlertCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, issues: 0, successRate: 0 });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profile) setUserName(profile.name);

      const { data: scans } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id);

      if (scans) {
        const issues = scans.filter(s => s.disease.toLowerCase() !== 'healthy').length;
        setStats({
          total: scans.length,
          issues,
          successRate: scans.length > 0 ? Math.round(((scans.length - issues) / scans.length) * 100) : 100,
        });
      }
    };

    loadData();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName || 'Farmer'}!</h1>
          <p className="text-muted-foreground mt-2">Monitor your crop health and get AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <ScanLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Issues Detected</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.issues}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Start a New Scan</h2>
            <p className="mb-6 opacity-90">Upload a photo of your crop to get instant AI-powered disease detection and treatment recommendations.</p>
            <Button onClick={() => navigate('/scan')} variant="secondary" size="lg">
              Scan Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}