import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoadingPage } from './components/LoadingPage';
import { ImageAnalysisPage } from './components/ImageAnalysisPage';

type AppState = 'landing' | 'loading' | 'analysis';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleImageUpload = (file: File) => {
    // Create a URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setCurrentFile(file);
    setAnalysisResult(null); // Reset analysis result
    setCurrentState('loading');
  };

  const handleLoadingComplete = () => {
    setCurrentState('analysis');
  };

  const handleBackToLanding = () => {
    // Clean up the previous image URL
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setAnalysisResult(null);
    setCurrentFile(null);
    setCurrentState('landing');
  };

  const handleNewImageUpload = (file: File) => {
    // Clean up the previous image URL
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    // Create a URL for the new uploaded file
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setCurrentFile(file);
    setAnalysisResult(null); // Reset analysis result
    setCurrentState('loading');
  };

  // Clean up image URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  switch (currentState) {
    case 'landing':
      return <LandingPage onImageUpload={handleImageUpload} />;
    
    case 'loading':
      return (
        <LoadingPage 
          file={currentFile}
          onLoadingComplete={handleLoadingComplete}
          onAnalysisComplete={setAnalysisResult}
        />
      );
    
    case 'analysis':
      return uploadedImage ? (
        <ImageAnalysisPage 
          imageUrl={uploadedImage} 
          analysisResult={analysisResult}
          onBack={handleBackToLanding}
          onNewImageUpload={handleNewImageUpload}
        />
      ) : (
        <LandingPage onImageUpload={handleImageUpload} />
      );
    
    default:
      return <LandingPage onImageUpload={handleImageUpload} />;
  }
}