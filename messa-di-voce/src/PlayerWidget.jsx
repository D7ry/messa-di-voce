
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.15); /* Glassmorphism background */
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  z-index: 1000;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right: 20px;

  @media (max-width: 768px) {
    margin-right: 0;
    text-align: center;
  }
`;

const TrackTitle = styled.span`
  font-weight: 600;
  font-size: 1.1em;
`;

const TrackArtist = styled.span`
  font-size: 0.9em;
  color: #bbb;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const ControlButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LoopButton = styled(ControlButton)`
  background: ${props => props.isLooping ? 'linear-gradient(145deg, #1DB954, #1ED760)' : 'rgba(255, 255, 255, 0.1)'};
  border-color: ${props => props.isLooping ? '#1ED760' : 'rgba(255, 255, 255, 0.2)'};
`;

const PlayerWidget = ({ player, activeDeviceId, accessToken, currentSegment, isLooping, onLoopToggle, onPlayPause }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!player) return;

    const handleStateChange = (state) => {
      if (state) {
        setIsPlaying(!state.paused);
      }
    };

    player.addListener('player_state_changed', handleStateChange);

    // Initial state check
    player.getCurrentState().then(state => {
      if (state) {
        setIsPlaying(!state.paused);
      }
    });

    return () => {
      player.removeListener('player_state_changed', handleStateChange);
    };
  }, [player]);

  const handlePlayPauseClick = async () => {
    if (!player || !currentSegment) return;

    if (isPlaying) {
      await player.pause();
    } else {
      // If not playing, and a segment is selected, play it
      // This logic is duplicated from App.jsx for simplicity, but ideally should be centralized
      try {
        await fetch(`https://api.spotify.com/v1/me/player`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON_STRINGIFY_PLAYBACK_TRANSFER_BODY
        });

        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDeviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON_STRINGIFY_PLAY_BODY
        });
      } catch (error) {
        console.error('Error controlling playback from widget:', error);
        alert('Failed to control playback. Ensure Spotify is open and playing on this device.');
      }
    }
    onPlayPause(!isPlaying); // Notify parent of play/pause state change
  };

  if (!currentSegment) {
    return null; // Don't render widget if no segment is selected
  }

  return (
    <WidgetContainer>
      <TrackInfo>
        <TrackTitle>{currentSegment.name}</TrackTitle>
        <TrackArtist>{currentSegment.player}</TrackArtist>
      </TrackInfo>
      <Controls>
        <LoopButton isLooping={isLooping} onClick={onLoopToggle}>
          {isLooping ? '🔁' : '🔂'} {/* Unicode for repeat and repeat one */} 
        </LoopButton>
        <ControlButton onClick={handlePlayPauseClick}>
          {isPlaying ? '⏸️' : '▶️'}
        </ControlButton>
      </Controls>
    </WidgetContainer>
  );
};

export default PlayerWidget;
