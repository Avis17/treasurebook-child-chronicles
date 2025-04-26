
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Play, Save, Volume, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const VoicePractice = () => {
  const { currentUser } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState("prompt1");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timeIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  const prompts = {
    prompt1: {
      title: "My Favorite Animal",
      description: "Talk about your favorite animal and why you like it.",
      tips: ["What does it look like?", "Where does it live?", "What does it eat?", "Why do you like it?"]
    },
    prompt2: {
      title: "One-Minute Story",
      description: "Tell a short story in one minute.",
      tips: ["Start with 'Once upon a time'", "Include a character", "Describe a problem", "Tell how it ends"]
    },
    prompt3: {
      title: "My Dream Vacation",
      description: "Describe where you would go on your dream vacation.",
      tips: ["Where would you go?", "Who would you take?", "What would you do there?", "What would you see?"]
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);

      // Set timer
      let seconds = 0;
      timeIntervalRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
      }, 1000);

    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Error",
        description: "Please allow access to your microphone to use this feature.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
      
      toast({
        title: "Recording Completed",
        description: "Your recording has been saved. You can now play it back.",
      });
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const saveRecording = () => {
    if (!audioBlob) return;
    
    const a = document.createElement("a");
    a.href = audioUrl as string;
    a.download = `voice-practice-${prompts[selectedPrompt as keyof typeof prompts].title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Recording Saved",
      description: "Your voice recording has been downloaded to your device.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout title="Voice Practice">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Mic className="h-6 w-6" />
              Speak and Learn
            </CardTitle>
            <p className="text-white/90">
              Practice speaking with fun prompts and record your voice to improve communication skills
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="prompt1" value={selectedPrompt} onValueChange={setSelectedPrompt} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="prompt1">Favorite Animal</TabsTrigger>
                <TabsTrigger value="prompt2">One-Minute Story</TabsTrigger>
                <TabsTrigger value="prompt3">Dream Vacation</TabsTrigger>
              </TabsList>
              
              {Object.entries(prompts).map(([key, prompt]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                      {prompt.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {prompt.description}
                    </p>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tips:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {prompt.tips.map((tip, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-full flex justify-center mb-4">
                        <Badge variant={isRecording ? "destructive" : "secondary"} className="px-4 py-1.5 text-base">
                          {isRecording ? `Recording... ${formatTime(recordingTime)}` : "Ready to Record"}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-3">
                        {!isRecording ? (
                          <Button 
                            onClick={startRecording} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <Mic className="mr-2" /> Start Recording
                          </Button>
                        ) : (
                          <Button 
                            onClick={stopRecording} 
                            variant="destructive"
                          >
                            <MicOff className="mr-2" /> Stop Recording
                          </Button>
                        )}
                        
                        {audioUrl && (
                          <>
                            <Button variant="outline" onClick={() => {
                              const audio = new Audio(audioUrl);
                              audio.play();
                            }}>
                              <Play className="mr-2" /> Play ({formatTime(recordingTime)})
                            </Button>
                            <Button variant="outline" onClick={saveRecording}>
                              <Save className="mr-2" /> Save Recording
                            </Button>
                            <Button variant="outline" onClick={resetRecording}>
                              <RotateCcw className="mr-2" /> Reset
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {audioUrl && (
                        <div className="w-full mt-4">
                          <audio 
                            controls 
                            src={audioUrl} 
                            className="w-full mt-2 rounded-md" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="mt-8 bg-indigo-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-medium text-indigo-700 dark:text-indigo-400">
                <Volume className="h-5 w-5" />
                Why Voice Practice Matters
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Regular speaking practice helps children develop communication confidence, clarity of thought, vocabulary skills, and public speaking abilities - all critical for future academic and career success.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default VoicePractice;
