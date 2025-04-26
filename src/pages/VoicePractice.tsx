
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Save, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const speakingPrompts = [
  "Talk about your favorite animal for 30 seconds",
  "Describe your perfect day",
  "Tell a short story about a magical adventure",
  "Explain how to make your favorite food",
  "If you could have any superpower, what would it be and why?",
  "Tell us about your favorite book or movie character",
  "Describe what you want to be when you grow up",
  "Talk about a place you would like to visit",
  "Share something interesting you learned recently",
  "Describe your favorite hobby"
];

const VoicePractice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState(speakingPrompts[0]);
  const [recordingTime, setRecordingTime] = useState(0);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * speakingPrompts.length);
    setCurrentPrompt(speakingPrompts[randomIndex]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setAudioURL(null);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Recording stopped",
        description: "Your recording has been saved. You can listen to it now.",
      });
    }
  };

  const saveRecording = () => {
    if (audioURL) {
      const a = document.createElement("a");
      a.href = audioURL;
      a.download = `speaking-practice-${new Date().toISOString()}.mp3`;
      a.click();
      
      toast({
        title: "Recording saved",
        description: "Your recording has been downloaded to your device.",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AppLayout title="Voice Practice">
      <div className="max-w-5xl mx-auto space-y-6">
        <DashboardCard 
          title={
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-500" />
              <span>Voice Practice</span>
              <Badge variant="info" className="ml-2">Coming Soon</Badge>
            </div>
          }
          gradient
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Speak and Learn</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Practice speaking skills with fun prompts! Record yourself speaking about different topics to improve communication and confidence.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">Today's Speaking Prompt:</h3>
            <p className="text-xl font-semibold mb-6 text-blue-700 dark:text-blue-300">"{currentPrompt}"</p>
            <Button 
              variant="outline" 
              className="flex gap-2 items-center" 
              onClick={getRandomPrompt}
            >
              <ArrowRight className="h-4 w-4" /> Get New Prompt
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 my-8">
              {!isRecording ? (
                <Button 
                  onClick={startRecording} 
                  className="bg-red-500 hover:bg-red-600 flex items-center gap-2 px-6"
                >
                  <Mic className="h-4 w-4" /> Start Recording
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording} 
                  variant="destructive" 
                  className="flex items-center gap-2 px-6 animate-pulse"
                >
                  <Square className="h-4 w-4" /> Stop Recording ({formatTime(recordingTime)})
                </Button>
              )}
            </div>
            
            {audioURL && (
              <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h3 className="text-lg font-medium">Your Recording</h3>
                <audio src={audioURL} controls className="w-full max-w-md" />
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={saveRecording}
                  >
                    <Save className="h-4 w-4" /> Save Recording
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex items-center gap-2"
                    onClick={startRecording}
                  >
                    <Mic className="h-4 w-4" /> Record Again
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <h3 className="font-medium">Benefits of Voice Practice:</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Improves communication skills</li>
              <li>Builds confidence in public speaking</li>
              <li>Develops vocabulary and language fluency</li>
              <li>Enhances critical thinking through verbal expression</li>
              <li>Prepares for future academic and professional success</li>
            </ul>
          </div>
        </DashboardCard>
        
        <DashboardCard 
          title="Practice Tips"
          className="border-green-100 dark:border-green-900"
        >
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <span className="text-lg">1</span>
              </div>
              <div>
                <h3 className="font-medium">Find a quiet space</h3>
                <p className="text-sm text-muted-foreground">Choose a location with minimal background noise for better recording quality.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <span className="text-lg">2</span>
              </div>
              <div>
                <h3 className="font-medium">Speak clearly and at a steady pace</h3>
                <p className="text-sm text-muted-foreground">Don't rush - take your time to articulate words clearly.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <span className="text-lg">3</span>
              </div>
              <div>
                <h3 className="font-medium">Listen to your recordings</h3>
                <p className="text-sm text-muted-foreground">Review your recordings to identify areas for improvement.</p>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                <span className="text-lg">4</span>
              </div>
              <div>
                <h3 className="font-medium">Practice regularly</h3>
                <p className="text-sm text-muted-foreground">Consistent practice leads to better speaking skills over time.</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
    </AppLayout>
  );
};

export default VoicePractice;
