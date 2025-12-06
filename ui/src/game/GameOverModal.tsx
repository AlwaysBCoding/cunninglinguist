import { useGame } from "../contexts/GameContext";

export const GameOverModal = () => {
  const { resetGame } = useGame();

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontSize: "24px"
    }}>
      <h1>GAME OVER</h1>
      <button
        onClick={resetGame}
        style={{ fontSize: "18px", padding: "10px 20px", marginTop: "20px" }}
      >
        Continue
      </button>
    </div>
  );
};
