import { useEffect, useState } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

interface ScanRecord {
  id: string;
  created_at: string;
  plant_name: string;
  disease: string;
  cause: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  image_url: string;
}

const History = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load scan history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScans(scans.filter(scan => scan.id !== id));
      toast({
        title: 'Success',
        description: 'Scan deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete scan',
        variant: 'destructive',
      });
    }
  };

  const viewDetails = (scan: ScanRecord) => {
    navigate('/results', {
      state: {
        analysisData: {
          plantName: scan.plant_name,
          disease: scan.disease,
          cause: scan.cause,
          symptoms: scan.symptoms,
          treatment: scan.treatment,
          prevention: scan.prevention,
        },
        imageUrl: scan.image_url,
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Loading history...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>View your previous disease scans</CardDescription>
          </CardHeader>
          <CardContent>
            {scans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No scans yet</p>
                <Button onClick={() => navigate('/scan')}>Start Your First Scan</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scans.map((scan) => (
                  <Card key={scan.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      <img
                        src={scan.image_url}
                        alt={scan.plant_name}
                        className="w-full md:w-32 h-32 object-cover rounded-lg bg-muted"
                      />
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{scan.plant_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(scan.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Disease: {scan.disease}</p>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(scan)}
                          className="flex-1 md:flex-none"
                        >
                          <Eye className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                              <Trash2 className="h-4 w-4 md:mr-2" />
                              <span className="hidden md:inline">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete scan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this scan record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(scan.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default History;
