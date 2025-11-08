import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { analysisData, imageUrl } = location.state || {};

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'Not supported',
        description: 'Text-to-speech is not supported in your browser',
        variant: 'destructive',
      });
    }
  };

  if (!analysisData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No analysis data available</p>
              <Button onClick={() => navigate('/scan')} className="mt-4">
                Start New Scan
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Analyzed plant"
                  className="w-full h-auto max-h-64 object-contain rounded-lg mb-4 bg-muted"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Plant Information
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTextToSpeech(`${analysisData.plantName}. ${analysisData.disease}`)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Plant Name</h3>
                <p className="text-muted-foreground">{analysisData.plantName}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg">Detected Disease</h3>
                <p className="text-muted-foreground">{analysisData.disease}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Cause
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTextToSpeech(analysisData.cause)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysisData.cause}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Symptoms
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTextToSpeech(analysisData.symptoms)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysisData.symptoms}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Treatment
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTextToSpeech(analysisData.treatment)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysisData.treatment}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Prevention
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTextToSpeech(analysisData.prevention)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysisData.prevention}</p>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => navigate('/scan')} className="flex-1">
              Start New Scan
            </Button>
            <Button variant="outline" onClick={() => navigate('/history')} className="flex-1">
              View History
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
