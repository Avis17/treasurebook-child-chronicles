
import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Speech, Headphones, Play, Pause, Save, CheckCircle, Timer, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PRACTICE_PROMPTS = [
  {
    id: "animals",
    title: "Favorite Animal",
    prompt: "Talk about your favorite animal for 1 minute",
    category: "Nature",
    difficulty: "Easy"
  },
  {
    id: "story",
    title: "Short Story",
    prompt: "Tell a story about a magical adventure in 1 minute",
    category: "Storytelling",
    difficulty: "Medium"
  },
  {
    id: "dream",
    title: "Dream Job",
    prompt: "Describe your dream job when you grow up",
    category: "Career",
    difficulty: "Easy"
  },
  {
    id: "vacation",
    title: "Dream Vacation",
    prompt: "Talk about your dream vacation spot",
    category: "Travel",
    difficulty: "Easy"
  },
  {
    id: "superpower",
    title: "Superpower",
    prompt: "If you had a superpower, what would it be and why?",
    category: "Imagination",
    difficulty: "Medium"
  },
  {
    id: "book",
    title: "Favorite Book",
    prompt: "Describe your favorite book and why you like it",
    category: "Literature",
    difficulty: "Medium"
  }
];

const VoicePractice = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(PRACTICE_PROMPTS[0]);
  const [completedPrompts, setCompletedPrompts] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Stop all tracks on the stream to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Reset timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
      mediaRecorder.start();
      setRecording(true);
      
      // Auto-stop after 70 seconds (slightly over 1 minute to give buffer)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 70000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Failed",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const playAudio = () => {
    if (audioRef.current && audioURL) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const saveRecording = () => {
    if (!audioURL) return;
    
    // In a real app, you would upload the recording to storage
    // For now, we'll just mark it as completed
    setCompletedPrompts(prev => [...prev, selectedPrompt.id]);
    
    toast({
      title: "Recording Saved!",
      description: "Your voice practice has been saved successfully.",
    });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const selectPrompt = (prompt: typeof PRACTICE_PROMPTS[0]) => {
    setSelectedPrompt(prompt);
    // Clear previous recording
    setAudioURL(null);
    setRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <AppLayout title="Voice Practice">
      <div className="container py-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <Speech className="h-8 w-8 text-purple-500" />
              Speak and Learn
            </h1>
            <p className="text-muted-foreground">
              Practice and improve speaking skills through fun recording exercises
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Speaking Prompts</CardTitle>
                  <CardDescription>
                    Choose a topic to practice speaking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {PRACTICE_PROMPTS.map((prompt) => (
                    <div
                      key={prompt.id}
                      onClick={() => selectPrompt(prompt)}
                      className={`p-3 rounded-lg cursor-pointer border transition-all ${
                        selectedPrompt.id === prompt.id
                          ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-900/20 border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm">{prompt.title}</h3>
                        {completedPrompts.includes(prompt.id) && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{prompt.prompt}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {prompt.category}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            prompt.difficulty === "Easy" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                          }`}
                        >
                          {prompt.difficulty}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedPrompt.title}</CardTitle>
                  <CardDescription>{selectedPrompt.prompt}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-lg p-6 flex flex-col items-center justify-center min-h-52">
                    {recording ? (
                      <div className="text-center">
                        <div className="relative inline-block">
                          <div className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-purple-400 opacity-30"></div>
                          <Mic className="relative h-16 w-16 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="mt-4 text-lg font-medium">Recording...</p>
                        <div className="flex items-center justify-center mt-2">
                          <Timer className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                          <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={stopRecording} 
                          className="mt-6"
                        >
                          <MicOff className="mr-2 h-4 w-4" /> Stop Recording
                        </Button>
                      </div>
                    ) : audioURL ? (
                      <div className="text-center w-full">
                        <Headphones className="h-16 w-16 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
                        <audio ref={audioRef} src={audioURL} onEnded={() => setIsPlaying(false)} className="hidden" />
                        
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <Button onClick={playAudio} variant="outline" className="flex-1">
                            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {isPlaying ? "Pause" : "Listen"}
                          </Button>
                          <Button onClick={saveRecording} className="flex-1">
                            <Save className="mr-2 h-4 w-4" /> Save Recording
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          className="mt-4 text-muted-foreground" 
                          onClick={() => {
                            setAudioURL(null);
                            setRecordingTime(0);
                          }}
                        >
                          Record Again
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Mic className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                        <h3 className="text-lg font-medium">Ready to start speaking?</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                          Press the button below to start recording your answer
                        </p>
                        <Button 
                          onClick={startRecording} 
                          size="lg"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Mic className="mr-2 h-4 w-4" /> Start Recording
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col text-sm text-muted-foreground border-t pt-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>Practice speaking for one minute. Try to speak clearly and use descriptive language.</p>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Speaking Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="general">General Tips</TabsTrigger>
                      <TabsTrigger value="clarity">Speaking Clearly</TabsTrigger>
                      <TabsTrigger value="confidence">Building Confidence</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Plan Your Main Points</h4>
                        <p className="text-sm text-muted-foreground">
                          Before you start recording, take a few seconds to think about 2-3 main points you want to cover.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Use Examples</h4>
                        <p className="text-sm text-muted-foreground">
                          Support your ideas with specific examples or stories to make your speaking more engaging.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Pace Yourself</h4>
                        <p className="text-sm text-muted-foreground">
                          Don't rush through your speaking. Take your time and speak at a comfortable pace.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="clarity" className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Speak Up</h4>
                        <p className="text-sm text-muted-foreground">
                          Make sure you're speaking loudly enough to be heard clearly.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Pronunciation</h4>
                        <p className="text-sm text-muted-foreground">
                          Take your time to pronounce words fully, especially difficult ones.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Avoid Filler Words</h4>
                        <p className="text-sm text-muted-foreground">
                          Try to reduce using words like "um," "like," and "you know" too frequently.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="confidence" className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Practice Regularly</h4>
                        <p className="text-sm text-muted-foreground">
                          The more you practice speaking, the more confident you'll become.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Listen to Yourself</h4>
                        <p className="text-sm text-muted-foreground">
                          Review your recordings to identify areas for improvement.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Positive Self-Talk</h4>
                        <p className="text-sm text-muted-foreground">
                          Remind yourself that making mistakes is part of learning and improving.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VoicePractice;
