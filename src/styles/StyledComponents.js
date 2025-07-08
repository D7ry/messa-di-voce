// src/styles/StyledComponents.js
import styled from 'styled-components';

/**
 * Main container for the application content.
 * Applies the core glassmorphism styling and handles overall layout.
 */
export const AppContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh; /* Ensure it takes full viewport height */
  width: 100%;
  background: rgba(255, 255, 255, 0.08); /* Core glassmorphism background */
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  padding: 20px; /* Reduced padding for mobile */
  margin: 20px auto; /* Center horizontally, add vertical margin */
  max-width: 600px; /* Max width for single column */
  box-sizing: border-box;
  overflow-y: auto; /* Allow AppContainer to scroll */
  color: white;
  gap: 15px; /* Reduced gap for mobile */
  padding-bottom: 20px; /* Reverted padding */

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

/**
 * Generic section container for practice sets or segments.
 * Provides a subtle background and internal spacing.
 */
export const Section = styled.div`
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

/**
 * Header for sections, providing space for title and action buttons.
 */
export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  gap: 10px; /* Space between items */
`;

/**
 * Title for sections.
 */
export const SectionTitle = styled.h2`
  font-size: 1.4em; /* Smaller title for mobile */
  color: #e0e0e0;
  font-weight: 600;
  margin: 0; /* Remove default margin */

  @media (min-width: 768px) {
    font-size: 1.8em;
  }
`;

/**
 * Styling for individual list items within sections (e.g., practice sets, segments).
 */
export const ListItem = styled.div`
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

/**
 * Styling for the segment name within a list item.
 */
export const SegmentName = styled.span`
  font-weight: 500;
  font-size: 1em; /* Smaller font for mobile */

  @media (min-width: 768px) {
    font-size: 1.1em;
  }
`;

/**
 * Styling for the segment player/artist name within a list item.
 */
export const SegmentPlayer = styled.span`
  font-size: 0.8em; /* Smaller font for mobile */
  color: #bbb;
  margin-top: 3px; /* Reduced margin for mobile */

  @media (min-width: 768px) {
    font-size: 0.9em;
    margin-top: 4px;
  }
`;

/**
 * Base styling for action buttons.
 */
export const ActionButton = styled.button`
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

/**
 * Specific styling for play buttons, inheriting from ActionButton.
 */
export const PlayButton = styled(ActionButton)`
  background: linear-gradient(145deg, #1DB954, #1ED760); /* Spotify Green */
  &:hover {
    background: linear-gradient(145deg, #1ED760, #1DB954);
  }
`;

/**
 * Specific styling for back buttons, inheriting from ActionButton.
 */
export const BackButton = styled(ActionButton)`
  background: linear-gradient(145deg, #6c757d, #5a6268); /* Grey gradient for back button */
  &:hover {
    background: linear-gradient(145deg, #5a6268, #6c757d);
  }
`;

/**
 * Specific styling for preview buttons, inheriting from ActionButton.
 */
export const PreviewButton = styled(ActionButton)`
  background: linear-gradient(145deg, #1DB954, #1ED760); /* Spotify Green */
  &:hover {
    background: linear-gradient(145deg, #1ED760, #1DB954);
  }
`;

/**
 * Container for the login screen.
 */
export const LoginContainer = styled.div`
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

/**
 * Overlay for modals.
 */
export const ModalOverlay = styled.div`
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

/**
 * Content area for modals.
 */
export const ModalContent = styled.div`
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

/**
 * Input field for search within modals.
 */
export const SearchInput = styled.input`
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

/**
 * Button for initiating search.
 */
export const SearchButton = styled.button`
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

/**
 * Container for a list of tracks.
 */
export const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

/**
 * Individual track item in the search results.
 */
export const TrackItem = styled.div`
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

/**
 * Container for track title and artist.
 */
export const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

/**
 * Title of a track.
 */
export const TrackTitle = styled.span`
  font-weight: 600;
  font-size: 1.1em;
`;

/**
 * Artist(s) of a track.
 */
export const TrackArtist = styled.span`
  font-size: 0.9em;
  color: #bbb;
`;

/**
 * Container for track action buttons (e.g., Preview, Set Segment).
 */
export const TrackActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;

  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

/**
 * Button to close a modal.
 */
export const CloseButton = styled(ActionButton)`
  background: linear-gradient(145deg, #dc3545, #c82333);
  &:hover {
    background: linear-gradient(145deg, #c82333, #dc3545);
  }
`;

/**
 * Grouping for time input fields.
 */
export const TimeInputGroup = styled.div`
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

/**
 * Styled component for the user profile image.
 */
export const UserProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: border-color 0.2s ease-in-out;

  &:hover {
    border-color: #1DB954; /* Spotify green on hover */
  }
`;

/**
 * Pop-up container for the logout button.
 */
export const LogoutPopup = styled.div`
  position: absolute;
  top: 50px; /* Position below the profile image */
  right: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 1001; /* Ensure it's above other content */
`;