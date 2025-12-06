import { useEffect, useRef, useState } from 'react';
import { Level } from '../types/Level';

interface LevelChatDialogueProps {
  level: Level;
  chatHistory: { role: "player" | "npc", text: string }[];
  onMessageSend: (message: string) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  displayedText?: string;
}

export const LevelChatDialogue: React.FC<LevelChatDialogueProps> = ({
  level,
  chatHistory,
  onMessageSend,
  isLoading = false,
  isTyping = false,
  displayedText = ""
}) => {
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
              const isCompleted = level.level_state.completed_objectives.includes(objective.id);
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
        <input
          ref={inputRef}
          type="text"
          placeholder={isTyping ? "Waiting for response..." : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
          disabled={isLoading || isTyping}
          className='level-chat-input'
        />
        <button 
          onClick={handleInputSubmit}
          disabled={isLoading || isTyping || !input.trim()}
          className='level-chat-send-button'
        >
          Send
        </button>
      </div>
    </div>
  );
};

