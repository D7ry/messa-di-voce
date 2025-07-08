
// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import GlobalStyle from './styles/GlobalStyles';
import {
  AppContainer,
  Section,
  SectionHeader,
  SectionTitle,
  ListItem,
  SegmentName,
  SegmentPlayer,
  ActionButton,
  PlayButton,
  BackButton,
  LoginContainer,
  UserProfileImage,
  LogoutPopup,
} from './styles/StyledComponents';
import { redirectToAuthCodeFlow, getAccessToken, getStoredAccessToken } from './spotifyAuth';
import SpotifySearchModal from './components/SpotifySearchModal';

/**
 * Main application component for Messa Di Voce.
 * Manages authentication, piece and segment data, and modal visibility.
 */
function App() {
  // State to hold the list of musical practice sets and their segments.
  const [practiceSets, setPracticeSets] = useState(() => {
    const storedPracticeSets = localStorage.getItem('practiceSets');
    return storedPracticeSets ? JSON.parse(storedPracticeSets) : [
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
    ];
  });

  // State to keep track of the currently selected piece for segment viewing.
  const [selectedPiece, setSelectedPiece] = useState(null);
  // State to store the Spotify access token.
  const [accessToken, setAccessToken] = useState(null);
  // State to control the visibility of the Spotify search modal.
  const [showSearchModal, setShowSearchModal] = useState(false);
  // State to hold the Spotify Web Playback SDK player instance.
  const [player, setPlayer] = useState(null);
  // State to store the active Spotify device ID for playback.
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const loopTimeoutRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showLogoutButton, setShowLogoutButton] = useState(false);

  // Effect hook to handle Spotify authentication on component mount.
  useEffect(() => {
    async function handleAuth() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        // If a code is present in the URL, exchange it for an access token.
        const token = await getAccessToken(code);
        setAccessToken(token);
        // Clear the code from the URL to prevent re-processing on refresh.
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // If no code, try to retrieve a stored access token.
        const storedToken = getStoredAccessToken();
        if (storedToken) {
          setAccessToken(storedToken);
        }
      }
    }
    handleAuth();
  }, []); // Run only once on component mount.

  // Define onSpotifyWebPlaybackSDKReady globally and immediately
  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (accessToken) {
        const player = new window.Spotify.Player({
          name: 'Messa Di Voce Web Playback SDK',
          getOAuthToken: cb => { cb(accessToken); },
          volume: 0.5
        });

        // Add event listeners for player state changes and errors.
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

        // Connect to the Spotify player.
        player.connect();
        setPlayer(player);
      } else {
        console.log('Access token not available, Spotify Player not initialized.');
      }
    };

    // If SDK is already loaded (e.g., hot reload), manually trigger ready
    if (window.Spotify && accessToken) {
      window.onSpotifyWebPlaybackSDKReady();
    }
  }, [accessToken]); // Re-run when accessToken changes.

  useEffect(() => {
    async function fetchProfile() {
      if (!accessToken) return;
      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      }
    }
    fetchProfile();
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('practiceSets', JSON.stringify(practiceSets));
  }, [practiceSets]);

  /**
   * Handles adding a new musical piece to the list.
   * Prompts the user for a piece name.
   */
  const handleAddPiece = () => {
    const newPieceName = prompt('Enter new piece name:');
    if (newPieceName) {
      setPracticeSets([...practiceSets, { id: `p${Date.now()}`, name: newPieceName, segments: [] }]);
    }
  };

  /**
   * Opens the Spotify search modal to allow adding a new segment.
   * Requires an active Spotify access token.
   */
  const handleAddSegmentClick = () => {
    if (!accessToken) {
      alert('Please log in to Spotify to add segments.');
      return;
    }
    if (!selectedPiece) {
      alert('Please select a Practice Set first.');
      return;
    }
    setShowSearchModal(true);
  };

  /**
   * Callback function from SpotifySearchModal when a track is selected and segment defined.
   * Adds the new segment to the currently selected piece.
   * @param {object} track - The selected Spotify track object.
   * @param {number} start_ms - The start time of the segment in milliseconds.
   * @param {number} end_ms - The end time of the segment in milliseconds.
   */
  const handleSelectTrack = (track, start_ms, end_ms) => {
    setShowSearchModal(false); // Close the search modal.
    if (!selectedPiece) return; // Should not happen if modal is opened from segments view.

    const newSegmentName = `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
    const newPlayerName = track.artists.map(a => a.name).join(', ');
    const newSegmentId = `s${Date.now()}`;
    const newSegment = { id: newSegmentId, name: newSegmentName, player: newPlayerName, spotifyUri: track.uri, duration_ms: track.duration_ms, start_ms: start_ms, end_ms: end_ms };

    // Update the pieces state with the new segment.
    setPracticeSets(practiceSets.map(practiceSet =>
      practiceSet.id === selectedPiece.id
        ? { ...practiceSet, segments: [...practiceSet.segments, newSegment] }
        : practiceSet
    ));

    // Update the selectedPiece state to trigger re-render of the segments list.
    setSelectedPiece(prev => ({
      ...prev,
      segments: [...prev.segments, newSegment]
    }));
  };

  /**
   * Handles playing a specific segment using the Spotify Web Playback SDK.
   * Transfers playback to the browser device and plays the track from the segment's start time.
   * @param {object} segment - The segment object to play.
   */
  const handlePlaySegment = async (segment) => {
    if (!player || !activeDeviceId || !accessToken) {
      alert('Spotify player not ready. Please ensure you are logged in and have Spotify Premium.');
      return;
    }

    try {
      // Transfer playback to our device.
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

      // Play the track from the specified position.
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

      // Stop playback after the segment duration.
      const duration = segment.end_ms - segment.start_ms;
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      loopTimeoutRef.current = setTimeout(() => {
        if (player) {
          player.pause();
        }
      }, duration);

      

    } catch (error) {
      console.error('Error playing segment:', error);
      alert('Failed to play segment. Check console for details. Ensure Spotify is open and playing on this device.');
    }
  };

  /**
   * Handles logging out from Spotify.
   * Clears stored tokens and disconnects the Spotify player.
   */
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

  // Conditional rendering based on authentication status.
  if (!accessToken) {
    return (
      <LoginContainer>
        <GlobalStyle />
        <h1>Messa Di Voce</h1>
        <h2>Connect to Spotify</h2>
        <ActionButton onClick={redirectToAuthCodeFlow}>Login with Spotify</ActionButton>
      </LoginContainer>
    );
  }

  return (
    <AppContainer>
      <GlobalStyle />
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {userProfile && userProfile.display_name && (
          <span style={{ color: 'white', fontSize: '1.1em', fontWeight: 'bold' }}>
            {userProfile.display_name}
          </span>
        )}
        <div style={{ position: 'relative' }}>
          <UserProfileImage
            src={userProfile && userProfile.images && userProfile.images.length > 0 ? userProfile.images[0].url : '/vite.svg'}
            alt="User Profile"
            onClick={() => setShowLogoutButton(!showLogoutButton)}
          />
          {showLogoutButton && (
            <LogoutPopup>
              <ActionButton onClick={handleLogout}>Logout</ActionButton>
            </LogoutPopup>
          )}
        </div>
      </div>
      <h1>Messa Di Voce</h1>
      {/* Conditionally render Pieces or Segments section based on selectedPiece state */}
      {!selectedPiece ? (
        <Section>
          <SectionHeader>
            <SectionTitle>Practice Sets</SectionTitle>
            <ActionButton onClick={handleAddPiece}>+</ActionButton>
          </SectionHeader>
          {practiceSets.map(practiceSet => (
            <ListItem key={practiceSet.id} onClick={() => setSelectedPiece(practiceSet)}>
              {practiceSet.name}
            </ListItem>
          ))}
        </Section>
      ) : (
        <Section>
          <SectionHeader>
            <SectionTitle>Segments for {selectedPiece.name}</SectionTitle>
            <ActionButton onClick={handleAddSegmentClick}>Add Segment</ActionButton>
            <BackButton onClick={() => setSelectedPiece(null)}>Back to Practice Sets</BackButton>
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
      {/* Render SpotifySearchModal if showSearchModal state is true */}
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
