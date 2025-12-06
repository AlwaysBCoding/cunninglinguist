import { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { fetchAIResponse, fetchCryptexAnalysis } from '../services/OpenAIService';
import { checkForCompletedObjectives } from './GameActions';
import areas from './Areas';
import { CryptexAnalysisView } from './CryptexAnalysisView';
import { gameEvents } from './GameEvents';
import { QuizQuestion } from '../types/Quiz';
import { QuizNPC, DynamicQuizNPC } from '../types/NPC';

export const StaticNPCDialogue = () => {
  const { gameState, updateGameState } = useGame();
  const npc = gameState.activeNPC;

  if (!npc || npc.type !== 'static') return null;

  const handleStaticDialogue = (index: number) => {
    const nextIndex = npc.staticDialogue![index].next![index];
    updateGameState((prev) => ({
      currentDialogueIndex: nextIndex,
      dialogue: nextIndex !== -1 ? npc.staticDialogue![nextIndex].text : null,
      activeNPC: nextIndex !== -1 ? gameState.activeNPC : null,
    }))
  }

  return (
    <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", padding: "10px", border: "2px solid black", maxWidth: "300px", textAlign: "center" }}>
      <p>{gameState.dialogue}</p>
      {npc.type === "static" && npc.staticDialogue && (
        <div>
          {npc.staticDialogue[gameState.currentDialogueIndex!]?.responses?.map((response, i) => (
            <button key={i} onClick={() => handleStaticDialogue(i)}>
              {response}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => updateGameState((prev) => ({
        activeNPC: null,
        dialogue: null,
        currentDialogueIndex: null
      }))}>Close</button>
    </div>
  );
}

export const AiNPCDialogue = () => {
  const { gameState, updateGameState } = useGame();
  const npc = gameState.activeNPC;
  const [input, setInput] = useState<string>("");
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);
  const [isCryptexLoading, setIsCryptexLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (npc && npc.type === "dynamic") {
      const initialConversation = [{ role: "npc" as const, text: npc.initialPrompt }];
      updateGameState((prev) => ({
        conversationHistory: initialConversation
      }));
      inputRef.current?.focus();
    }
  }, [npc]);

  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

  if (!npc || npc.type !== "dynamic") return null;

  const handleInputSubmit = async () => {
    if (!input.trim() || isTyping || isLoadingMessage) return;

    const newHistory = [...gameState.conversationHistory, { role: "player" as const, text: input }];
    updateGameState((prev) => ({
      conversationHistory: newHistory
    }));
    setInput("");
    setIsLoadingMessage(true);

    try {
      const aiResponse = await fetchAIResponse(
        npc,
        newHistory,
        areas[gameState.currentAreaIndex].systemPrompt,
        npc.speaksTargetLanguage ? gameState.targetLanguage.display : gameState.sourceLanguage.display
      );

      setIsLoadingMessage(false);
      setDisplayedText("");
      setIsTyping(true);

      let index = 0;
      const interval = setInterval(async () => {
        setDisplayedText(aiResponse.slice(0, index + 1));
        index++;
        if (index == aiResponse.length) {
          clearInterval(interval);
          setIsTyping(false);

          const nextConversationHistory = [...newHistory, { role: "npc" as const, text: aiResponse }];

          updateGameState((prev) => ({
            conversationHistory: nextConversationHistory
          }));

          if (gameState.activeNPC?.speaksTargetLanguage) {
            setIsCryptexLoading(true);
            const sentenceAnalysis = await fetchCryptexAnalysis(
              aiResponse,
              gameState.targetLanguage.display
            );
            if (sentenceAnalysis) {
              updateGameState((prev) => ({
                cryptexAnalysis: {
                  sentences: [sentenceAnalysis]
                }
              }));
              gameEvents.emit('cryptexAnalysisComplete', { analysis: { sentences: [sentenceAnalysis] } });
            }
            setIsCryptexLoading(false);
          }

          checkForCompletedObjectives(npc, nextConversationHistory, gameState);
        }
      }, 25);

    } catch (error) {
      setIsLoadingMessage(false);
      console.error("Error fetching AI response:", error);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        padding: "10px",
        border: "2px solid black",
        maxWidth: "400px",
        textAlign: "center",
      }}
    >
      <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "10px" }}>
        {gameState.conversationHistory.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.role === "player" ? "right" : "left", margin: "5px 0" }}>
            <strong>{msg.role === "player" ? gameState.player.name : npc.name}:</strong> {msg.text}
            {index === gameState.conversationHistory.length - 1 && isCryptexLoading && (
              <span style={{ fontStyle: "italic", marginLeft: "5px", color: "#666" }}>... analyzing</span>
            )}
          </div>
        ))}
        {isLoadingMessage && (
          <div style={{ textAlign: 'left', margin: '5px 0' }}>
            <strong>{npc.name}:</strong> <span className='typing-dots' />
          </div>
        )}
        {isTyping && (
          <div style={{ textAlign: 'left', margin: '5px 0' }}>
            <strong>{npc.name}:</strong> {displayedText + "|"}
          </div>
        )}
      </div>

      {npc.objectives && npc.objectives.length > 0 && (
        <div style={{ textAlign: "left", marginBottom: "10px", padding: "5px", border: "1px solid black", background: "#f8f8f8" }}>
          <strong>Objectives:</strong>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {npc.objectives.map((objective) => {
              const isCompleted = gameState.completedObjectives[npc.id]?.includes(objective.id);
              return (
                <li key={objective.id} style={{ color: isCompleted ? "green" : "black", fontWeight: isCompleted ? "bold" : "normal" }}>
                  {isCompleted ? "✔" : "○"} {objective.description}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        placeholder={isTyping ? "Waiting for response..." : "Type your response..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
        disabled={isLoadingMessage || isTyping}
        style={{
          width: "100%",
          padding: "5px",
          marginBottom: "5px",
          backgroundColor: (isLoadingMessage || isTyping) ? "#e0e0e0" : "white",
          cursor: (isLoadingMessage || isTyping) ? "not-allowed" : "text",
          border: (isLoadingMessage || isTyping) ? "1px solid #aaa" : "1px solid black",
          color: (isLoadingMessage || isTyping) ? "#777" : "black",
        }} />
      <button onClick={() => updateGameState((prev) => ({ activeNPC: null, dialogue: null, conversationHistory: [] }))}>
        Close
      </button>

      {gameState.cryptexAnalysis && <CryptexAnalysisView />}
    </div>
  );
};

export const QuizNPCDialogue = () => {
  const { gameState, updateGameState } = useGame();
  const npc = gameState.activeNPC as QuizNPC | null;
  const [input, setInput] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);

  useEffect(() => {
    if (npc && npc.type === 'quiz') {
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setQuizComplete(false);
      setFeedback(null);
      inputRef.current?.focus();
    }
  }, [npc]);

  if (!npc || npc.type !== "quiz") return null;

  const handleQuizEnd = () => {
    setQuizComplete(true);

    if (correctAnswers >= npc.passThreshold) {
      setFeedback(`🎉 You passed the quiz!`);
      if (npc.reward) {
        gameEvents.emit('itemCollected', { item: npc.reward })
      }
    } else {
      setFeedback(`💔 You failed the quiz.`);
      if (npc.penalty === 'loseHealth') {
        gameEvents.emit('playerDamaged', { amount: 1 });
      }
    }

    setTimeout(() => {
      updateGameState((prev) => ({
        activeNPC: null,
        dialogue: null
      }))
    }, 2000);
  }

  const handleQuizSubmission = () => {
    if (!input.trim() || quizComplete) return;

    const question = npc.questions[currentQuestionIndex];
    const normalizedAnswer = input.trim().toLowerCase();
    const isCorrect = question.correctAnswers.some(ans => ans.toLowerCase() === normalizedAnswer);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback("❌ Incorrect.");
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentQuestionIndex + 1 < npc.questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
        setInput('');
      } else {
        handleQuizEnd();
      }
    }, 1000);
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        padding: "10px",
        border: "2px solid black",
        maxWidth: "400px",
        textAlign: "center",
      }}
    >
      <h3>{npc.name} - Quiz Challenge</h3>

      {!quizComplete ? (
        <>
          <p>{npc.questions[currentQuestionIndex].prompt}</p>
          <input
            ref={inputRef}
            type="text"
            placeholder="Your answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuizSubmission()}
            style={{ width: "100%", padding: "5px", marginBottom: "5px" }}
          />
          <button onClick={handleQuizSubmission}>Submit</button>
        </>
      ) : (
        <p>{feedback}</p>
      )}

      {feedback && <p>{feedback}</p>}

      <button onClick={() => updateGameState((prev) => ({ activeNPC: null, dialogue: null }))}>
        Close
      </button>
    </div>
  );
}

export const DynamicQuizNPCDialogue = () => {
  const { gameState, isGameOver, updateGameState } = useGame();
  const npc = gameState.activeNPC as DynamicQuizNPC | null;
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [input, setInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (npc && npc.type === "quiz") {
      npc.generateQuestion(
        gameState.sourceLanguage,
        gameState.targetLanguage
      ).then(setQuestion);
      setFeedback(null);
      setInput("");
      inputRef.current?.focus();
    }
  }, [npc]);

  if (!npc || npc.type !== "quiz" || !question) return null;

  const handleQuizSubmission = () => {
    if (!input.trim()) return;

    const normalizedAnswer = input.trim().toLowerCase();
    const isCorrect = question.correctAnswers.some(ans => ans.toLowerCase() === normalizedAnswer);

    if (isCorrect) {
      setFeedback("✅ Correct! You earned $10.");
      gameEvents.emit("increaseMoney", { amount: 10 });

      setTimeout(() => {
        updateGameState((prev) => ({
          ...prev,
          activeNPC: null,
          dialogue: null
        }));
      }, 2000);
    } else {
      setFeedback("❌ Incorrect. Try again.");
      gameEvents.emit("playerDamaged", { amount: 1 });
    }

    setInput("");
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        padding: "10px",
        border: "2px solid black",
        maxWidth: "400px",
        textAlign: "center",
      }}
    >
      <h3>{npc.name} - Transliteration Quiz</h3>
      <p>{question.prompt}</p>

      <input
        ref={inputRef}
        type="text"
        placeholder={!isGameOver ? "Your answer..." : "Game Over"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleQuizSubmission()}
        disabled={isGameOver}
        style={{
          width: "100%",
          padding: "5px",
          marginBottom: "5px",
          backgroundColor: !isGameOver ? "white" : "#e0e0e0",
          cursor: !isGameOver ? "text" : "not-allowed",
          border: !isGameOver ? "1px solid black" : "1px solid red",
          color: !isGameOver ? "black" : "#777",
        }}
      />
      <button onClick={handleQuizSubmission} disabled={isGameOver}>
        Submit
      </button>

      {feedback && <p>{feedback}</p>}

      <button onClick={() => updateGameState((prev) => ({
        ...prev,
        activeNPC: null,
        dialogue: null
      }))}>
        Close
      </button>
    </div>
  );
};
