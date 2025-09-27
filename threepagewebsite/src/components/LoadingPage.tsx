import { useEffect, useState } from "react";

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

export function LoadingPage({ onLoadingComplete }: LoadingPageProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = [
    "Processing",
    "Analyzing", 
    "Identifying",
    "Generating",
    "Finalizing"
  ];

  useEffect(() => {
    // Change the second word every 800ms
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 800);

    // Complete loading after 4 seconds
    const loadingTimeout = setTimeout(() => {
      clearInterval(wordInterval);
      onLoadingComplete();
    }, 4000);

    return () => {
      clearInterval(wordInterval);
      clearTimeout(loadingTimeout);
    };
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-16">
        <h1 className="text-4xl tracking-wide text-primary">uiverse</h1>
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-8">
        <div className="text-2xl text-foreground">
          <span>AI </span>
          <div className="inline-block min-w-[140px] text-left h-8 overflow-hidden relative">
            <div 
              className="flex flex-col transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateY(-${currentWordIndex * 32}px)`, // 32px = 2rem (h-8)
              }}
            >
              {/* Create a continuous loop by duplicating the words */}
              {[...words, ...words].map((word, index) => (
                <div 
                  key={`${word}-${index}`} 
                  className="h-8 flex items-center"
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-2">
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '150ms', animationDuration: '1s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '300ms', animationDuration: '1s' }}
          ></div>
        </div>
      </div>
    </div>
  );
}