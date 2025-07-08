
import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { redirectToAuthCodeFlow, getAccessToken, getStoredAccessToken, refreshAccessToken } from './spotifyAuth';
import SpotifySearchModal from './SpotifySearchModal';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

  body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #0a0a1a, #1a1a3a); /* Deeper, more vibrant gradient */
    margin: 0;
    color: white;
  }

  #root {
    width: 100%;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh; /* Ensure it takes full viewport height */
  width: 100%;
  background: rgba(255, 255, 255, 0.08); /* Moved from GlassMorphismCard */
  border-radius: 25px; /* Moved from GlassMorphismCard */
  border: 1px solid rgba(255, 255, 255, 0.15); /* Moved from GlassMorphismCard */
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.4); /* Stronger shadow for depth */
  backdrop-filter: blur(15px) saturate(180%); /* Increased blur and saturation */
  -webkit-backdrop-filter: blur(15px) saturate(180%); /* Moved from GlassMorphismCard */
  padding: 20px; /* Reduced padding for mobile */
  margin: 20px auto; /* Center horizontally, add vertical margin */
  max-width: 600px; /* Max width for single column */
  box-sizing: border-box;
  overflow-y: auto; /* Allow AppContainer to scroll */
  color: white;
  gap: 15px; /* Reduced gap for mobile */

  h1 {
    font-size: 2em; /* Smaller heading for mobile */
    margin-bottom: 15px;
    text-align: center;
  }

  @media (min-width: 768px) {
    padding: 30px;
    max-width: 800px; /* Slightly wider for desktop single column */
    gap: 25px;
    h1 {
      font-size: 3.2em; /* Original heading size for desktop */
      margin-bottom: 20px;
    }
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
  max-height: 60vh; /* Allow scrolling within section */
  overflow-y: auto; /* Enable vertical scrolling */

  /* Custom scrollbar for a sleek look */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  @media (min-width: 768px) {
    padding: 20px;
    gap: 12px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  gap: 10px; /* Space between items */
`;

const SectionTitle = styled.h2`
  font-size: 1.4em; /* Smaller title for mobile */
  color: #e0e0e0;
  font-weight: 600;
  margin: 0; /* Remove default margin */

  @media (min-width: 768px) {
    font-size: 1.8em;
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

const ActionButton = styled.button`
  background: linear-gradient(145deg, #007bff, #0056b3); /* Blue gradient */
  color: white;
  padding: 10px 15px; /* Reduced padding for mobile */
  border-radius: 12px;
  font-size: 0.9em; /* Smaller font for mobile */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);

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
  }
`;

const PlayButton = styled(ActionButton)`
  background: linear-gradient(145deg, #1DB954, #1ED760); /* Spotify Green */
  &:hover {
    background: linear-gradient(145deg, #1ED760, #1DB954);
  }
`;

const BackButton = styled(ActionButton)`
  background: linear-gradient(145deg, #6c757d, #5a6268); /* Grey gradient for back button */
  &:hover {
    background: linear-gradient(145deg, #5a6268, #6c757d);
  }
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0a0a1a, #1a1a3a);
  color: white;
  font-family: 'Inter', sans-serif;

  h2 {
    margin-bottom: 20px;
  }
`;

function App() {
  const [pieces, setPieces] = useState([
    {
      id: 'p1',
      name: 'Beethoven - Moonlight Sonata',
      segments: [
        { id: 's1', name: '1st Movement - Adagio sostenuto (0:00-2:30)', player: 'Daniel Barenboim', spotifyUri: 'spotify:track:2FGXq5S6zJm0gJ4L4L4L4L', duration_ms: 300000, start_ms: 0, end_ms: 30000 },
        { id: 's2', name: '1st Movement - Adagio sostenuto (2:31-5:00)', player: 'Daniel Barenboim', spotifyUri: 'spotify:track:2FGXq5S6zJm0gJ4L4L4L4L', duration_ms: 300000, start_ms: 151000, end_ms: 300000 },
        { id: 's3', name: '1st Movement - Adagio sostenuto (0:00-2:45)', player: 'Lang Lang', spotifyUri: 'spotify:track:2FGXq5S6zJm0gJ4L4L4L4L', duration_ms: 300000, start_ms: 0, end_ms: 165000 },
      ],
    },
    {
      id: 'p2',
      name: 'Chopin - Nocturne Op. 9 No. 2',
      segments: [
        { id: 's4', name: 'Main Theme (0:00-1:30)', player: 'Arthur Rubinstein', spotifyUri: 'spotify:track:1sI7YI4L4L4L4L4L4L', duration_ms: 180000, start_ms: 0, end_ms: 90000 },
      ],
    },
  ]);

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [player, setPlayer] = useState(null);
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  useEffect(() => {
    async function handleAuth() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        const token = await getAccessToken(code);
        setAccessToken(token);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        const storedToken = getStoredAccessToken();
        if (storedToken) {
          setAccessToken(storedToken);
        }
      }
    }
    handleAuth();
  }, []);

  useEffect(() => {
    if (accessToken) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Messa Di Voce Web Playback SDK',
          getOAuthToken: cb => { cb(accessToken); },
          volume: 0.5
        });

        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setActiveDeviceId(device_id);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize', message);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('Authentication error', message);
          setAccessToken(null); // Clear token on auth error
          alert('Spotify authentication failed. Please log in again.');
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Account error', message);
          alert('Spotify account error. Do you have Premium?');
        });

        player.connect();
        setPlayer(player);
      };

      // If SDK is already loaded (e.g., hot reload), manually trigger ready
      if (window.Spotify) {
        window.onSpotifyWebPlaybackSDKReady();
      }
    }
  }, [accessToken]);

  const handleAddPiece = () => {
    const newPieceName = prompt('Enter new piece name:');
    if (newPieceName) {
      setPieces([...pieces, { id: `p${Date.now()}`, name: newPieceName, segments: [] }]);
    }
  };

  const handleAddSegmentClick = () => {
    if (!accessToken) {
      alert('Please log in to Spotify to add segments.');
      return;
    }
    setShowSearchModal(true);
  };

  const handleSelectTrack = (track, start_ms, end_ms) => {
    setShowSearchModal(false);
    if (!selectedPiece) return; 

    const newSegmentName = `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
    const newPlayerName = track.artists.map(a => a.name).join(', '); 

    setPieces(pieces.map(piece =>
      piece.id === selectedPiece.id
        ? { ...piece, segments: [...piece.segments, { id: `s${Date.now()}`, name: newSegmentName, player: newPlayerName, spotifyUri: track.uri, duration_ms: track.duration_ms, start_ms: start_ms, end_ms: end_ms }] }
        : piece
    ));

    setSelectedPiece(prev => ({
      ...prev,
      segments: [...prev.segments, { id: `s${Date.now()}`, name: newSegmentName, player: newPlayerName, spotifyUri: track.uri, duration_ms: track.duration_ms, start_ms: start_ms, end_ms: end_ms }]
    }));
  };

  const handlePlaySegment = async (segment) => {
    if (!player || !activeDeviceId || !accessToken) {
      alert('Spotify player not ready. Please ensure you are logged in and have Spotify Premium.');
      return;
    }

    try {
      // Transfer playback to our device
      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          device_ids: [activeDeviceId],
          play: false, // Don't start playing immediately
        }),
      });

      // Play the track from the specified position
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDeviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          uris: [segment.spotifyUri],
          position_ms: segment.start_ms || 0,
        }),
      });

      // If an end_ms is defined, stop playback after that duration
      if (segment.end_ms && segment.end_ms > segment.start_ms) {
        const duration = segment.end_ms - segment.start_ms;
        setTimeout(() => {
          player.pause();
        }, duration);
      }

    } catch (error) {
      console.error('Error playing segment:', error);
      alert('Failed to play segment. Check console for details. Ensure Spotify is open and playing on this device.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_token_expires_at');
    setAccessToken(null);
    if (player) {
      player.disconnect();
    }
  };

  return (
    <AppContainer>
      <GlobalStyle />
      <h1>Messa Di Voce</h1>
      <ActionButton onClick={handleLogout} style={{ marginBottom: '20px' }}>Logout</ActionButton>
      {!selectedPiece ? (
        <Section>
          <SectionHeader>
            <SectionTitle>Pieces</SectionTitle>
            <ActionButton onClick={handleAddPiece}>Add Piece</ActionButton>
          </SectionHeader>
          {pieces.map(piece => (
            <ListItem key={piece.id} onClick={() => setSelectedPiece(piece)}>
              {piece.name}
            </ListItem>
          ))}
        </Section>
      ) : (
        <Section>
          <SectionHeader>
            <SectionTitle>Segments for {selectedPiece.name}</SectionTitle>
            <ActionButton onClick={handleAddSegmentClick}>Add Segment</ActionButton>
            <BackButton onClick={() => setSelectedPiece(null)}>Back to Pieces</BackButton>
          </SectionHeader>
          {selectedPiece.segments.length > 0 ? (
            selectedPiece.segments.map(segment => (
              <ListItem key={segment.id}>
                <SegmentName>{segment.name}</SegmentName>
                <SegmentPlayer>{segment.player}</SegmentPlayer>
                {segment.spotifyUri && (
                  <PlayButton onClick={() => handlePlaySegment(segment)}>
                    Play Segment
                  </PlayButton>
                )}
              </ListItem>
            ))
          ) : (
            <p>No segments for this piece yet. Add one!</p>
          )}
        </Section>
      )}
      {showSearchModal && (
        <SpotifySearchModal
          accessToken={accessToken}
          onClose={() => setShowSearchModal(false)}
          onSelectTrack={handleSelectTrack}
          player={player}
          activeDeviceId={activeDeviceId}
        />
      )}
    </AppContainer>
  );
}

export default App;
