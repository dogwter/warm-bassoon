import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload } from "lucide-react";

interface LandingPageProps {
  onImageUpload: (file: File) => void;
}

export function LandingPage({ onImageUpload }: LandingPageProps) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Image Analyzer</CardTitle>
          <CardDescription>
            Upload an image to get detailed insights and descriptions of its contents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Choose an image from your device to begin the analysis process
            </p>
          </div>
          
          <Button 
            onClick={triggerFileInput}
            className="w-full h-12 flex items-center gap-2"
            size="lg"
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </Button>
          
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground text-center">
            Supported formats: JPG, PNG, GIF, WebP
          </p>
        </CardContent>
      </Card>
    </div>
  );
}