import React from 'react';
import areas from '../game/Areas';
import { useGame } from '../contexts/GameContext';

import { GameStateRenderer } from '../game/GameStateRenderer';

import { GameOverModal } from '../game/GameOverModal';
import { GameMenu } from '../game/GameMenu';
import { ItemCollectionDialogue } from '../game/GameDialogues';
import { StaticNPCDialogue, AiNPCDialogue, QuizNPCDialogue, DynamicQuizNPCDialogue } from '../game/NPCDialogue';
import { DictionaryComponent } from '../game/Dictionary';

export const HomeScreen: React.FC = () => {
  const { gameState, isGameOver } = useGame();

  return (
    <div className='Screen home-screen'>
      <h1 className='title'>Game Screen</h1>
      <h2 className='subtitle'>{`${areas[gameState.currentAreaIndex].id}`}</h2>
      <div className='game-display'>
        <div className='player-info'>
          <p>{`Player: ${gameState.player.name}`}</p>
          <p>{`Health: ${gameState.player.health}/${gameState.player.maxHealth}`}</p>
          <p>{`Money: ${gameState.player.money}`}</p>
          <p>{`Rizz: ${gameState.player.rizz}`}</p>
        </div>
        <GameStateRenderer gameState={gameState} />
        <div className='inventory'>
          <h4>Inventory</h4>
          {gameState.player.inventory.map((item, index) => (
            <p
              className='inventory-item'
              key={index}>{item.name} x{item.quantity}</p>
          ))}
        </div>
      </div>
      <ItemCollectionDialogue />
      <DictionaryComponent />
      <StaticNPCDialogue />
      <AiNPCDialogue />
      {/* <QuizNPCDialogue /> */}
      <DynamicQuizNPCDialogue />
      <GameMenu />
      {isGameOver && <GameOverModal />}
    </div>
  );
}
