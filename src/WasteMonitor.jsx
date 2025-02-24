import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Map, Moon, Sun, HelpCircle, Menu, X, Home, Info, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, LinearProgress, Alert, AlertTitle } from '@mui/material';

const WasteMonitor = () => {
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (selectedFile && uploadProgress < 100) {
      const timer = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 100));
      }, 500);
      return () => clearInterval(timer);
    }
  }, [selectedFile]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadProgress(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
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
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <nav className="fixed w-full top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                WasteWatch
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Button className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>About</span>
              </Button>
              <Button className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Contact</span>
              </Button>
              <Button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
            <div className="md:hidden flex items-center">
              <Button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="px-4 py-2 space-y-2">
              <Button className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button className="w-full justify-start">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              <Button className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full justify-start">
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <Card className="bg-white/90 dark:bg-gray-900/90">
          <CardHeader>
            <h1 className="text-center text-3xl">Report Waste Dumping</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className={`flex-1 ${activeSection === 'upload' ? 'bg-green-600 text-white' : ''}`}
                onClick={() => setActiveSection('upload')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
              <Button
                className={`flex-1 ${activeSection === 'record' ? 'bg-green-600 text-white' : ''}`}
                onClick={() => setActiveSection('record')}
              >
                <Camera className="w-4 h-4 mr-2" />
                Record Video
              </Button>
            </div>

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
                  <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
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
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </div>
                )}
              </div>
            )}

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
                    <Button color="error" onClick={stopRecording}>
                      <X className="w-4 h-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>
            )}

            {videoPreview && (
              <div className="space-y-2">
                <h3 className="font-medium">Preview</h3>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video src={videoPreview} controls className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium">Location</h3>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Map className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Submit Report
            </Button>
          </CardContent>
        </Card>
      </main>

      <Button
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-4 right-4 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      {showHelp && (
        <Alert className="fixed bottom-20 right-4 w-72 bg-white dark:bg-gray-900 shadow-xl">
          <AlertTitle>Help</AlertTitle>
          <p>Need help? Contact our support team at support@wastewatch.com or click here to start a chat.</p>
        </Alert>
      )}
    </div>
  );
};

export default WasteMonitor;