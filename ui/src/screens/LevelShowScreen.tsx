import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LEVELS } from '../const/levels';
import { LevelChatDialogue } from '../game/LevelChatDialogue';
import { Level } from '../types/Level';

export const LevelShowScreen: React.FC = () => {
  const { level } = useParams<{ level: string }>();
  const levelData = LEVELS.find(l => l.ident === level);
  const [chatHistory, setChatHistory] = useState<{ role: "player" | "npc", text: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (levelData) {
      // Initialize chat history from level state
      setChatHistory(levelData.level_state.chat_history);
    }
  }, [levelData]);

  useEffect(() => {
    // Ensure video loops
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.play().catch(err => {
        console.log("Video autoplay prevented:", err);
      });
    }
  }, [levelData]);

  if (!levelData) {
    return (
      <div className='Screen level-show-screen'>
        <h1 className='title'>Level not found</h1>
      </div>
    );
  }

  const handleMessageSend = (message: string) => {
    // Add player message to chat history
    const newHistory = [...chatHistory, { role: "player" as const, text: message }];
    setChatHistory(newHistory);
    
    // TODO: Implement API call to get NPC response
    // For now, just simulate a response
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsTyping(true);
      setDisplayedText("");
      
      // Simulate typing animation
      const response = "This is a placeholder response. API integration coming soon.";
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(response.slice(0, index + 1));
        index++;
        if (index >= response.length) {
          clearInterval(interval);
          setIsTyping(false);
          setChatHistory([...newHistory, { role: "npc" as const, text: response }]);
          setDisplayedText("");
        }
      }, 25);
    }, 500);
  };

  const getVideoPath = (level: Level): string => {
    return level.character_asset_path;
  };

  return (
    <div className='Screen level-show-screen'>
      <div className='level-show-header'>
        <h1 className='title'>{levelData.display_name}</h1>
      </div>
      <div className='level-show-content'>
        <div className='level-character-container'>
          <video
            ref={videoRef}
            className='level-character-video'
            src={getVideoPath(levelData)}
            autoPlay
            loop
            muted
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className='level-chat-wrapper'>
          <LevelChatDialogue
            level={levelData}
            chatHistory={chatHistory}
            onMessageSend={handleMessageSend}
            isLoading={isLoading}
            isTyping={isTyping}
            displayedText={displayedText}
          />
        </div>
      </div>
    </div>
  );
}
