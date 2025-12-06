import areas from './Areas';
import { useGame } from "../contexts/GameContext";

export const GameMenu = () => {
  const {
    menuOpen,
    activeSubmenu,
    selectedOption,
    selectedArea,
    gameState,
    saveGameState,
    dictionary,
  } = useGame();

  if (!menuOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ background: "white", padding: "20px", textAlign: "center" }}>
        {activeSubmenu === "MAP" && (
          <>
            <h2>Select Area</h2>
            {areas.map((area, index) => (
              <div key={area.id} style={{ color: selectedArea === index ? "blue" : "black" }}>
                {area.id}
              </div>
            ))}
          </>
        )}
        {activeSubmenu === "ITEMS" && (
          <>
            <h2>Inventory</h2>
            {gameState.player.inventory.length > 0 ? (
              gameState.player.inventory.map((item, index) => (
                <div
                  key={index}
                  style={{
                    color: selectedOption === index ? "blue" : "black",
                    cursor: item.consumable ? "pointer" : "default"
                  }}
                >
                  {item.name} x{item.quantity} {item.consumable ? "(Consumable)" : ""}
                  <span style={{ marginLeft: "10px", fontSize: "0.8em", color: "#777" }}>
                    {selectedOption === index ? "[Press X to Drop]" : ""}
                  </span>
                </div>
              ))
            ) : (
              <p>No items in inventory.</p>
            )}
          </>
        )}
        {activeSubmenu === "PLAYER" && (
          <>
            <h2>Player Info</h2>
            <p>Name: {gameState.player.name}</p>
            <p>Money: ${gameState.player.money}</p>
            <p>Rizz: {gameState.player.rizz}</p>
          </>
        )}
        {activeSubmenu === "DICTIONARY" && (
          <>
            <h2>Dictionary</h2>
            {Object.keys(dictionary).length > 0 ? (
              Object.entries(dictionary).map(([word, entry]) => (
                <div key={word} style={{ marginBottom: "10px" }}>
                  <strong>{word}</strong> ({entry.definitions.length} meanings)
                  {entry.definitions.map((def, index) => (
                    <div key={index} style={{ fontSize: "0.9em", marginLeft: "10px" }}>
                      <em>{def.partOfSpeech}</em>: {def.definition} <br />
                      <span style={{ fontSize: "0.8em", color: "#555" }}>
                        Seen: {def.seenCount} times
                      </span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No words discovered yet.</p>
            )}
          </>
        )}
        {activeSubmenu === "SAVE" && (
          <>
            <h2>Would you like to save the game?</h2>
            <div style={{ color: selectedOption === 0 ? "blue" : "black" }}>YES</div>
            <div style={{ color: selectedOption === 1 ? "blue" : "black" }}>NO</div>
          </>
        )}
        {!activeSubmenu && (
          <>
            <h2>Menu</h2>
            <div style={{ color: selectedOption === 0 ? "blue" : "black" }}>MAP</div>
            <div style={{ color: selectedOption === 1 ? "blue" : "black" }}>ITEMS</div>
            <div style={{ color: selectedOption === 2 ? "blue" : "black" }}>PLAYER</div>
            <div style={{ color: selectedOption === 3 ? "blue" : "black" }}>DICTIONARY</div>
            <div style={{ color: selectedOption === 4 ? "blue" : "black" }}>SAVE</div>
            <div style={{ color: selectedOption === 5 ? "blue" : "black" }}>EXIT</div>
          </>
        )}
      </div>
    </div>
  );
};
