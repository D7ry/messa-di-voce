
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

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
  z-index: 1001; /* Higher z-index than search modal */
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
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
`;

const TimeInputGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;

  input {
    width: 50px;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 0.9em;
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

const PreviewButton = styled(ActionButton)`
  background: linear-gradient(145deg, #1DB954, #1ED760); /* Spotify Green */
  &:hover {
    background: linear-gradient(145deg, #1ED760, #1DB954);
  }
`;

const SliderContainer = styled.div`
  width: 100%;
  margin-top: 20px;
  position: relative;
  height: 40px; /* Give some height for the slider */
`;

const RangeSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
  }
`;

const SegmentRange = styled.div`
  position: absolute;
  height: 8px;
  background: linear-gradient(90deg, #1DB954, #1ED760); /* Highlighted segment */
  border-radius: 5px;
  top: 16px; /* Align with slider track */
  pointer-events: none; /* Allow interaction with slider underneath */
`;

const SegmentDefinitionModal = ({ track, accessToken, onClose, onSaveSegment, player, activeDeviceId }) => {
  const [startMs, setStartMs] = useState(0);
  const [endMs, setEndMs] = useState(0);

  const audioRef = useRef(null);

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

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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
        player.pause();
      }, duration);

    } catch (error) {
      console.error('Error playing segment preview:', error);
      alert('Failed to play segment preview. Check console for details. Ensure Spotify is open and playing on this device.');
    }
  };

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

  const handleStartSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setStartMs(value);
  };

  const handleEndSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setEndMs(value);
  };

  // Sync numerical inputs with slider values
  const handleStartTimeChange = (unit, value) => {
    let newMs = 0;
    if (unit === 'minutes') {
      newMs = (value * 60 + Math.floor((startMs % 60000) / 1000)) * 1000;
    } else {
      newMs = (Math.floor(startMs / 60000) * 60 + value) * 1000;
    }
    setStartMs(newMs);
  };

  const handleEndTimeChange = (unit, value) => {
    let newMs = 0;
    if (unit === 'minutes') {
      newMs = (value * 60 + Math.floor((endMs % 60000) / 1000)) * 1000;
    } else {
      newMs = (Math.floor(endMs / 60000) * 60 + value) * 1000;
    }
    setEndMs(newMs);
  };

  const startMinutes = Math.floor(startMs / 60000);
  const startSeconds = Math.floor((startMs % 60000) / 1000);
  const endMinutes = Math.floor(endMs / 60000);
  const endSeconds = Math.floor((endMs % 60000) / 1000);

  const segmentWidth = ((endMs - startMs) / track.duration_ms) * 100;
  const segmentLeft = (startMs / track.duration_ms) * 100;

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

        <SliderContainer>
          <SegmentRange style={{ left: `${segmentLeft}%`, width: `${segmentWidth}%` }} />
          <RangeSlider
            type="range"
            min="0"
            max={track.duration_ms}
            value={startMs}
            onChange={handleStartSliderChange}
          />
          <RangeSlider
            type="range"
            min="0"
            max={track.duration_ms}
            value={endMs}
            onChange={handleEndSliderChange}
          />
        </SliderContainer>

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
