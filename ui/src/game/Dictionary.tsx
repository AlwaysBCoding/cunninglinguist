import { useState } from 'react';
import { useDictionary } from '../hooks/useDictionary';
import { Dictionary, DictionaryEntry } from '../types/Dictionary';

export const DictionaryComponent = () => {
  const { dictionary } = useDictionary();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'source' | 'target' | 'transliteration'>('source');

  const groupedWords: Record<string, DictionaryEntry[]> = {};
  Object.values(dictionary).forEach((entry) => {
    entry.definitions.forEach((def) => {
      if (!groupedWords[def.partOfSpeech]) {
        groupedWords[def.partOfSpeech] = [];
      }
      groupedWords[def.partOfSpeech].push(entry);
    })
  })

  Object.keys(groupedWords).forEach((pos) => {
    groupedWords[pos] = groupedWords[pos].sort((a, b) => {
      const countA = a.definitions.find((d) => d.partOfSpeech === pos)?.seenCount || 0;
      const countB = b.definitions.find((d) => d.partOfSpeech === pos)?.seenCount || 0;
      return countB - countA;
    })
  })

  return (
    <div style={{ position: "absolute", right: "20px", top: "20px", width: "300px", backgroundColor: "white", border: "1px solid black", padding: "10px" }}>
      <h3>📖 Dictionary</h3>

      {/* 🔍 Search Bar + Toggle */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder={`Search (${searchMode})...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
          <label>
            <input
              type="radio"
              name="searchMode"
              checked={searchMode === "source"}
              onChange={() => setSearchMode("source")}
            />
            Source
          </label>
          <label>
            <input
              type="radio"
              name="searchMode"
              checked={searchMode === "target"}
              onChange={() => setSearchMode("target")}
            />
            Target
          </label>
          <label>
            <input
              type="radio"
              name="searchMode"
              checked={searchMode === "transliteration"}
              onChange={() => setSearchMode("transliteration")}
            />
            Transliteration
          </label>
        </div>
      </div>

      {/* 📂 Accordion for Parts of Speech */}
      {Object.entries(groupedWords).map(([partOfSpeech, words]) => (
        <div key={partOfSpeech} style={{ marginBottom: "10px" }}>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              fontWeight: "bold",
              cursor: "pointer",
              padding: "5px",
              backgroundColor: expandedSection === partOfSpeech ? "#ddd" : "#f4f4f4",
              border: "1px solid black"
            }}
            onClick={() => setExpandedSection(expandedSection === partOfSpeech ? null : partOfSpeech)}
          >
            {expandedSection === partOfSpeech ? "▼" : "▶"} {partOfSpeech} ({words.length})
          </button>

          {expandedSection === partOfSpeech && (
            <ul style={{ listStyleType: "none", padding: "5px", margin: 0 }}>
              {words.map((entry) => {
                const definition = entry.definitions.find((d) => d.partOfSpeech === partOfSpeech)?.definition || "No definition available";
                return (
                  <li key={entry.word} style={{ padding: "3px 0" }}>
                    <strong>{entry.word} [{entry.transliteration}]</strong>: {definition}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

}
