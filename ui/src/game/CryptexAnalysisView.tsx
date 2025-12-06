import { useGame } from '../contexts/GameContext';

export const CryptexAnalysisView = () => {
  const { gameState } = useGame();
  const cryptexAnalysis = gameState.cryptexAnalysis;

  if (!cryptexAnalysis) return null;

  const sentenceData = cryptexAnalysis.sentences[0];
  console.log(sentenceData);

  return (
    <div style={{
      background: '#f9f9f9',
      padding: '10px',
      border: '2px solid black',
      maxWidth: '400px',
      marginTop: '10px'
    }}>
      <h3>Cryptex Analysis</h3>
      <p><strong>Original:</strong> {sentenceData.sourceSentence}</p>
      <p><strong>Translation:</strong> {sentenceData.translatedSentence}</p>

      <h4>Word Breakdown</h4>
      <ul>
        {sentenceData.words.map((word, index) => (
          <li key={index}>
            <strong>{word.word}</strong> [{word.transliteration}] ({word.partOfSpeech}) → <i>{word.baseForm}</i>
            <br />
            <span style={{ fontSize: '0.9em', color: '#555' }}>{word.definition}</span>
          </li>
        ))}
      </ul>

      {sentenceData.expressions.length > 0 && (
        <>
          <h4>Expressions</h4>
          <ul>
            {sentenceData.expressions.map((exp, index) => (
              <li key={index}>
                <strong>{exp.phrase}</strong> ({exp.type}) → <span style={{ fontSize: "0.9em", color: "#555" }}>{exp.definition}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h4>Sentence Structure</h4>
      <p><strong>Subject:</strong> {sentenceData.sentenceStructure.subject}</p>
      <p><strong>Verb:</strong> {sentenceData.sentenceStructure.verb}</p>
      {sentenceData.sentenceStructure.object && <p><strong>Object:</strong> {sentenceData.sentenceStructure.object}</p>}
      <p><strong>Tense:</strong> {sentenceData.sentenceStructure.tense}</p>

    </div>
  )
}
