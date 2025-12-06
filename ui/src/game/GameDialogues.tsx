import { gameEvents } from "./GameEvents";
import { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

export const ItemCollectionDialogue = () => {

  const { gameState, updateGameState } = useGame();

  useEffect(() => {
    gameEvents.on('itemCollected', ({ item }) => {
      updateGameState((prev) => ({ dialogue: `${gameState.player.name} obtained the ${item.name}`}));
    })
  }, [])

  if (!gameState.dialogue) return null;

  return (
    <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", padding: "10px", border: "2px solid black", maxWidth: "300px", textAlign: "center" }}>
      <p>{gameState.dialogue}</p>
      <button onClick={() => updateGameState((prev) => ({
        dialogue: null
      }))}>Close</button>
    </div>
  );

}
