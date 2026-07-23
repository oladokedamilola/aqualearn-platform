/**
 * YouTube URL Utilities
 * Extract video IDs and playlist IDs from various YouTube URL formats
 */

/**
 * Extract video ID from YouTube URL
 * Supports various formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
 * - https://www.youtube.com/watch?si=...&v=VIDEO_ID
 */
export const extractVideoId = (url) => {
  if (!url) return null;
  
  // Pattern for youtube.com/watch?v=...
  const watchRegex = /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*[?&]v=)([^"&?\/\s]{11})/;
  // Pattern for youtu.be/...
  const shortRegex = /youtu\.be\/([^"&?\/\s]{11})/;
  // Pattern for embed
  const embedRegex = /youtube\.com\/embed\/([^"&?\/\s]{11})/;
  // Pattern for v= in any context
  const vRegex = /[?&]v=([^"&?\/\s]{11})/;
  
  let match = url.match(watchRegex);
  if (match) return match[1];
  
  match = url.match(shortRegex);
  if (match) return match[1];
  
  match = url.match(embedRegex);
  if (match) return match[1];
  
  match = url.match(vRegex);
  if (match) return match[1];
  
  return null;
};

/**
 * Extract playlist ID from YouTube URL
 */
export const extractPlaylistId = (url) => {
  if (!url) return null;
  
  // Pattern for list=PLAYLIST_ID
  const listRegex = /[?&]list=([^"&?\/\s]+)/;
  const match = url.match(listRegex);
  return match ? match[1] : null;
};

/**
 * Check if URL is a playlist
 */
export const isPlaylistUrl = (url) => {
  if (!url) return false;
  return url.includes('/playlist?list=') || 
         url.includes('&list=') || 
         url.includes('?list=');
};

/**
 * Check if URL is a valid YouTube video URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url) return false;
  return extractVideoId(url) !== null || isPlaylistUrl(url);
};

/**
 * Get the video ID from a URL, with fallback
 */
export const getVideoId = (url) => {
  const videoId = extractVideoId(url);
  const playlistId = extractPlaylistId(url);
  
  if (videoId) {
    return {
      type: 'video',
      id: videoId,
    };
  }
  
  if (playlistId) {
    return {
      type: 'playlist',
      id: playlistId,
    };
  }
  
  return {
    type: 'invalid',
    id: null,
  };
};

/**
 * Generate an embed URL for a video or playlist
 */
export const getEmbedUrl = (url) => {
  const videoId = extractVideoId(url);
  const playlistId = extractPlaylistId(url);
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (playlistId) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
  }
  
  return url;
};