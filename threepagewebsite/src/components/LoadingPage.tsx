import { useEffect, useState } from "react";

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

export function LoadingPage({ onLoadingComplete }: LoadingPageProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = [
    "  Layout",
    "  Fonts", 
    "  Style",
    "  Interface",
    "  Colors",
  ];

  useEffect(() => {
    // Change the second word every 800ms
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 1000);

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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#10101C" }}>
      <div className="text-2xl text-white flex justify-center items-center">
  <div className="flex items-center" style={{ gap: "1.5rem" }}>
    <span>Analyzing</span>
    <div className="inline-block min-w-[140px] h-8 overflow-hidden relative">
      <div
        className="flex flex-col transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateY(-${currentWordIndex * 32}px)`,
        }}
      >
        {[...words, ...words].map((word, index) => (
          <div key={`${word}-${index}`} className="h-8 flex items-center">
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