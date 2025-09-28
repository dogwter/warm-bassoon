import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoadingPage } from './components/LoadingPage';
import { ImageAnalysisPage } from './components/ImageAnalysisPage';

type AppState = 'landing' | 'loading' | 'analysis';

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

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppState>('landing');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<boolean>(false);

  // Text parsing function (same as in ImageAnalysisPage)
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
          currentCritique.x = Math.min(95, Math.max(5, (parseInt(coordMatch[1]) / 1920) * 100));
          currentCritique.y = Math.min(95, Math.max(5, (parseInt(coordMatch[2]) / 1080) * 100));
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

  const handleImageUpload = async (file: File) => {
    // Create object URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    // Reset previous analysis data and errors
    setAnalysisData(null);
    setAnalysisError(false);
    
    // Switch to loading page and start analysis
    setCurrentPage('loading');
    
    // Upload image to backend and start analysis
    await Promise.all([
      uploadImageToBackend(file),
      performAnalysis()
    ]);
  };

  const uploadImageToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3001/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        console.warn('Image upload failed, backend will use default image');
      }
    } catch (error) {
      console.warn('Image upload error, backend will use default image:', error);
    }
  };

  const performAnalysis = async () => {
    try {
      // Small delay to ensure image upload completes first
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch('http://localhost:3001/analyze-image');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const parsedResult = parseAnalysisText(data.result);
      setAnalysisData(parsedResult);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(true);
    }
  };

  const handleLoadingComplete = () => {
    setCurrentPage('analysis');
  };

  const handleBackToLanding = () => {
    // Clean up the object URL
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setAnalysisData(null);
    setAnalysisError(false);
    setCurrentPage('landing');
  };

  const handleNewImageUpload = (file: File) => {
    // Clean up previous image URL
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    
    // Handle new image upload
    handleImageUpload(file);
  };

  const handleAnalysisError = () => {
    setAnalysisError(true);
  };

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage onImageUpload={handleImageUpload} />
      )}
      
      {currentPage === 'loading' && (
        <LoadingPage 
          onLoadingComplete={handleLoadingComplete}
          analysisData={analysisData}
          analysisError={analysisError}
        />
      )}
      
      {currentPage === 'analysis' && uploadedImage && (
        <ImageAnalysisPage 
          imageUrl={uploadedImage}
          onBack={handleBackToLanding}
          onNewImageUpload={handleNewImageUpload}
          analysisData={analysisData}
          onAnalysisError={handleAnalysisError}
        />
      )}
    </div>
  );
}