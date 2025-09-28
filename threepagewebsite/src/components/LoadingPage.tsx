import { useEffect, useState } from "react";

interface LoadingPageProps {
  onLoadingComplete: () => void;
  analysisData?: any; // Analysis result from parent
  analysisError?: boolean; // Error state from parent
}

export function LoadingPage({ onLoadingComplete, analysisData, analysisError }: LoadingPageProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const words = [
    "  Layout",
    "  Fonts", 
    "  Style",
    "  Interface",
    "  Colors",
  ];

  useEffect(() => {
    // Change the word every 1000ms
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 1000);

    // Ensure minimum loading time of 3 seconds for good UX
    const minTimeTimeout = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000);

    // Maximum timeout of 15 seconds in case API call hangs
    const maxTimeTimeout = setTimeout(() => {
      setMinTimeElapsed(true);
      // Force completion after max time
      setTimeout(() => {
        onLoadingComplete();
      }, 500);
    }, 15000);

    return () => {
      clearInterval(wordInterval);
      clearTimeout(minTimeTimeout);
      clearTimeout(maxTimeTimeout);
    };
  }, [onLoadingComplete]);

  // Complete loading when analysis is done AND minimum time has elapsed
  useEffect(() => {
    if (minTimeElapsed && (analysisData || analysisError)) {
      // Small delay for smooth transition
      const completeTimeout = setTimeout(() => {
        onLoadingComplete();
      }, 500);

      return () => clearTimeout(completeTimeout);
    }
  }, [minTimeElapsed, analysisData, analysisError, onLoadingComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#10101C" }}>
      <div className="text-2xl text-white flex justify-center items-center">
        <div className="flex items-center" style={{ gap: "1.5rem" }}>
          <span>Analyzing</span>
          <div className="inline-block min-w-[200px] h-8 overflow-hidden relative">
            <div
              className="flex flex-col transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateY(-${currentWordIndex * 32}px)`,
              }}
            >
              {[...words, ...words].map((word, index) => (
                <div 
                  key={`${word}-${index}`} 
                  className="h-8 flex items-center"
                  style={{
                    background: 'linear-gradient(45deg, #B6B6FC 0%, #D4B6FC 10%, #5D5DA0 40%, #5D5DA0 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '300% 300%',
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}