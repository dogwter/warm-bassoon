import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload } from "lucide-react";
import { useEffect, useRef } from "react";

interface LandingPageProps {
  onImageUpload: (file: File, analysis?: any) => void;
}

export function LandingPage({ onImageUpload }: LandingPageProps) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Immediately go to loading page with the file
    onImageUpload(file);
  };
  const triggerFileInput = () => {
    const input = document.getElementById('file-input') as HTMLInputElement;
    input?.click();
  };

  // Cursor effect logic
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundColor: "#10101C",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient cursor effect */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle at center, #B6B6FC 0%, #D4B6FC 10%, #5D5DA0 30%)",
          mixBlendMode: "screen",
          transform: "translate(-40%, -50%)",
          filter: "blur(250px)",
          transition: "transform 0.15s ease-out",
          zIndex: 100,
        }}
      />
      <div className="flex items-center" style={{ position: "relative", zIndex: 1 }}>
        <span
          className="font-extrabold"
          style={{
            fontFamily: "Alexandria, sans-serif",
            fontWeight: 800,
            fontSize: "128px",
            background: "conic-gradient(from 0deg at 40% 50%, #B6B6FC 0%, #D4B6FC 50%, #5D5DA0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          UI
        </span>
        <span
          className="font-extralight"
          style={{
            fontFamily: "Alexandria, sans-serif",
            fontWeight: 200,
            fontSize: "120px",
            color: "#D9D9D9",
          }}
        >
          verse
        </span>
      </div>
      <h1
        style={{
          fontWeight: 300,
          fontSize: "40px",
          marginBottom: "2.5rem",
          //marginTop: "1rem",
          background: "linear-gradient(90deg, #D4B6FC 0%, #FFFFFF 30%, #B6B6FC 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
          position: "relative",
          zIndex: 1,
        }}
      >
        your personalised AI guide to the UI/UX universe
      </h1>
      <div
        className="mx-auto rounded-xl"
        style={{
          width: "500px",
          maxWidth: "80vw",
          padding: "30px",
          background: "#D9D9D9",
          boxShadow: "0 0 0 1px #5D5DA0 inset, 0 0 8px 6px #5D5DA0",
          filter: "blur(0px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <CardHeader className="text-center">
          <CardTitle className="font-weight-medium font-size-24">instant insights</CardTitle>
          <CardTitle className="font-weight-medium font-size-24">detailed descriptions</CardTitle>
          <CardDescription style={{ marginTop: "1rem", marginBottom: "1.5rem", fontWeight: 300, fontSize: "1.25rem" }}>
            screenshot your webpage to begin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={triggerFileInput}
            className="w-full h-12 flex items-center gap-2"
            size="lg"
            style={{ backgroundColor: "#5D5DA0", color: "#fff", border: "none" }}
          >
            <Upload className="w-5 h-5" />
            upload
          </Button>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground text-center">
            supported formats: JPG, PNG
          </p>
        </CardContent>
      </div>
    </div>
  );
}