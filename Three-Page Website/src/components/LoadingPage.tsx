import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

export function LoadingPage({ onLoadingComplete }: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Uploading image...");

  const steps = [
    "Uploading image...",
    "Analyzing content...",
    "Identifying objects...",
    "Generating descriptions...",
    "Finalizing results..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15 + 5;
        
        // Update step based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onLoadingComplete, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl">Processing Your Image</h2>
            <p className="text-muted-foreground">
              Our AI is analyzing your image to provide detailed insights
            </p>
          </div>
          
          <div className="space-y-3">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{currentStep}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}