import { useEffect, useRef } from 'react';
import { GameState } from '../types/GameState';
import areas from './Areas';

const TILE_SIZE = 16;
const VIEWPORT_WIDTH = 15;
const VIEWPORT_HEIGHT = 15;
const CANVAS_WIDTH = TILE_SIZE * VIEWPORT_WIDTH;
const CANVAS_HEIGHT = TILE_SIZE * VIEWPORT_HEIGHT;

interface GameStateRendererProps {
  gameState: GameState;
}

export const GameStateRenderer = ({ gameState }: GameStateRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const area = areas[gameState.currentAreaIndex];

      const viewportX = Math.max(0, Math.min(gameState.playerX - Math.floor(VIEWPORT_WIDTH / 2), area.width - VIEWPORT_WIDTH));
      const viewportY = Math.max(0, Math.min(gameState.playerY - Math.floor(VIEWPORT_HEIGHT / 2), area.height - VIEWPORT_HEIGHT));

      for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
        for (let x = 0; x < VIEWPORT_WIDTH; x++) {
          const tileX = x + viewportX;
          const tileY = y + viewportY;

          if (tileY < area.height && tileX < area.width) {
            ctx.fillStyle = area.data[tileY][tileX];
          }

          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // Draw items
      area.items.forEach((item) => {
        const itemScreenX = (item.x - viewportX) * TILE_SIZE;
        const itemScreenY = (item.y - viewportY) * TILE_SIZE;
        if (
          !gameState.collectedItems[area.id]?.includes(item.id) &&
          item.x >= viewportX &&
          item.x < viewportX + VIEWPORT_WIDTH &&
          item.y >= viewportY &&
          item.y < viewportY + VIEWPORT_HEIGHT
        ) {
          ctx.fillStyle = '#0000ff';
          ctx.fillRect(itemScreenX, itemScreenY, TILE_SIZE, TILE_SIZE);
        }
      })

      // Draw NPCs
      area.npcs.forEach((npc) => {
        const npcScreenX = (npc.x - viewportX) * TILE_SIZE;
        const npcScreenY = (npc.y - viewportY) * TILE_SIZE;

        if (
          npc.x >= viewportX &&
          npc.x < viewportX + VIEWPORT_WIDTH &&
          npc.y >= viewportY &&
          npc.y < viewportY + VIEWPORT_HEIGHT
        ) {
          ctx.fillStyle = "#00FF00"; // Green for NPC
          ctx.fillRect(npcScreenX, npcScreenY, TILE_SIZE, TILE_SIZE);
        }
      });

      // Draw player in the viewport
      ctx.fillStyle = "red";
      ctx.fillRect(
        (gameState.playerX - viewportX) * TILE_SIZE,
        (gameState.playerY - viewportY) * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    };

    const gameLoop = () => {
      render();
      requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        width: CANVAS_WIDTH * 2,
        height: CANVAS_HEIGHT * 2,
        imageRendering: "pixelated"
      }} />
  );
}
