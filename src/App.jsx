
import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

  body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #0a0a1a, #1a1a3a); /* Deeper, more vibrant gradient */
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 100vw;
    min-height: 100vh;
    overflow: hidden;
    color: white;
  }

  #root {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background: transparent; /* Handled by GlobalStyle */
  color: white;
  padding: 10px; /* Reduced padding for mobile */
  box-sizing: border-box;

  h1 {
    font-size: 2em; /* Smaller heading for mobile */
    margin-bottom: 15px;
  }

  @media (min-width: 768px) {
    padding: 20px;
    h1 {
      font-size: 3.2em; /* Original heading size for desktop */
      margin-bottom: 20px;
    }
  }
`;

const GlassMorphismCard = styled.div`
  background: rgba(255, 255, 255, 0.08); /* More subtle background */
  border-radius: 25px; /* Slightly more rounded */
  border: 1px solid rgba(255, 255, 255, 0.15); /* Thicker, more visible border */
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.4); /* Stronger shadow for depth */
  backdrop-filter: blur(15px) saturate(180%); /* Increased blur and saturation */
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  padding: 20px; /* Reduced padding for mobile */
  margin: 10px; /* Reduced margin for mobile */
  width: 98%; /* Wider for mobile */
  max-width: 1400px; /* Increased max-width */
  display: flex;
  flex-direction: column; /* Always column on mobile */
  gap: 15px; /* Reduced gap for mobile */

  @media (min-width: 768px) {
    padding: 30px;
    margin: 20px;
    width: 90%;
    flex-direction: row; /* Row on desktop */
    gap: 25px;
  }
`;

const Section = styled.div`
  flex: 1;
  padding: 15px; /* Reduced padding for mobile */
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.03); /* Very subtle background for sections */
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px; /* Reduced gap for mobile */
  transition: all 0.3s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  @media (min-width: 768px) {
    padding: 20px;
    gap: 12px;
  }
`;

const PiecesSection = styled(Section)`
  flex: 1; /* Full width on mobile */
  min-width: unset; /* Remove min-width on mobile */

  @media (min-width: 768px) {
    flex: 0.4; /* Smaller width for pieces */
    min-width: 250px;
  }
`;

const SegmentsSection = styled(Section)`
  flex: 1; /* Full width on mobile */

  @media (min-width: 768px) {
    flex: 1.6; /* Larger width for segments */
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4em; /* Smaller title for mobile */
  margin-bottom: 10px; /* Reduced margin for mobile */
  color: #e0e0e0;
  font-weight: 600;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.8em;
    margin-bottom: 15px;
  }
`;

const ListItem = styled.div`
  background: rgba(255, 255, 255, 0.07); /* Slightly more visible than section background */
  padding: 10px 12px; /* Reduced padding for mobile */
  border-radius: 10px;
  display: flex;
  flex-direction: column; /* Allow segment name and player to stack */
  align-items: flex-start; /* Align text to start */
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  @media (min-width: 768px) {
    padding: 12px 15px;
  }
`;

const SegmentName = styled.span`
  font-weight: 500;
  font-size: 1em; /* Smaller font for mobile */

  @media (min-width: 768px) {
    font-size: 1.1em;
  }
`;

const SegmentPlayer = styled.span`
  font-size: 0.8em; /* Smaller font for mobile */
  color: #bbb;
  margin-top: 3px; /* Reduced margin for mobile */

  @media (min-width: 768px) {
    font-size: 0.9em;
    margin-top: 4px;
  }
`;

const AddButton = styled.button`
  background: linear-gradient(145deg, #007bff, #0056b3); /* Blue gradient */
  color: white;
  padding: 10px 15px; /* Reduced padding for mobile */
  border-radius: 12px;
  font-size: 1em; /* Smaller font for mobile */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
  margin-top: 10px; /* Reduced margin for mobile */

  &:hover {
    background: linear-gradient(145deg, #0056b3, #007bff); /* Reverse gradient on hover */
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 10px rgba(0, 123, 255, 0.2);
  }

  @media (min-width: 768px) {
    padding: 12px 20px;
    font-size: 1.1em;
    margin-top: 15px;
  }
`;

function App() {
  const [pieces, setPieces] = useState([
    {
      id: 'p1',
      name: 'Beethoven - Moonlight Sonata',
      segments: [
        { id: 's1', name: '1st Movement - Adagio sostenuto (0:00-2:30)', player: 'Daniel Barenboim' },
        { id: 's2', name: '1st Movement - Adagio sostenuto (2:31-5:00)', player: 'Daniel Barenboim' },
        { id: 's3', name: '1st Movement - Adagio sostenuto (0:00-2:45)', player: 'Lang Lang' },
      ],
    },
    {
      id: 'p2',
      name: 'Chopin - Nocturne Op. 9 No. 2',
      segments: [
        { id: 's4', name: 'Main Theme (0:00-1:30)', player: 'Arthur Rubinstein' },
      ],
    },
  ]);

  const [selectedPiece, setSelectedPiece] = useState(pieces[0]); // Select first piece by default

  const handleAddPiece = () => {
    const newPieceName = prompt('Enter new piece name:');
    if (newPieceName) {
      setPieces([...pieces, { id: `p${Date.now()}`, name: newPieceName, segments: [] }]);
    }
  };

  const handleAddSegment = (pieceId) => {
    const newSegmentName = prompt('Enter new segment name (e.g., 0:00-1:30):');
    if (!newSegmentName) return;
    const newPlayerName = prompt('Enter player name for this segment:');
    if (!newPlayerName) return;

    setPieces(pieces.map(piece =>
      piece.id === pieceId
        ? { ...piece, segments: [...piece.segments, { id: `s${Date.now()}`, name: newSegmentName, player: newPlayerName }] }
        : piece
    ));

    // If the newly added segment belongs to the currently selected piece, update selectedPiece to re-render
    if (selectedPiece && selectedPiece.id === pieceId) {
      setSelectedPiece(prev => ({
        ...prev,
        segments: [...prev.segments, { id: `s${Date.now()}`, name: newSegmentName, player: newPlayerName }]
      }));
    }
  };

  return (
    <AppContainer>
      <GlobalStyle />
      <h1>Messa Di Voce</h1>
      <GlassMorphismCard>
        <PiecesSection>
          <SectionTitle>Pieces</SectionTitle>
          {pieces.map(piece => (
            <ListItem key={piece.id} onClick={() => setSelectedPiece(piece)}>
              {piece.name}
            </ListItem>
          ))}
          <AddButton onClick={handleAddPiece}>Add Piece</AddButton>
        </PiecesSection>

        <SegmentsSection>
          <SectionTitle>Segments for {selectedPiece ? selectedPiece.name : ''}</SectionTitle>
          {selectedPiece ? (
            <>
              {selectedPiece.segments.length > 0 ? (
                selectedPiece.segments.map(segment => (
                  <ListItem key={segment.id}>
                    <SegmentName>{segment.name}</SegmentName>
                    <SegmentPlayer>{segment.player}</SegmentPlayer>
                  </ListItem>
                ))
              ) : (
                <p>No segments for this piece yet. Add one!</p>
              )}
              <AddButton onClick={() => handleAddSegment(selectedPiece.id)}>Add Segment</AddButton>
            </>
          ) : (
            <p>Select a piece to view and add segments.</p>
          )}
        </SegmentsSection>
      </GlassMorphismCard>
    </AppContainer>
  );
}

export default App;
