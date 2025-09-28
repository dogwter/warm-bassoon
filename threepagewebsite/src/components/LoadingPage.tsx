import { useEffect, useState } from "react"; 

interface LoadingPageProps {
  file: File | null;
  onLoadingComplete: () => void;
  onAnalysisComplete: (analysis: any) => void;
}

export function LoadingPage({
  file,
  onLoadingComplete,
  onAnalysisComplete,
}: LoadingPageProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState(false);
  const words = [
    " Structure",
    " Fonts",
    " Aesthetic",
    " Interface",
    " Colors",
  ];

  // Make API call when component mounts
  useEffect(() => {
    const makeApiCall = async () => {
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("http://localhost:5000/analyze-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response during loading:", data.analysis);
        setAnalysisData(data.analysis);
        onAnalysisComplete(data.analysis);
      } catch (error) {
        console.error("API call failed during loading:", error);
        setAnalysisError(true);
      }
    };

    makeApiCall();
  }, [file, onAnalysisComplete]);

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
      }, 5000);

      return () => clearTimeout(completeTimeout);
    }
  }, [minTimeElapsed, analysisData, analysisError, onLoadingComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#10101C", position: "relative" }}>
      <div className="w-full flex justify-center" style={{ position: "absolute", top: 0, left: 0, right: 0, marginTop: "2.5rem", zIndex: 2, }}>
        <div className="flex items-center">
          <span className="font-extrabold" style={{ fontFamily: "Alexandria, sans-serif", fontWeight: 800, fontSize: "50px", background: "conic-gradient(from 0deg at 40% 50%, #B6B6FC 0%, #D4B6FC 50%, #5D5DA0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent", }} > UI </span>
          <span className="font-extralight" style={{ fontFamily: "Alexandria, sans-serif", fontWeight: 200, fontSize: "48px", color: "#D9D9D9", }} > verse </span>
        </div>
      </div>

      <div className="text-center space-y-8">
        <div className="text-foreground" style={{ fontWeight: 200, fontSize: '128px', lineHeight: '1.1', color: '#D9D9D9' }}>
          <span>Analysing</span>
          <div className="inline-block min-w-[800px] text-left overflow-hidden relative" 
          style={{ 
            height: '140px',
            marginLeft: '1.5rem'}}>
            <div 
              className="flex flex-col transition-transform duration-500 ease-in-out"
              style={{
                marginTop: '1rem',
                transform: `translateY(-${currentWordIndex * 140}px)`,
              }}
            >
              {[...words, ...words].map((word, index) => (
                <div key={`${word}-${index}`} 
                className="h-[6rem] flex items-center" 
                style={{ 
                  height: '140px', 
                  background: 'linear-gradient(45deg, #B6B6FC 0%, #D4B6FC 10%, #5D5DA0 40%, #5D5DA0 100%)', 
                  WebkitBackgroundClip: 'text', 
                  backgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  backgroundSize: '300% 300%', 
                  fontWeight: 400 }} > {word} </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Animated dots */}
        <div className="wrapper z-10">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="shadow"></div>
            <div className="shadow"></div>
            <div className="shadow"></div>

        </div>
      </div>
    </div>
  );
}