const CLIENT_ID = 'dedaf532a216473f9b9c436d5f2235b0';
const REDIRECT_URI = 'http://localhost:5173/callback';
const SCOPES = 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state';

// Function to generate a random string for PKCE
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Function to generate a code_challenge from a code_verifier
async function generateCodeChallenge(codeVerifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function redirectToAuthCodeFlow() {
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem('spotify_code_verifier', verifier);
  console.log('Stored code_verifier:', verifier);

  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('response_type', 'code');
  params.append('redirect_uri', REDIRECT_URI);
  params.append('scope', SCOPES);
  params.append('code_challenge_method', 'S256');
  params.append('code_challenge', challenge);

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  console.log('Redirecting to Spotify auth URL:', authUrl);
  window.location.href = authUrl;
}

export async function getAccessToken(code) {
  const verifier = localStorage.getItem('spotify_code_verifier');
  console.log('Attempting to get access token with code:', code, 'and verifier:', verifier);

  if (!verifier) {
    console.error('Error: No code_verifier found in localStorage.');
    return null;
  }

  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code_verifier', verifier);

  try {
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error('Failed to get access token:', result.status, result.statusText, errorText);
      return null;
    }

    const { access_token, refresh_token, expires_in } = await result.json();
    console.log('Successfully received tokens:', { access_token, refresh_token, expires_in });

    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_refresh_token', refresh_token);
    localStorage.setItem('spotify_token_expires_at', Date.now() + expires_in * 1000);

    return access_token;
  } catch (error) {
    console.error('Error during token exchange:', error);
    return null;
  }
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  console.log('Attempting to refresh token:', refreshToken);

  if (!refreshToken) {
    console.error('No refresh token found.');
    return null;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_id', CLIENT_ID);

  try {
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error('Failed to refresh token:', result.status, result.statusText, errorText);
      return null;
    }

    const { access_token, expires_in } = await result.json();
    console.log('Successfully refreshed token:', { access_token, expires_in });

    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_token_expires_at', Date.now() + expires_in * 1000);
    return access_token;
  } catch (error) {
    console.error('Error during token refresh:', error);
    return null;
  }
}

export function getStoredAccessToken() {
  const accessToken = localStorage.getItem('spotify_access_token');
  const expiresAt = localStorage.getItem('spotify_token_expires_at');

  console.log('Checking stored access token. Token:', accessToken, 'Expires at:', expiresAt);

  if (!accessToken || !expiresAt) {
    return null;
  }

  if (Date.now() < parseInt(expiresAt, 10)) {
    console.log('Stored token is valid.');
    return accessToken;
  } else {
    console.log('Stored token has expired.');
    return null; // Will be handled by refreshAccessToken in App.jsx
  }
}