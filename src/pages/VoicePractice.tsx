import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, Play, Save, Volume, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const practiceTopics = {
  favorites: {
    title: "Favorites",
    prompts: [
      {
        title: "My Favorite Animal",
        description: "Talk about your favorite animal and why you like it.",
        tips: ["What does it look like?", "Where does it live?", "What does it eat?", "Why do you like it?"]
      },
      {
        title: "My Favorite Book",
        description: "Share about your favorite book.",
        tips: ["What is the story about?", "Who are the main characters?", "Why do you like it?", "What did you learn?"]
      },
      {
        title: "My Favorite Place",
        description: "Describe your favorite place to visit.",
        tips: ["Where is it?", "What can you do there?", "Why do you like it?", "Who do you go with?"]
      }
    ]
  },
  storytelling: {
    title: "Storytelling",
    prompts: [
      {
        title: "One-Minute Story",
        description: "Tell a short story in one minute.",
        tips: ["Start with 'Once upon a time'", "Include a character", "Describe a problem", "Tell how it ends"]
      },
      {
        title: "My Best Day Ever",
        description: "Tell about the best day you've had.",
        tips: ["When was it?", "What happened?", "Who was there?", "Why was it special?"]
      },
      {
        title: "Magical Adventure",
        description: "Create a story about a magical adventure.",
        tips: ["What magical power do you have?", "Where does the adventure happen?", "What problem do you solve?"]
      }
    ]
  },
  imagination: {
    title: "Imagination",
    prompts: [
      {
        title: "My Dream Vacation",
        description: "Describe where you would go on your dream vacation.",
        tips: ["Where would you go?", "Who would you take?", "What would you do there?", "What would you see?"]
      },
      {
        title: "If I Had a Superpower",
        description: "Talk about what superpower you would choose.",
        tips: ["What power would you pick?", "How would you use it?", "Who would you help?", "What problems would you solve?"]
      },
      {
        title: "Future Me",
        description: "Describe what you want to be when you grow up.",
        tips: ["What job do you want?", "Why did you choose it?", "What skills do you need?", "How will you help others?"]
      }
    ]
  }
}

const speakingTips = [
  {
    category: "Vocabulary",
    tips: [
      "Use descriptive words to make your story more interesting",
      "Try to use new words you've learned recently",
      "Use connecting words like 'and', 'but', 'because', 'however'",
      "Practice using different words that mean the same thing (synonyms)"
    ]
  },
  {
    category: "Coherence",
    tips: [
      "Start with an introduction of what you'll talk about",
      "Organize your ideas in a logical order",
      "Use time words like 'first', 'then', 'next', 'finally'",
      "End with a conclusion or summary"
    ]
  },
  {
    category: "Fluency",
    tips: [
      "Take deep breaths before speaking",
      "Speak at a comfortable pace - not too fast, not too slow",
      "It's okay to pause briefly between ideas",
      "Practice common phrases you can use while thinking"
    ]
  },
  {
    category: "Body Language",
    tips: [
      "Make eye contact with your audience",
      "Use hand gestures to help explain ideas",
      "Stand or sit up straight",
      "Show enthusiasm through your facial expressions"
    ]
  }
]

const VoicePractice = () => {
  const [selectedTab, setSelectedTab] = useState("favorites")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState("prompt1")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timeIntervalRef = useRef<number | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const { currentUser } = useAuth()
  const [recordingTime, setRecordingTime] = useState(0)
  const { toast } = useToast()

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
    a.download = `voice-practice-${practiceTopics[selectedTab as keyof typeof practiceTopics].prompts[parseInt(selectedPrompt.replace('prompt', '')) - 1].title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.wav`;
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

  const saveToFirebase = async () => {
    if (!audioBlob || !currentUser) return

    try {
      const storageRef = ref(storage, `voice-recordings/${currentUser.uid}/${Date.now()}.wav`)
      await uploadBytes(storageRef, audioBlob)
      const downloadUrl = await getDownloadURL(storageRef)

      const recordingRef = collection(db, "voiceRecordings")
      await addDoc(recordingRef, {
        userId: currentUser.uid,
        url: downloadUrl,
        prompt: practiceTopics[selectedTab as keyof typeof practiceTopics].prompts[parseInt(selectedPrompt.replace('prompt', '')) - 1].title,
        createdAt: serverTimestamp()
      })

      toast({
        title: "Recording Saved",
        description: "Your recording has been saved to your library",
      })
    } catch (error) {
      console.error("Error saving recording:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save recording",
      })
    }
  }

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
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="practice">Practice Topics</TabsTrigger>
                <TabsTrigger value="tips">Speaking Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="practice">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="w-full grid grid-cols-3 mb-6">
                    {Object.keys(practiceTopics).map((key) => (
                      <TabsTrigger key={key} value={key}>
                        {practiceTopics[key as keyof typeof practiceTopics].title}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(practiceTopics).map(([key, category]) => (
                    <TabsContent key={key} value={key}>
                      <div className="space-y-4">
                        {category.prompts.map((prompt, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                              {prompt.title}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              {prompt.description}
                            </p>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tips:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {prompt.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="text-gray-600 dark:text-gray-400">{tip}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-4">
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
                                      <Button variant="secondary" onClick={saveToFirebase}>
                                        Save to Firebase
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
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>

              <TabsContent value="tips">
                <div className="grid gap-6 md:grid-cols-2">
                  {speakingTips.map((section, index) => (
                    <Card key={index} className="border-2 border-indigo-100 dark:border-indigo-900">
                      <CardHeader>
                        <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400">
                          {section.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default VoicePractice
