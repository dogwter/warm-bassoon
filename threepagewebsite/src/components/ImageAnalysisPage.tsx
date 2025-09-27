import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { ArrowLeft, Info, Eye, Palette, Sparkles, Upload } from "lucide-react";

interface ImageAnalysisPageProps {
  imageUrl: string;
  onBack: () => void;
  onNewImageUpload: (file: File) => void;
}

interface HotspotData {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function ImageAnalysisPage({ imageUrl, onBack, onNewImageUpload }: ImageAnalysisPageProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onNewImageUpload(file);
    }
  };

  const triggerFileInput = () => {
    const input = document.getElementById('new-file-input') as HTMLInputElement;
    input?.click();
  };

  // Mock hotspot data - in a real app, this would come from AI analysis
  const hotspots: HotspotData[] = [
    {
      id: "1",
      x: 25,
      y: 30,
      title: "Main Subject",
      description: "This appears to be the primary focus of the image. The lighting and composition draw attention to this area.",
      icon: <Eye className="w-4 h-4" />,
      color: "bg-blue-500"
    },
    {
      id: "2", 
      x: 70,
      y: 20,
      title: "Background Elements",
      description: "The background provides context and depth to the image. Notice the subtle details that complement the main subject.",
      icon: <Palette className="w-4 h-4" />,
      color: "bg-green-500"
    },
    {
      id: "3",
      x: 40,
      y: 70,
      title: "Interesting Detail",
      description: "This area contains interesting textures, colors, or patterns that add visual interest to the overall composition.",
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-purple-500"
    },
    {
      id: "4",
      x: 80,
      y: 60,
      title: "Color Harmony",
      description: "The colors in this region work well together, creating a pleasing visual balance in the image.",
      icon: <Info className="w-4 h-4" />,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#10101C" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <CardTitle>Image Analysis Results</CardTitle>
              <CardDescription>
                Click on the highlighted areas to learn more about different parts of your image
              </CardDescription>
            </div>
            <Button
              onClick={triggerFileInput}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Another Image
            </Button>
            <input
              id="new-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Image Display */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative inline-block w-full">
                  <img
                    src={imageUrl}
                    alt="Uploaded image for analysis"
                    className="w-full h-auto max-h-[600px] object-contain"
                  />
                  
                  {/* Hotspots */}
                  {hotspots.map((hotspot) => (
                    <Popover key={hotspot.id}>
                      <PopoverTrigger asChild>
                        <button
                          className={`absolute w-8 h-8 ${hotspot.color} text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse hover:animate-none border-2 border-white`}
                          style={{
                            left: `${hotspot.x}%`,
                            top: `${hotspot.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={() => setActiveHotspot(hotspot.id)}
                        >
                          {hotspot.icon}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 ${hotspot.color} text-white rounded-full flex items-center justify-center text-xs`}>
                              {hotspot.icon}
                            </div>
                            <h4 className="font-semibold">{hotspot.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {hotspot.description}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Analysis Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Detected Elements</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Objects</Badge>
                    <Badge variant="secondary">Colors</Badge>
                    <Badge variant="secondary">Textures</Badge>
                    <Badge variant="secondary">Composition</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Image Properties</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Quality: High Resolution</p>
                    <p>Lighting: Natural</p>
                    <p>Style: Photographic</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Hotspots</CardTitle>
                <CardDescription>
                  {hotspots.length} areas of interest identified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setActiveHotspot(hotspot.id)}
                    >
                      <div className={`w-6 h-6 ${hotspot.color} text-white rounded-full flex items-center justify-center text-xs flex-shrink-0`}>
                        {hotspot.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{hotspot.title}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {hotspot.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}