import { useEffect, useRef, useState } from 'react';
import { Level } from '../types/Level';
import { transcribeAudio } from '../services/OpenAIService';

interface LevelChatDialogueProps {
  level: Level;
  chatHistory: { role: "player" | "npc", text: string }[];
  completedObjectives?: string[];
  onMessageSend: (message: string) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  displayedText?: string;
}

export const LevelChatDialogue: React.FC<LevelChatDialogueProps> = ({
  level,
  chatHistory,
  completedObjectives,
  onMessageSend,
  isLoading = false,
  isTyping = false,
  displayedText = ""
}) => {
  const [input, setInput] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('audio/webm');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping, displayedText]);

  const handleInputSubmit = () => {
    if (!input.trim() || isLoading || isTyping) return;
    onMessageSend(input.trim());
    setInput("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check for supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
      }
      mimeTypeRef.current = mimeType;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Transcribe the audio
        setIsTranscribing(true);
        try {
          const transcribedText = await transcribeAudio(audioBlob, String(level.native_language.code));
          setInput(prev => prev + (prev ? ' ' : '') + transcribedText);
        } catch (error) {
          console.error("Error transcribing audio:", error);
          // alert("Failed to transcribe audio. Please try again.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  return (
    <div className='level-chat-container'>
      <div className='level-chat-header'>
        <h2>{level.character_name}</h2>
        <p className='character-role'>{level.character_role}</p>
      </div>

      <div className='level-chat-history' ref={chatContainerRef}>
        {chatHistory.length === 0 && (
          <div className='chat-welcome-message'>
            <p>{level.scenario_setting}</p>
          </div>
        )}
        {chatHistory.map((msg, index) => (
          <div 
            key={index} 
            className={`chat-message ${msg.role === "player" ? "player-message" : "npc-message"}`}
          >
            <strong>{msg.role === "player" ? "You" : level.character_name}:</strong> {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className='chat-message npc-message'>
            <strong>{level.character_name}:</strong> <span className='typing-dots' />
          </div>
        )}
        {isTyping && (
          <div className='chat-message npc-message'>
            <strong>{level.character_name}:</strong> {displayedText + "|"}
          </div>
        )}
      </div>

      {level.objectives && level.objectives.length > 0 && (
        <div className='level-objectives'>
          <strong>Objectives:</strong>
          <ul>
            {level.objectives.map((objective) => {
              const isCompleted = (completedObjectives || level.level_state.completed_objectives).includes(objective.id);
              return (
                <li key={objective.id} className={isCompleted ? "completed" : ""}>
                  {isCompleted ? "✔" : "○"} {objective.display_text}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className='level-chat-input-container'>
        <button
          onClick={handleMicrophoneClick}
          disabled={isLoading || isTyping || isTranscribing}
          className={`level-chat-mic-button ${isRecording ? 'recording' : ''}`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isTranscribing ? '⏳' : isRecording ? '🔴' : '🎤'}
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder={
            isTranscribing 
              ? "Transcribing..." 
              : isTyping 
                ? "Waiting for response..." 
                : "Type your message..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
          disabled={isLoading || isTyping || isTranscribing}
          className='level-chat-input'
        />
        <button 
          onClick={handleInputSubmit}
          disabled={isLoading || isTyping || isTranscribing || !input.trim()}
          className='level-chat-send-button'
        >
          Send
        </button>
      </div>
    </div>
  );
};

