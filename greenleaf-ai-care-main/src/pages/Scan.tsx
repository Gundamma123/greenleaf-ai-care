import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/DashboardLayout';

const Scan = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: 'No image selected',
        description: 'Please select an image to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      
      reader.onload = async () => {
        const base64Image = reader.result as string;

        // Call the analyze-disease edge function
        const { data, error } = await supabase.functions.invoke('analyze-disease', {
          body: { imageUrl: base64Image }
        });

        if (error) throw error;

        // Save to scan history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('scan_history').insert({
            user_id: user.id,
            image_url: base64Image,
            plant_name: data.plantName,
            disease: data.disease,
            cause: data.cause,
            symptoms: data.symptoms,
            treatment: data.treatment,
            prevention: data.prevention,
          });
        }

        // Navigate to results with data
        navigate('/results', { state: { analysisData: data, imageUrl: base64Image } });
      };

      reader.onerror = () => {
        throw new Error('Failed to read image file');
      };
    } catch (error: any) {
      toast({
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze image',
        variant: 'destructive',
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>New Disease Scan</CardTitle>
            <CardDescription>Upload a plant image to detect diseases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!previewUrl ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Choose an image</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a photo or upload from gallery
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild>
                      <label>
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </Button>
                    <Button variant="outline" asChild>
                      <label>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Selected plant"
                    className="w-full h-auto max-h-96 object-contain bg-muted"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Disease'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl('');
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Scan;
