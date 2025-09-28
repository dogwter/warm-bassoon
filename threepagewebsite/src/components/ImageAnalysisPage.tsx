import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { ArrowLeft, Info, Eye, Palette, Sparkles, Upload } from "lucide-react";


interface ImageAnalysisPageProps {
  imageUrl: string;
  analysisResult?: any;
  onBack: () => void;
  onNewImageUpload: (file: File) => void;
}

export function ImageAnalysisPage({ imageUrl, analysisResult, onBack, onNewImageUpload }: ImageAnalysisPageProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Debug logging
  console.log("ImageAnalysisPage - analysisResult:", analysisResult);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    // Immediately go to loading page with the new file
    onNewImageUpload(file);
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

  // Convert analysis critiques to hotspots
  const hotspots: HotspotData[] = analysisResult?.critiques?.map((critique: any, index: number) => ({
    id: (index + 1).toString(),
    x: (critique.x / 720) * 100, // Convert pixel position to percentage (assuming 720px width)
    y: (critique.y / 600) * 100, // Convert pixel position to percentage (assuming 600px height)
    title: critique.heading,
    description: critique.subheading,
    icon: <Sparkles className="w-4 h-4" />,
    color: "bg-purple-500"
  })) || [];

  return (
    <div style={{ backgroundColor: "#10101C" }}>
      {/* Logo at the top */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '2rem',
        paddingBottom: '1rem'
      }}>
        <img
          src="/logo.png"
          alt="UIverse Logo"
          style={{
            height: '60px',
            width: 'auto'
          }}
        />
      </div>

      <div
        style={{
          paddingLeft: '280px',
          paddingRight: '280px',
          paddingTop: '40px',
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
              <CardContent className="p-0" style={{ position: "relative" }}>
                <div style={{ position: "relative", width: "720px", height: "600px" }}>
                  <img
                    src={imageUrl}
                    alt="Uploaded image for analysis"
                    style={{
                      width: "720px",
                      height: "600px",
                      objectFit: "cover",
                      display: "block"
                    }}
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
                gap: "8px",
              }}>
              <CardHeader>
                <CardTitle style={{ color: "#fff", fontSize: 25 }}>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ color: "#fff", fontWeight: 200, fontSize: 14, lineHeight: 1.5 }}>
                  {analysisResult ? (
                    <>
                      {analysisResult.adjectives && (
                        <div style={{ marginBottom: "0.5rem" }}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                            {analysisResult.adjectives.map((adjective: string, index: number) => (
                              <span
                                key={index}
                                style={{
                                  backgroundColor: "#8B5CF6",
                                  color: "#fff",
                                  padding: "6px 16px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: 400
                                }}
                              >
                                {adjective}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{ fontSize: "13px" }}>
                        {analysisResult.summary || "No summary available"}
                      </div>
                    </>
                  ) : (
                    <div>Analysis not available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              style={{
                width: "360px",
                height: "420px",
                backgroundColor: "#B6B6FC30",
                boxShadow: "0 0 0 1px #5D5DA0 inset, 0 0 1px 1px #5D5DA0",
                filter: "blur(0px)",
                gap: "8px",
              }}>
              <CardHeader>
                <CardTitle style={{ color: "#fff", fontSize: 25 }}>UIverse Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hotspots.length > 0 ? (
                    hotspots.map((hotspot) => (
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
                          <p className="text-xs text-white line-clamp-3"
                            style={{ fontWeight: 200 }}>
                            {hotspot.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#fff", fontWeight: 200, fontSize: 14 }}>
                      No critiques available. The AI analysis may still be processing or no issues were found.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}