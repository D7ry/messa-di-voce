
// src/components/SegmentDefinitionModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  ModalOverlay,
  ModalContent,
  TimeInputGroup,
  ActionButton,
  CloseButton,
  PreviewButton,
} from '../styles/StyledComponents';

/**
 * SegmentDefinitionModal component for defining start and end times of a musical segment.
 * It provides numerical inputs for precise segment selection.
 */
const SegmentDefinitionModal = ({ track, accessToken, onClose, onSaveSegment, player, activeDeviceId }) => {
  // State for the start and end milliseconds of the segment.
  const [startMs, setStartMs] = useState(0);
  const [endMs, setEndMs] = useState(0);

  // Ref for managing audio playback of the segment preview.
  const audioRef = useRef(null);

  /**
   * Initializes start and end times when the modal opens or the track changes.
   * Also handles cleanup of any ongoing audio playback when the modal closes.
   */
  useEffect(() => {
    // Initialize start and end times based on track duration when modal opens
    setStartMs(0);
    setEndMs(track.duration_ms);

    return () => {
      // Stop any ongoing preview when modal closes
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [track]);

  /**
   * Formats duration from milliseconds to a human-readable M:SS string.
   * @param {number} ms - Duration in milliseconds.
   * @returns {string} Formatted duration string (e.g., "3:45").
   */
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  /**
   * Handles playing a preview of the defined segment using the Spotify Web Playback SDK.
   */
  const handlePreviewSegment = async () => {
    if (!player || !activeDeviceId || !accessToken) {
      alert('Spotify player not ready. Please ensure you are logged in and have Spotify Premium.');
      return;
    }

    if (startMs >= endMs) {
      alert('End time must be greater than start time for preview.');
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
          uris: [track.uri],
          position_ms: startMs,
        }),
      });

      // Stop playback after the segment duration
      const duration = endMs - startMs;
      setTimeout(() => {
        if (player) {
          player.pause();
        }
      }, duration);

    } catch (error) {
      console.error('Error playing segment preview:', error);
      alert('Failed to play segment preview. Check console for details. Ensure Spotify is open and playing on this device.');
    }
  };

  /**
   * Handles saving the defined segment and closing the modal.
   * Performs validation before saving.
   */
  const handleSave = () => {
    if (startMs >= endMs) {
      alert('End time must be greater than start time.');
      return;
    }
    if (endMs > track.duration_ms) {
      alert('End time cannot exceed track duration.');
      return;
    }

    onSaveSegment(track, startMs, endMs);
    onClose(); // Close modal after saving
  };

  

  /**
   * Synchronizes numerical input changes with the internal startMs state.
   * @param {string} unit - 'minutes' or 'seconds'.
   * @param {number} value - The new numerical value.
   */
  const handleStartTimeChange = (unit, value) => {
    let currentMinutes = Math.floor(startMs / 60000);
    let currentSeconds = Math.floor((startMs % 60000) / 1000);
    let newMinutes = currentMinutes;
    let newSeconds = currentSeconds;

    if (unit === 'minutes') {
      newMinutes = parseInt(value, 10) || 0;
    } else { // unit === 'seconds'
      newSeconds = parseInt(value, 10) || 0;
      // Handle rollover for seconds
      if (newSeconds >= 60) {
        newMinutes += Math.floor(newSeconds / 60);
        newSeconds %= 60;
      } else if (newSeconds < 0) { // Handle negative input
        newMinutes += Math.floor(newSeconds / 60); // Will be negative or zero
        newSeconds = (newSeconds % 60 + 60) % 60; // Ensure positive remainder
      }
    }
    const newTotalMs = (newMinutes * 60 + newSeconds) * 1000;
    setStartMs(Math.min(newTotalMs, endMs)); // Ensure startMs <= endMs
  };

  /**
   * Synchronizes numerical input changes with the internal endMs state.
   * @param {string} unit - 'minutes' or 'seconds'.
   * @param {number} value - The new numerical value.
   */
  const handleEndTimeChange = (unit, value) => {
    let currentMinutes = Math.floor(endMs / 60000);
    let currentSeconds = Math.floor((endMs % 60000) / 1000);
    let newMinutes = currentMinutes;
    let newSeconds = currentSeconds;

    if (unit === 'minutes') {
      newMinutes = parseInt(value, 10) || 0;
    } else { // unit === 'seconds'
      newSeconds = parseInt(value, 10) || 0;
      // Handle rollover for seconds
      if (newSeconds >= 60) {
        newMinutes += Math.floor(newSeconds / 60);
        newSeconds %= 60;
      } else if (newSeconds < 0) {
        newMinutes += Math.floor(newSeconds / 60);
        newSeconds = (newSeconds % 60 + 60) % 60;
      }
    }
    const newTotalMs = (newMinutes * 60 + newSeconds) * 1000;
    setEndMs(Math.max(newTotalMs, startMs)); // Ensure endMs >= startMs
  };

  // Derived state for displaying minutes and seconds in input fields.
  const startMinutes = Math.floor(startMs / 60000);
  const startSeconds = Math.floor((startMs % 60000) / 1000);
  const endMinutes = Math.floor(endMs / 60000);
  const endSeconds = Math.floor((endMs % 60000) / 1000);

  

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>Define Segment for:</h2>
        <h3>{track.name}</h3>
        <p>Artist: {track.artists.map(a => a.name).join(', ')}</p>
        <p>Full Duration: {formatDuration(track.duration_ms)}</p>

        <TimeInputGroup>
          <span>Start:</span>
          <input
            type="number"
            min="0"
            value={startMinutes}
            onChange={(e) => handleStartTimeChange('minutes', parseInt(e.target.value) || 0)}
          />
          <span>min</span>
          <input
            type="number"
            min="0"
            max="59"
            value={startSeconds}
            onChange={(e) => handleStartTimeChange('seconds', parseInt(e.target.value) || 0)}
          />
          <span>sec</span>
        </TimeInputGroup>

        <TimeInputGroup>
          <span>End:</span>
          <input
            type="number"
            min="0"
            value={endMinutes}
            onChange={(e) => handleEndTimeChange('minutes', parseInt(e.target.value) || 0)}
          />
          <span>min</span>
          <input
            type="number"
            min="0"
            max="59"
            value={endSeconds}
            onChange={(e) => handleEndTimeChange('seconds', parseInt(e.target.value) || 0)}
          />
          <span>sec</span>
        </TimeInputGroup>

        

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <PreviewButton onClick={handlePreviewSegment}>Preview Segment</PreviewButton>
          <ActionButton onClick={handleSave}>Save Segment</ActionButton>
          <CloseButton onClick={onClose}>Cancel</CloseButton>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SegmentDefinitionModal;
