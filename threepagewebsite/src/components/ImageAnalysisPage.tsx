import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { ArrowLeft, Info, Eye, Palette, Sparkles, Upload, AlertCircle } from "lucide-react";

interface AnalysisResult {
  adjectives: string[];
  summary: string;
  critiques: Array<{
    heading: string;
    subheading: string;
    x: number;
    y: number;
  }>;
}

interface ImageAnalysisPageProps {
  imageUrl: string;
  onBack: () => void;
  onNewImageUpload: (file: File) => void;
  analysisData?: AnalysisResult | null; // Pre-fetched data from loading page
  onAnalysisError?: () => void; // Callback for analysis errors
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

export function ImageAnalysisPage({ imageUrl, onBack, onNewImageUpload, analysisData, onAnalysisError }: ImageAnalysisPageProps) {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(analysisData || null);
  const [error, setError] = useState<string | null>(null);

  // Icon options for different critique types
  const getIconForCritique = (heading: string, index: number) => {
    const icons = [
      <Eye className="w-4 h-4" />,
      <Palette className="w-4 h-4" />,
      <Sparkles className="w-4 h-4" />,
      <Info className="w-4 h-4" />
    ];
    
    // You can add logic here to choose icons based on critique content
    if (heading.toLowerCase().includes('color')) return <Palette className="w-4 h-4" />;
    if (heading.toLowerCase().includes('design') || heading.toLowerCase().includes('ui')) return <Sparkles className="w-4 h-4" />;
    if (heading.toLowerCase().includes('layout') || heading.toLowerCase().includes('structure')) return <Eye className="w-4 h-4" />;
    
    return icons[index % icons.length];
  };

  const getColorForIndex = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-pink-500"
    ];
    return colors[index % colors.length];
  };

  const parseAnalysisText = (text: string): AnalysisResult => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract adjectives (first line typically)
    const adjectivesLine = lines.find(line => 
      line.includes('adjective') || 
      (lines.indexOf(line) === 0 && line.split(' ').length <= 5)
    );
    const adjectives = adjectivesLine ? adjectivesLine.split(' ').filter(word => word.length > 2) : [];

    // Extract summary (look for a longer descriptive paragraph)
    const summaryLine = lines.find(line => 
      line.length > 50 && 
      !line.toLowerCase().includes('critique') &&
      !line.toLowerCase().includes('pixel')
    );
    const summary = summaryLine || "Analysis completed successfully.";

    // Extract critiques and locations
    const critiques: Array<{heading: string; subheading: string; x: number; y: number}> = [];
    
    let currentCritique: any = {};
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for critique headings (usually bold or numbered)
      if (line.includes('**') || line.match(/^\d+\./) || line.toLowerCase().includes('critique')) {
        if (currentCritique.heading && currentCritique.subheading) {
          critiques.push(currentCritique);
        }
        currentCritique = { heading: line.replace(/\*\*/g, '').replace(/^\d+\.\s*/, ''), x: 50, y: 50 };
      }
      // Look for subheadings/descriptions
      else if (currentCritique.heading && !currentCritique.subheading && line.length > 10) {
        currentCritique.subheading = line;
      }
      // Look for pixel coordinates
      else if (line.toLowerCase().includes('pixel') && (line.includes(',') || line.includes('x:'))) {
        const xMatch = line.match(/x[:\s]*(\d+)/i);
        const yMatch = line.match(/y[:\s]*(\d+)/i);
        const coordMatch = line.match(/(\d+),\s*(\d+)/);
        
        if (coordMatch) {
          currentCritique.x = Math.min(95, Math.max(5, (parseInt(coordMatch[1]) / 1920) * 100)); // Assuming 1920px width
          currentCritique.y = Math.min(95, Math.max(5, (parseInt(coordMatch[2]) / 1080) * 100)); // Assuming 1080px height
        } else if (xMatch && yMatch) {
          currentCritique.x = Math.min(95, Math.max(5, (parseInt(xMatch[1]) / 1920) * 100));
          currentCritique.y = Math.min(95, Math.max(5, (parseInt(yMatch[1]) / 1080) * 100));
        }
      }
    }
    
    // Add the last critique if it exists
    if (currentCritique.heading && currentCritique.subheading) {
      critiques.push(currentCritique);
    }

    // If no critiques were parsed, create some default ones
    if (critiques.length === 0) {
      critiques.push(
        { heading: "UI Analysis", subheading: "General interface assessment", x: 25, y: 30 },
        { heading: "Design Critique", subheading: "Visual design evaluation", x: 70, y: 45 },
        { heading: "User Experience", subheading: "Usability considerations", x: 40, y: 65 }
      );
    }

    return { adjectives, summary, critiques };
  };

  const fetchAnalysis = async () => {
    try {
      setError(null);
      
      const response = await fetch('http://localhost:3001/analyze-image');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const parsedResult = parseAnalysisText(data.result);
      setAnalysisResult(parsedResult);

      // Convert critiques to hotspot format
      const newHotspots: HotspotData[] = parsedResult.critiques.map((critique, index) => ({
        id: String(index + 1),
        x: critique.x,
        y: critique.y,
        title: critique.heading,
        description: critique.subheading,
        icon: getIconForCritique(critique.heading, index),
        color: getColorForIndex(index)
      }));

      setHotspots(newHotspots);
    } catch (err) {
      console.error('Failed to fetch analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
      
      if (onAnalysisError) {
        onAnalysisError();
      }
      
      // Fallback to mock data on error with UI-focused content
      const fallbackHotspots: HotspotData[] = [
        {
          id: "1",
          x: 25,
          y: 30,
          title: "Layout Structure",
          description: "Analysis temporarily unavailable. The layout appears to follow standard web conventions.",
          icon: <Eye className="w-4 h-4" />,
          color: "bg-blue-500"
        },
        {
          id: "2",
          x: 70,
          y: 20,
          title: "Visual Design",
          description: "Design elements show attention to user interface principles and visual hierarchy.",
          icon: <Palette className="w-4 h-4" />,
          color: "bg-green-500"
        },
        {
          id: "3",
          x: 40,
          y: 65,
          title: "User Experience",
          description: "Interface appears to prioritize usability and intuitive navigation patterns.",
          icon: <Sparkles className="w-4 h-4" />,
          color: "bg-purple-500"
        }
      ];
      setHotspots(fallbackHotspots);
    }
  };

  useEffect(() => {
    if (analysisData) {
      // Use pre-fetched analysis data
      setAnalysisResult(analysisData);
      
      // Convert critiques to hotspot format
      const newHotspots: HotspotData[] = analysisData.critiques.map((critique, index) => ({
        id: String(index + 1),
        x: critique.x,
        y: critique.y,
        title: critique.heading,
        description: critique.subheading,
        icon: getIconForCritique(critique.heading, index),
        color: getColorForIndex(index)
      }));

      setHotspots(newHotspots);
    } else {
      // No data provided - create fallback hotspots immediately
      const fallbackHotspots: HotspotData[] = [
        {
          id: "1",
          x: 25,
          y: 30,
          title: "Layout Structure",
          description: "Analysis in progress. The layout appears to follow standard web conventions.",
          icon: <Eye className="w-4 h-4" />,
          color: "bg-blue-500"
        },
        {
          id: "2",
          x: 70,
          y: 20,
          title: "Visual Design",
          description: "Design elements show attention to user interface principles and visual hierarchy.",
          icon: <Palette className="w-4 h-4" />,
          color: "bg-green-500"
        },
        {
          id: "3",
          x: 40,
          y: 65,
          title: "User Experience",
          description: "Interface appears to prioritize usability and intuitive navigation patterns.",
          icon: <Sparkles className="w-4 h-4" />,
          color: "bg-purple-500"
        }
      ];
      setHotspots(fallbackHotspots);
      
      // Try to fetch analysis in the background
      fetchAnalysis();
    }
  }, [analysisData]);

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

  const retryAnalysis = async () => {
    await fetchAnalysis();
  };

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
                {error 
                  ? "Analysis unavailable - showing UI evaluation"
                  : "Click on the highlighted areas to explore the analysis insights"
                }
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

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryAnalysis}
                  className="ml-auto"
                >
                  Retry Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                <>
                  {analysisResult?.adjectives && analysisResult.adjectives.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Characteristics</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.adjectives.slice(0, 6).map((adj, index) => (
                          <Badge key={index} variant="secondary">{adj}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisResult?.summary && (
                    <div>
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysisResult.summary}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Analysis Type</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Type: UI/UX Analysis</p>
                      <p>Model: Gemini 2.5 Flash</p>
                      <p>Status: {error ? 'Failed' : 'Complete'}</p>
                    </div>
                  </div>
                </>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Hotspots</CardTitle>
                <CardDescription>
                  {`${hotspots.length} areas of interest identified`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                { (
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
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}