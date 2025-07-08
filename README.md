# Messa Di Voce

Messa Di Voce is a web application designed for classical and modern musicians to quickly access and replay selected musical segments from Spotify tracks. It aims to provide an intuitive interface for customizing and referencing specific parts of musical pieces.

## Features

*   **Spotify Integration:** Connects to your Spotify account for searching and playing tracks.
*   **Piece Management:** Create and manage musical pieces.
*   **Customizable Segments:** Define and save specific segments (start and end times) from Spotify tracks.
*   **Segment Playback:** Play defined segments with precise start and end points.
*   **Responsive UI:** Adapts to both phone and laptop layouts with a modern, liquid glass aesthetic.

## Project Structure

```
messa-di-voce/
├── public/
├── src/
│   ├── components/
│   │   ├── SegmentDefinitionModal.jsx  # Modal for defining segment timestamps
│   │   └── SpotifySearchModal.jsx      # Modal for searching Spotify tracks
│   ├── styles/
│   │   ├── GlobalStyles.js           # Global CSS styles for the application
│   │   └── StyledComponents.js       # Centralized styled-components definitions
│   ├── spotifyAuth.js                # Spotify authentication logic (PKCE Flow)
│   ├── App.jsx                       # Main application component
│   └── main.jsx                      # Entry point for the React application
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd messa-di-voce
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Spotify Developer Setup:**
    *   Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
    *   Log in with your Spotify account.
    *   Click "Create an app" and fill in the details.
    *   Get your **Client ID**.
    *   Click "Edit Settings" for your app and add `http://localhost:5173/callback` (or your development server URL) to the "Redirect URIs".

4.  **Update `src/spotifyAuth.js`:**
    *   Open `src/spotifyAuth.js`.
    *   Replace the placeholder `CLIENT_ID` and `REDIRECT_URI` with your actual Spotify Client ID and the Redirect URI you configured.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

1.  **Login with Spotify:** Click the "Login with Spotify" button to authenticate your Spotify account.
2.  **Manage Pieces:** Add new musical pieces.
3.  **Add Segments:** Select a piece, then click "Add Segment" to search for Spotify tracks. Define the start and end times for your segment using the provided UI.
4.  **Play Segments:** Click the "Play Segment" button next to a defined segment to play it through your Spotify Web Playback SDK enabled browser.

## TODO

*   **Segment Editing/Deletion:** Implement functionality to edit or delete existing segments.
*   **User Data Persistence:** Implement a backend or local storage solution to persist user-created pieces and segments across sessions.
*   **Advanced Playback Controls:** Add more sophisticated playback controls (e.g., volume, seek bar, next/previous segment).
*   **Error Handling & User Feedback:** Enhance error handling and provide more informative user feedback for Spotify API interactions.
*   **UI/UX Enhancements:** Further refine the user interface and experience, potentially exploring more advanced liquid glass effects or animations.
*   **Spotify Web Playback SDK Enhancements:** Explore features like transferring playback to other Spotify Connect devices.
*   **Testing:** Add unit and integration tests for components and Spotify API interactions.
*   **Deployment:** Provide instructions or scripts for deploying the application.