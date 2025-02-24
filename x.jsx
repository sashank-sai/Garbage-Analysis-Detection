import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Map, Moon, Sun, HelpCircle, Menu, X, Home, Info, Phone, Video } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const WasteMonitor = () => {
  // State Management
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [location, setLocation] = useState(null);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Simulated upload progress
  useEffect(() => {
    if (selectedFile && uploadProgress < 100) {
      const timer = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 100));
      }, 500);
      return () => clearInterval(timer);
    }
  }, [selectedFile]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadProgress(0);
    }
  };

  // Handle real-time recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      //
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    setVideoPreview(URL.createObjectURL(blob));
    setSelectedFile(new File([blob], 'recorded-video.webm', { type: 'video/webm' }));
  };

  return (
    <div className={min-h-screen ${isDarkMode ? 'dark' : ''}}>
      {/* Background Video */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/api/placeholder/1920/1080" type="video/mp4" />
        </video>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                WasteWatch
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>About</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Contact</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="px-4 py-2 space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full justify-start"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Moon className="w-4 h-4 mr-2" />
                )}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              Report Waste Dumping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className={flex-1 ${activeSection === 'upload' ? 'bg-green-600' : ''}}
                onClick={() => setActiveSection('upload')}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Video

              </Button>
              <Button
                className={flex-1 ${activeSection === 'record' ? 'bg-green-600' : ''}}
                onClick={() => setActiveSection('record')}>
                <Camera className="w-4 h-4 mr-2" />
                Record Video
              </Button>
            </div>

            {/* Upload Section */}
            {activeSection === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <span className="mt-2">Click to upload or drag and drop</span>
                    <span className="text-sm text-gray-500">MP4, WebM, or Ogg</span>
                  </label>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            )}

            {/* Record Section */}
            {activeSection === 'record' && (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center">
                  {!isRecording ? (
                    <Button onClick={startRecording}>
                      <Camera className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopRecording}>
                      <X className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Video Preview */}
            {videoPreview && (
              <div className="space-y-2">
                <h3 className="font-medium">Preview</h3>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Map Section */}
            <div className="space-y-2">
              <h3 className="font-medium">Location</h3>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Map className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Submit Report
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Floating Help Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-4 right-4 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Dialog */}
      {showHelp && (
        <Alert className="fixed bottom-20 right-4 w-72 bg-white dark:bg-gray-900 shadow-xl">
          <AlertDescription>
            Need help? Contact our support team at support@wastewatch.com or click here to start a chat.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WasteMonitor;