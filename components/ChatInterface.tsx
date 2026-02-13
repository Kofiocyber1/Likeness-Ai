import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, StopCircle, Upload, Loader2, Play, Image as ImageIcon, Zap, ShieldAlert, Award } from 'lucide-react';
import { ChatMessage, ScanResult } from '../types';
import { sendChatMessage, generateSpeech, scoreIdea } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'model',
      content: 'Welcome to Likeness Ai. Record an idea, upload a photo to check for Deepfakes, or ask about copyright protection.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<{file: File, preview: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Audio Playback Logic
  const playAudio = async (messageId: string, text: string, existingBuffer?: AudioBuffer) => {
    // Stop any current playback
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    
    // Toggle off if clicking the same message
    if (currentlyPlayingId === messageId) {
      setCurrentlyPlayingId(null);
      return;
    }

    setCurrentlyPlayingId(messageId);
    try {
      let buffer = existingBuffer;
      // Generate speech if not cached
      if (!buffer) {
        buffer = await generateSpeech(text);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioBuffer: buffer, hasAudio: true } : m));
      }
      
      // Init Audio Context
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer!;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setCurrentlyPlayingId(null);
        sourceNodeRef.current = null;
      };
      
      source.start();
      sourceNodeRef.current = source;
    } catch (error) {
      console.error("Playback failed", error);
      setCurrentlyPlayingId(null);
    }
  };

  // Recording Logic
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          // Simulate adding the audio as a user message
          const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: "🎤 Audio Note Recorded",
            timestamp: new Date(),
            attachments: [{ type: 'audio', url: audioUrl }]
          };
          setMessages(prev => [...prev, userMsg]);
          
          // Automatically trigger "Scoring" for this audio (Simulated transcription for now)
          processAudioIdea("I have an idea for a new way to protect digital likeness using blockchain..."); 
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone", err);
      }
    }
  };

  const processAudioIdea = async (transcribedText: string) => {
      setIsProcessing(true);
      // Simulate Gemini analysis of the "Audio"
      const score = await scoreIdea(transcribedText);
      const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `**Audio Analysis Complete**\n\nPatent Potential: ${score.patentScore}/100\nCopyright Strength: ${score.copyrightScore}/100\n\n${score.details}`,
          timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
      setIsProcessing(false);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setAttachment({ file, preview: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !attachment) || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText || (attachment ? "Analyze this image" : ""),
      timestamp: new Date(),
      attachments: attachment ? [{ type: 'image', url: attachment.preview, base64: attachment.preview.split(',')[1] }] : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAttachment(null);
    setIsProcessing(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      let responseText = "";
      
      // Check for keywords or attachment to decide action
      if (userMsg.attachments && userMsg.attachments[0].type === 'image') {
          // Send image to Gemini
          responseText = await sendChatMessage(
              userMsg.content, 
              history, 
              { inlineData: { data: userMsg.attachments[0].base64!, mimeType: 'image/jpeg' } }
          );
      } else if (inputText.toLowerCase().includes('score') || inputText.toLowerCase().includes('patent')) {
          const score = await scoreIdea(inputText);
           responseText = `**Idea Scorecard**\n\n🛡️ Patent Potential: ${score.patentScore}/100\n©️ Copyright Strength: ${score.copyrightScore}/100\n\n${score.details}`;
      } else {
          responseText = await sendChatMessage(inputText, history);
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date(),
        hasAudio: false
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      // Error handling
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white max-w-5xl mx-auto w-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
             <div className="flex items-end gap-3 max-w-[85%]">
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-xs">Ai</span>
                    </div>
                )}
                
                <div className={`space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                    {/* Attachments */}
                    {msg.attachments?.map((att, i) => (
                        att.type === 'image' ? (
                            <img key={i} src={att.url} alt="upload" className="max-w-xs rounded-lg border border-gray-200" />
                        ) : (
                            <div key={i} className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                                <Mic size={16} className="text-[#EE334E]" /> Audio Note
                            </div>
                        )
                    ))}

                    <div
                    className={`px-6 py-4 rounded-3xl text-sm leading-relaxed ${
                        msg.role === 'user'
                        ? 'bg-[#0081C8] text-white rounded-br-none'
                        : 'bg-gray-100 text-black rounded-bl-none'
                    }`}
                    >
                        <div className="whitespace-pre-wrap">
                            {msg.content.split('**').map((part, i) => 
                            i % 2 === 1 ? <div key={i} className="font-bold my-2 text-[#000000] uppercase tracking-wide">{part}</div> : part
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Read Aloud Button for AI Messages */}
            {msg.role === 'model' && (
                <div className="ml-11 mt-2">
                    <button 
                        onClick={() => playAudio(msg.id, msg.content, msg.audioBuffer)}
                        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${currentlyPlayingId === msg.id ? 'text-[#EE334E]' : 'text-gray-400 hover:text-black'}`}
                    >
                        {currentlyPlayingId === msg.id ? <StopCircle size={14} /> : <Volume2 size={14} />}
                        {currentlyPlayingId === msg.id ? 'Stop Reading' : 'Read Aloud'}
                    </button>
                </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-3 ml-2">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase animate-pulse">Processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100">
        {attachment && (
            <div className="mb-4 flex items-center gap-2 bg-gray-50 p-2 w-fit rounded-lg border border-gray-200">
                <img src={attachment.preview} className="w-10 h-10 object-cover rounded" />
                <button onClick={() => setAttachment(null)} className="p-1 hover:bg-gray-200 rounded-full"><ShieldAlert size={14} /></button>
            </div>
        )}
        
        <div className="flex items-end gap-3">
          <label className="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full cursor-pointer transition-colors border border-transparent hover:border-gray-200">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            <ImageIcon size={22} />
          </label>
          
          <button 
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-colors border ${
                isRecording 
                ? 'bg-[#EE334E] text-white border-[#EE334E] animate-pulse' 
                : 'text-gray-400 hover:text-black hover:bg-gray-50 hover:border-gray-200'
            }`}
          >
            <Mic size={22} />
          </button>

          <div className="flex-1 relative">
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message Likeness Ai..."
                className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-black/5 rounded-2xl py-3 px-4 text-sm min-h-[50px] resize-none"
                rows={1}
            />
            <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FCB131]"
                title="Score Idea"
                onClick={() => setInputText("Score my idea: " + inputText)}
            >
                <Award size={18} />
            </button>
          </div>

          <button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() && !attachment}
            className={`p-3 rounded-full transition-all ${
                inputText.trim() || attachment
                ? 'bg-black text-white hover:bg-[#00A651]' 
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            <Send size={22} />
          </button>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>Copyright</span> • <span>Trademark</span> • <span>Patent Potential</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;