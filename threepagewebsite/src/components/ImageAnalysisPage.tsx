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

interface HotspotData {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

  // Mock hotspot data - in a real app, this would come from AI analysis
  const hotspots: HotspotData[] = [
    {
      id: "1",
      x: 25,
      y: 30,
      title: "Main Subject",
      description: "This appears to be the primary focus of the image. The lighting and composition draw attention to this area.",
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-purple-500"
    },
    {
      id: "2", 
      x: 70,
      y: 20,
      title: "Background Elements",
      description: "The background provides context and depth to the image. Notice the subtle details that complement the main subject.",
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-purple-500"
    },
    {
      id: "3",
      x: 40,
      y: 70,
      title: "Interesting Detail",
      description: "This area contains interesting textures, colors, or patterns that add visual interest to the overall composition.",
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-purple-500"
    }
  ];

  return (
    <div style={{ backgroundColor: "#10101C" }}>
      <div 
      style={{
            paddingLeft: '280px',
            paddingRight: '280px',
            paddingTop: '160px',
          }}>

        {/* Main Content */}
        <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
        }}>
          
          <div 
          style={{
          display: 'grid',
          gap: '50px'
        }}>
          <div
          style={{
          display: 'flex',
          gap: '80px',
          paddingLeft: '20px'
        }}>
          <div
          style={{
          width: '350px',
          color: "#fff",
        }}>Click on the highlighted areas for more detailed tips!</div>
          <Button
            onClick={triggerFileInput}
            className="w-10 h-12 flex items-center gap-2"
            size="lg"
            style={{ backgroundColor: "#5D5DA0", color: "#fff", border: "none" }}
          >
            <Upload className="w-5 h-5" />
            upload another screenshot
          </Button>
          <input
              id="new-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
        </div>
            <Card className="overflow-hidden"
            style={{
          width: "720px",
          height: "600px",
          maxWidth: "80vw",
          background: "#D9D9D9",
          position: "relative",
          zIndex: 1,
        }}>
              <CardContent className="p-0">
                <div >
                  <img
                    src={imageUrl}
                    alt="Uploaded image for analysis"
                    className="w-full h-full object-cover"
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
          <div
          style={{
          display: 'grid',
          gap: '40px'
        }}>
            <Card 
            style={{
            width: "360px",
            height: "240px",
            backgroundColor: "#B6B6FC30",
            boxShadow: "0 0 0 1px #5D5DA0 inset, 0 0 1px 1px #5D5DA0",
            filter: "blur(0px)",
          }}>
              
            </Card>

            <Card
            style={{
            width: "360px",
            height: "420px",
            backgroundColor: "#B6B6FC30",
            boxShadow: "0 0 0 1px #5D5DA0 inset, 0 0 1px 1px #5D5DA0",
            filter: "blur(0px)",
          }}>
              <CardHeader>
                <CardTitle style={{color: "#fff", fontSize: 25}}>UIverse Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                      onClick={() => setActiveHotspot(hotspot.id)}
                    >
                      <div className={`w-6 h-6 ${hotspot.color} text-white rounded-full flex items-center justify-center text-xs flex-shrink-0`}>
                        {hotspot.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-white">{hotspot.title}</h5>
                        <p className="text-xs text-white line-clamp-4"
                          style = {{fontWeight: 200}}>
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