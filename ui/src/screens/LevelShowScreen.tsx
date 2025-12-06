import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LEVELS } from '../const/levels';
import { LevelChatDialogue } from '../game/LevelChatDialogue';
import { Level } from '../types/Level';
import { fetchLevelAIResponse, evaluateLevelObjectives } from '../services/OpenAIService';
import { renderSystemPrompt } from '../helpers/promptRenderer';

export const LevelShowScreen: React.FC = () => {
  const { level } = useParams<{ level: string }>();
  const levelData = LEVELS.find(l => l.ident === level);
  const [chatHistory, setChatHistory] = useState<{ role: "player" | "npc", text: string }[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const initializedRef = useRef<string | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only initialize once per level
    if (levelData && initializedRef.current !== levelData.ident) {
      initializedRef.current = levelData.ident;
      
      // Reset state when switching levels
      setChatHistory([]);
      setSystemPrompt("");
      setCompletedObjectives(levelData.level_state.completed_objectives);
      setIsLoading(false);
      setIsTyping(false);
      setDisplayedText("");
      
      // Clear any existing typing interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      
      // Initialize chat history from level state
      const initialHistory = levelData.level_state.chat_history;
      setChatHistory(initialHistory);
      
      // Render the system prompt and generate initial NPC message if chat is empty
      renderSystemPrompt('/assets/baseconvotemplate.md', levelData)
        .then((prompt) => {
          console.log('=== RENDERED SYSTEM PROMPT ===');
          console.log(prompt);
          console.log('=== END PROMPT ===');
          
          setSystemPrompt(prompt);
          
          // If chat history is empty, generate an initial NPC greeting
          if (initialHistory.length === 0) {
            setIsLoading(true);
            fetchLevelAIResponse([], prompt)
              .then((initialMessage) => {
                setIsLoading(false);
                setIsTyping(true);
                setDisplayedText("");
                
                // Simulate typing animation for initial message
                let index = 0;
                typingIntervalRef.current = setInterval(() => {
                  setDisplayedText(initialMessage.slice(0, index + 1));
                  index++;
                  if (index >= initialMessage.length) {
                    if (typingIntervalRef.current) {
                      clearInterval(typingIntervalRef.current);
                      typingIntervalRef.current = null;
                    }
                    setIsTyping(false);
                    const finalHistory = [{ role: "npc" as const, text: initialMessage }];
                    setChatHistory(finalHistory);
                    setDisplayedText("");
                    
                    // Evaluate objectives after initial message
                    if (levelData && prompt) {
                      const currentCompleted = levelData.level_state.completed_objectives;
                      evaluateLevelObjectives(
                        { objectives: levelData.objectives, level_state: { completed_objectives: currentCompleted } },
                        finalHistory,
                        prompt
                      )
                        .then((newlyCompleted) => {
                          if (newlyCompleted.length > 0) {
                            console.log(`🎉 Initial message completed ${newlyCompleted.length} objective(s):`, newlyCompleted);
                            // Update completed objectives state
                            const updated = [...currentCompleted, ...newlyCompleted];
                            setCompletedObjectives(updated);
                            // Update levelData's level_state
                            levelData.level_state.completed_objectives = updated;
                          }
                        })
                        .catch((error) => {
                          console.error("Error evaluating objectives after initial message:", error);
                        });
                    }
                  }
                }, 25);
              })
              .catch((error) => {
                console.error("Error getting initial NPC message:", error);
                setIsLoading(false);
                setIsTyping(false);
              });
          }
        })
        .catch((error) => {
          console.error('Error rendering system prompt:', error);
        });
    }
    
    // Cleanup function
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [levelData?.ident]);

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

  const handleMessageSend = async (message: string) => {
    // Don't send if we don't have a system prompt yet
    if (!systemPrompt) {
      console.warn("System prompt not loaded yet, please wait...");
      return;
    }
    
    // Add player message to chat history
    const newHistory = [...chatHistory, { role: "player" as const, text: message }];
    setChatHistory(newHistory);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call the generic Level AI response function with system prompt
      const response = await fetchLevelAIResponse(newHistory, systemPrompt);
      
      setIsLoading(false);
      setIsTyping(true);
      setDisplayedText("");
      
      // Clear any existing typing interval before starting a new one
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      
      // Simulate typing animation
      let index = 0;
      typingIntervalRef.current = setInterval(() => {
        setDisplayedText(response.slice(0, index + 1));
        index++;
        if (index >= response.length) {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsTyping(false);
          const finalHistory = [...newHistory, { role: "npc" as const, text: response }];
          setChatHistory(finalHistory);
          setDisplayedText("");
          
          // Evaluate objectives after NPC response
          if (levelData && systemPrompt) {
            // Get current completed objectives (use state if available, otherwise fall back to levelData)
            const currentCompleted = completedObjectives.length > 0 
              ? completedObjectives 
              : levelData.level_state.completed_objectives;
            
            evaluateLevelObjectives(
              { objectives: levelData.objectives, level_state: { completed_objectives: currentCompleted } },
              finalHistory,
              systemPrompt
            )
              .then((newlyCompleted) => {
                if (newlyCompleted.length > 0) {
                  console.log(`🎉 Response completed ${newlyCompleted.length} objective(s):`, newlyCompleted);
                  // Update completed objectives state
                  const updated = [...currentCompleted, ...newlyCompleted];
                  setCompletedObjectives(updated);
                  // Also update levelData's level_state
                  levelData.level_state.completed_objectives = updated;
                }
              })
              .catch((error) => {
                console.error("Error evaluating objectives after NPC response:", error);
              });
          }
        }
      }, 25);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      setIsLoading(false);
      setIsTyping(false);
      
      // Add error message to history
      const errorResponse = "I'm sorry, I'm having trouble responding right now. Please try again.";
      setChatHistory([...newHistory, { role: "npc" as const, text: errorResponse }]);
    }
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
            completedObjectives={completedObjectives}
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
