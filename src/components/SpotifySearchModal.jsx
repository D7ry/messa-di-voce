// src/components/SpotifySearchModal.jsx
import React, { useState, useRef } from 'react';
import {
  ModalOverlay,
  ModalContent,
  SearchInput,
  SearchButton,
  TrackList,
  TrackItem,
  TrackInfo,
  TrackTitle,
  TrackArtist,
  TrackActions,
  ActionButton,
  CloseButton,
} from '../styles/StyledComponents';
import SegmentDefinitionModal from './SegmentDefinitionModal';

/**
 * SpotifySearchModal component for searching Spotify tracks and initiating segment definition.
 * Allows users to search for songs, preview them, and then select a track to define a musical segment.
 */
const SpotifySearchModal = ({ accessToken, onClose, onSelectTrack, player, activeDeviceId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // State to hold the track selected by the user for segment definition.
  const [trackToDefineSegment, setTrackToDefineSegment] = useState(null);

  // Ref for managing audio playback of track previews.
  const audioRef = useRef(null);

  /**
   * Handles the search functionality, fetching tracks from the Spotify API.
   */
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

  /**
   * Handles playing a short preview of a track.
   * Uses the `preview_url` provided by the Spotify API.
   */
  const handlePreview = (previewUrl) => {
    // Stop any currently playing audio before starting a new preview.
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

  /**
   * Sets the selected track for which the user wants to define a segment.
   * Opens the SegmentDefinitionModal.
   */
  const handleSelectForSegment = (track) => {
    setTrackToDefineSegment(track);
  };

  /**
   * Callback function passed to SegmentDefinitionModal to save the defined segment.
   * Closes both the segment definition modal and the search modal.
   */
  const handleSaveSegment = (track, start_ms, end_ms) => {
    onSelectTrack(track, start_ms, end_ms);
    setTrackToDefineSegment(null); // Close segment definition modal
    onClose(); // Close search modal
  };

  /**
   * Formats duration from milliseconds to a human-readable M:SS string.
   */
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

      {/* Render SegmentDefinitionModal if a track is selected for segment definition */}
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