import { createContext, useContext, useEffect, useState } from 'react';

import { GameState } from '../types/GameState';

import type { GameEventPayload } from '../game/GameEvents';
import { gameEvents } from '../game/GameEvents';
import {
  addItemToInventory,
  dropItemFromInventory,
  consumeItem,
  healPlayer,
  increaseMaxHealth,
  increaseMoney,
  takeDamage
} from '../game/GameActions';
import areas from '../game/Areas';

import { Dictionary } from '../types/Dictionary';
import { WordAnalysis } from '../types/Cryptex';
import { useDictionary } from '../hooks/useDictionary';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';

interface GameContextType {
  gameState: GameState;
  isGameOver: boolean;
  updateGameState: (updates: (prev: GameState) => Partial<GameState>) => void;
  saveGameState: () => void;
  resetGame: () => void;
  dictionary: Dictionary,
  addWordToDictionary: (wordAnalysis: WordAnalysis) => void,
  advanceToArea: (newAreaIndex: number) => void;
  movePlayer: (dx: number, dy: number) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  activeSubmenu: string;
  setActiveSubmenu: (submenu: string) => void;
  selectedOption: number;
  setSelectedOption: (index: number) => void;
  selectedArea: number;
  setSelectedArea: (index: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(
    loadFromLocalStorage<GameState>(STORAGE_KEYS.GAME_STATE, {
      sourceLanguage: { code: 'en', display: 'English' },
      targetLanguage: { code: 'hi', display: 'Hindi' },
      currentAreaIndex: 0,
      collectedItems: {},
      completedObjectives: {},
      player: {
        name: 'Ash',
        money: 0,
        rizz: 0,
        inventory: [],
        health: 3,
        maxHealth: 3
      },
      playerX: 0,
      playerY: 0,
      dialogue: null,
      activeNPC: null,
      currentDialogueIndex: null,
      conversationHistory: [],
      cryptexAnalysis: null
    })
  );
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const { dictionary, addWordToDictionary } = useDictionary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState(0);
  const [selectedArea, setSelectedArea] = useState(0);

  const updateGameState = (updates: (prev: GameState) => Partial<GameState>) => {
    setGameState((prev) => {
      const nextState = { ...prev, ...updates(prev) };
      if (nextState.player.health <= 0) {
        setIsGameOver(true);
      }
      return nextState;
    })
  }

  const saveGameState = () => {
    saveToLocalStorage(STORAGE_KEYS.GAME_STATE, gameState);
  }

  const resetGame = () => {
    const savedGameState = loadFromLocalStorage<GameState>(STORAGE_KEYS.GAME_STATE, gameState);
    setGameState(savedGameState);
    setIsGameOver(false);
  }

  useEffect(() => {
    const handleIncreaseMoney = ({ amount }: GameEventPayload['increaseMoney']) => {
      updateGameState(increaseMoney(amount));
    }

    const handleObjectiveCompleted = ({ npc, objective }: GameEventPayload['objectiveCompleted']) => {
      if (objective.action === "giveItem") {
        updateGameState((prev) => ({
          completedObjectives: {
            ...prev.completedObjectives,
            [npc.id]: [...(prev.completedObjectives[npc.id] || []), objective.id]
          },
          player: {
            ...prev.player,
            inventory: addItemToInventory(prev.player.inventory, objective.item)
          }
        }));
      }
    };

    const handleItemCollected = ({ item }: GameEventPayload['itemCollected']) => {
      updateGameState((prev) => {
        return {
          ...prev,
          player: {
            ...prev.player,
            inventory: addItemToInventory(prev.player.inventory, item)
          },
        }
      })
    }

    const handlePlayerDamaged = ({ amount }: GameEventPayload['playerDamaged']) => {
      updateGameState(takeDamage(amount));
    };

    const handlePlayerHealed = ({ amount }: GameEventPayload['playerHealed']) => {
      updateGameState(healPlayer(amount));
    };

    const handleMaxHealthIncrease = ({ amount }: GameEventPayload['maxHealthIncreased']) => {
      updateGameState(increaseMaxHealth(amount));
    };

    gameEvents.on('increaseMoney', handleIncreaseMoney);
    gameEvents.on('itemCollected', handleItemCollected);
    gameEvents.on("maxHealthIncreased", handleMaxHealthIncrease);
    gameEvents.on("objectiveCompleted", handleObjectiveCompleted);
    gameEvents.on("playerDamaged", handlePlayerDamaged);
    gameEvents.on("playerHealed", handlePlayerHealed);

    return () => {
      gameEvents.off('increaseMoney', handleIncreaseMoney);
      gameEvents.off('itemCollected', handleItemCollected);
      gameEvents.off("maxHealthIncreased", handleMaxHealthIncrease);
      gameEvents.off("objectiveCompleted", handleObjectiveCompleted);
      gameEvents.off("playerDamaged", handlePlayerDamaged);
      gameEvents.off("playerHealed", handlePlayerHealed);
    };
  }, []);

  const advanceToArea = (newAreaIndex: number) => {
    setGameState((prev) => ({
      ...prev,
      currentAreaIndex: newAreaIndex,
      playerX: 0,
      playerY: 0
    }));
    setMenuOpen(false);
    setActiveSubmenu('');
  }

  const movePlayer = (dx: number, dy: number) => {
    setGameState((prev) => {

      // Prevent Movement when talking to an NPC
      if (prev.activeNPC) return prev;

      // Set new PlayerX and PlayerY
      const area = areas[prev.currentAreaIndex];
      let newX = Math.max(0, Math.min(prev.playerX + dx, area.width - 1));
      let newY = Math.max(0, Math.min(prev.playerY + dy, area.height - 1));

      // Check if moving into NPC
      const npc = area.npcs.find((npc) => npc.x === newX && npc.y === newY);
      if (npc) {
        return {
          ...prev,
          activeNPC: npc,
          dialogue: npc.type === 'static' ? npc.staticDialogue![0].text : null,
          currentDialogueIndex: 0
        }
      }

      // Check if collecting item
      // const item = area.items.find((item) => item.x === newX && item.y === newY);
      // if (item && !prev.collectedItems[area.id]?.includes(item.id)) {
      //   return {
      //     ...prev,
      //     collectedItems: {
      //       ...prev.collectedItems,
      //       [area.id]: [...(prev.collectedItems[area.id] || []), item.id]
      //     },
      //     player: {
      //       ...prev.player,
      //       inventory: addItemToInventory(prev.player.inventory, item)
      //     },
      //   }
      // }

      return {
        ...prev,
        playerX: newX,
        playerY: newY,
        dialogue: null,
        activeNPC: null
      };
    })
  }

  // Global Keyboard Event Handling for both Game & Menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const commandPressed = event.metaKey || event.ctrlKey;
      const controlPressed = event.ctrlKey;
      const altPressed = event.altKey;

      if (event.key === " ") {
        setMenuOpen((prev) => !prev);
        setActiveSubmenu('');
        return;
      }

      if (menuOpen) {
        if (activeSubmenu) {
          if (activeSubmenu === "MAP") {
            if (event.key === "ArrowUp") setSelectedArea((prev) => (prev > 0 ? prev - 1 : areas.length - 1));
            if (event.key === "ArrowDown") setSelectedArea((prev) => (prev < areas.length ? prev + 1 : 0));
            if (event.key === "Enter") advanceToArea(selectedArea);
          } else if (activeSubmenu === "ITEMS") {
            if (event.key === "ArrowUp") {
              setSelectedOption((prev) =>
                prev > 0 ? prev - 1 : gameState.player.inventory.length - 1
              );
            }
            if (event.key === "ArrowDown") {
              setSelectedOption((prev) =>
                prev < gameState.player.inventory.length - 1 ? prev + 1 : 0
              );
            }

            const selectedItem = gameState.player.inventory[selectedOption];

            if (event.key === "Enter" && selectedItem?.consumable) {
              updateGameState(consumeItem(selectedItem.id));
            }

            if (event.key === "x" && selectedItem) {
              updateGameState(dropItemFromInventory(selectedItem.id));
            }
          } else if (activeSubmenu === "SAVE") {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              setSelectedOption((prev) => (prev === 0 ? 1 : 0));
            }
            if (event.key === "Enter") {
              if (selectedOption === 0) {
                saveGameState();
              }
              setActiveSubmenu("");
            }
            if (event.key === "Escape") setActiveSubmenu("");
          }
          if (event.key === "Escape") setActiveSubmenu('');
        } else {
          if (event.key === "ArrowUp") setSelectedOption((prev) => (prev > 0 ? prev - 1 : 0));
          if (event.key === "ArrowDown") setSelectedOption((prev) => (prev < 5 ? prev + 1 : 5));
          if (event.key === "Enter") {
            if (selectedOption === 0) setActiveSubmenu("MAP");
            else if (selectedOption === 1) setActiveSubmenu("ITEMS");
            else if (selectedOption === 2) setActiveSubmenu("PLAYER");
            else if (selectedOption === 3) setActiveSubmenu("DICTIONARY");
            else if (selectedOption === 4) setActiveSubmenu("SAVE");
            else setMenuOpen(false);
          }
          if (event.key === "Escape") setMenuOpen(false);
        }
        return;
      }

      if (!menuOpen) {
        if (event.key === "ArrowRight") movePlayer(1, 0);
        if (event.key === "ArrowLeft") movePlayer(-1, 0);
        if (event.key === "ArrowDown") movePlayer(0, 1);
        if (event.key === "ArrowUp") movePlayer(0, -1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, activeSubmenu, selectedOption, selectedArea]);

  return (
    <GameContext.Provider value={{
      gameState,
      isGameOver,
      updateGameState,
      saveGameState,
      resetGame,
      dictionary,
      addWordToDictionary,
      advanceToArea,
      movePlayer,
      menuOpen,
      setMenuOpen,
      activeSubmenu,
      setActiveSubmenu,
      selectedOption,
      setSelectedOption,
      selectedArea,
      setSelectedArea
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
