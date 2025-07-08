
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import SegmentDefinitionModal from './SegmentDefinitionModal';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 30px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh; /* Limit height for scrolling */
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto; /* Enable scrolling for content */
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1em;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(145deg, #1DB954, #1ED760); /* Spotify Green */
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(145deg, #1ED760, #1DB954);
    transform: translateY(-2px);
  }
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TrackItem = styled.div`
  background: rgba(255, 255, 255, 0.08);
  padding: 15px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const TrackTitle = styled.span`
  font-weight: 600;
  font-size: 1.1em;
`;

const TrackArtist = styled.span`
  font-size: 0.9em;
  color: #bbb;
`;

const TrackActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(145deg, #007bff, #0056b3);
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: linear-gradient(145deg, #0056b3, #007bff);
    transform: translateY(-1px);
  }
`;

const CloseButton = styled(ActionButton)`
  background: linear-gradient(145deg, #dc3545, #c82333);
  &:hover {
    background: linear-gradient(145deg, #c82333, #dc3545);
  }
`;

const SpotifySearchModal = ({ accessToken, onClose, onSelectTrack, player, activeDeviceId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trackToDefineSegment, setTrackToDefineSegment] = useState(null); // New state for track to define segment

  const audioRef = useRef(null);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to fetch search results');
      }

      const data = await response.json();
      console.log('Spotify search results:', data.tracks.items);
      setSearchResults(data.tracks.items);
    } catch (err) {
      setError(err.message);
      console.error('Spotify search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (previewUrl) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (previewUrl) {
      audioRef.current = new Audio(previewUrl);
      audioRef.current.play().then(() => {
        console.log('Audio playback started.');
      }).catch(e => {
        console.error('Error playing audio:', e);
        alert('Error playing audio. Check console for details.');
      });
    } else {
      alert('No preview available for this track.');
      console.warn('No preview URL provided for this track.');
    }
  };

  const handleSelectForSegment = (track) => {
    setTrackToDefineSegment(track);
  };

  const handleSaveSegment = (track, start_ms, end_ms) => {
    onSelectTrack(track, start_ms, end_ms);
    setTrackToDefineSegment(null); // Close segment definition modal
    onClose(); // Close search modal
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Search Spotify Music</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <SearchInput
            type="text"
            placeholder="Search for songs or artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <SearchButton onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </SearchButton>
        </div>

        {error && <p style={{ color: '#dc3545' }}>Error: {error}</p>}

        <TrackList>
          {searchResults.length > 0 ? (
            searchResults.map((track) => (
              <TrackItem key={track.id}>
                <TrackInfo>
                  <TrackTitle>{track.name}</TrackTitle>
                  <TrackArtist>{track.artists.map((artist) => artist.name).join(', ')}</TrackArtist>
                  <span>Duration: {formatDuration(track.duration_ms)}</span>
                </TrackInfo>
                <TrackActions>
                  {track.preview_url && (
                    <ActionButton onClick={() => handlePreview(track.preview_url)}>
                      Preview
                    </ActionButton>
                  )}
                  <ActionButton onClick={() => handleSelectForSegment(track)}>
                    Set Segment
                  </ActionButton>
                </TrackActions>
              </TrackItem>
            ))
          ) : (
            !loading && !error && <p>No results. Try searching for something!</p>
          )}
        </TrackList>

        <CloseButton onClick={onClose}>Close</CloseButton>
      </ModalContent>

      {trackToDefineSegment && (
        <SegmentDefinitionModal
          track={trackToDefineSegment}
          accessToken={accessToken}
          player={player}
          activeDeviceId={activeDeviceId}
          onClose={() => setTrackToDefineSegment(null)}
          onSaveSegment={handleSaveSegment}
        />
      )}
    </ModalOverlay>
  );
};

export default SpotifySearchModal;
