import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { extractVideoId, extractPlaylistId, isPlaylistUrl } from '../utils/youtube';

const YouTubePlayer = ({ videoUrl, onProgress, onError }) => {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaylist, setIsPlaylist] = useState(false);
  const intervalRef = useRef(null);
  const errorCount = useRef(0);
  const videoIdRef = useRef(null);

  // Extract IDs from URL
  const videoId = extractVideoId(videoUrl);
  const playlistId = extractPlaylistId(videoUrl);
  const isPlaylistUrlCheck = isPlaylistUrl(videoUrl);

  useEffect(() => {
    setIsPlaylist(isPlaylistUrlCheck);
  }, [isPlaylistUrlCheck]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const onReady = (event) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    const dur = playerInstance.getDuration();
    setDuration(dur);
    
    // ✅ If duration is 0 (playlist), set a default duration for tracking
    if (dur === 0) {
      console.log('📋 Playlist detected - using simulated progress tracking');
    }
    
    setIsReady(true);
    errorCount.current = 0;
  };

  const onPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (player) {
        const current = player.getCurrentTime();
        const total = player.getDuration();
        
        if (total > 0) {
          // ✅ Normal video with duration
          const percentage = (current / total) * 100;
          setProgress(percentage);
          if (onProgress) {
            onProgress(percentage);
          }
        } else if (isPlaylist) {
          // ✅ Playlist - simulate progress based on time
          // Increment progress slowly (2% every 5 seconds)
          setProgress(prev => {
            const newProgress = Math.min(prev + 0.4, 100);
            if (onProgress) {
              onProgress(newProgress);
            }
            return newProgress;
          });
        }
      }
    }, 1000);
  };

  const onPause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const onEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setProgress(100);
    if (onProgress) {
      onProgress(100);
    }
  };

  const handleVideoError = (error) => {
    errorCount.current += 1;
    console.error('YouTube Error:', error);
    
    if (onError) {
      onError(error);
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      fs: 1,
      playsinline: 1,
    },
  };

  // Handle playlist embed
  if (isPlaylist && playlistId) {
    const playlistEmbedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    
    return (
      <div className="relative bg-black rounded-brand-lg overflow-hidden">
        <div className="aspect-video w-full">
          <iframe
            src={playlistEmbedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Playlist"
            onLoad={() => {
              // ✅ Start tracking playlist progress
              setTimeout(() => {
                if (onProgress) {
                  // Start with current progress
                  const savedProgress = localStorage.getItem(`playlist_${playlistId}_progress`);
                  const initialProgress = savedProgress ? parseFloat(savedProgress) : 0;
                  setProgress(initialProgress);
                }
              }, 2000);
            }}
          />
        </div>
        {/* Progress Bar for Playlist */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-black/70 backdrop-blur-sm px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-white text-xs font-mono">
                📋 Playlist
              </span>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-white/50 mb-0.5">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progress >= 80 ? 'bg-clear-teal' : 'bg-coral-orange'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </div>
              {progress >= 80 && (
                <span className="text-clear-teal text-xs font-medium">✅ Quiz ready</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="bg-gray-900 rounded-brand-lg flex items-center justify-center p-8 text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg">Invalid video URL</p>
          <p className="text-sm text-gray-400 mt-2 break-all">{videoUrl}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-brand-lg overflow-hidden">
      <div className="aspect-video w-full">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onEnd={onEnd}
          onError={handleVideoError}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-white text-xs font-mono">
              {Math.round(progress)}%
            </span>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-white/50 mb-0.5">
                <span>Watch progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progress >= 80 ? 'bg-clear-teal' : 'bg-coral-orange'
                  }`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
            {progress >= 80 && (
              <span className="text-clear-teal text-xs font-medium">✅ Ready for quiz</span>
            )}
          </div>
        </div>
      </div>

      {/* Error overlay */}
      {errorCount.current > 2 && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <div className="text-4xl mb-3">📡</div>
            <p className="text-lg font-medium">Video is taking too long to load</p>
            <p className="text-sm text-gray-400 mt-2">
              Please check your internet connection and try again.
            </p>
            <button
              onClick={() => {
                errorCount.current = 0;
                if (player) {
                  player.loadVideoById(videoId);
                }
              }}
              className="mt-4 bg-white text-deep-ocean px-6 py-2 rounded-brand font-medium hover:bg-gray-100 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;