import { extractVideoId, extractPlaylistId, isPlaylistUrl, isValidYouTubeUrl } from '../youtube';

describe('YouTube URL Utilities', () => {
  describe('extractVideoId', () => {
    test('extracts ID from standard watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=ahSnrXREvsA';
      expect(extractVideoId(url)).toBe('ahSnrXREvsA');
    });

    test('extracts ID from youtu.be short URL', () => {
      const url = 'https://youtu.be/ahSnrXREvsA';
      expect(extractVideoId(url)).toBe('ahSnrXREvsA');
    });

    test('extracts ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/ahSnrXREvsA';
      expect(extractVideoId(url)).toBe('ahSnrXREvsA');
    });

    test('extracts ID from URL with query parameters', () => {
      const url = 'https://www.youtube.com/watch?v=ahSnrXREvsA&t=123s';
      expect(extractVideoId(url)).toBe('ahSnrXREvsA');
    });

    test('returns null for invalid URL', () => {
      const url = 'https://example.com/video';
      expect(extractVideoId(url)).toBeNull();
    });
  });

  describe('extractPlaylistId', () => {
    test('extracts ID from playlist URL', () => {
      const url = 'https://www.youtube.com/playlist?list=PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k';
      expect(extractPlaylistId(url)).toBe('PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k');
    });

    test('extracts ID from video URL with playlist', () => {
      const url = 'https://www.youtube.com/watch?v=ahSnrXREvsA&list=PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k';
      expect(extractPlaylistId(url)).toBe('PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k');
    });
  });

  describe('isPlaylistUrl', () => {
    test('returns true for playlist URL', () => {
      const url = 'https://www.youtube.com/playlist?list=PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k';
      expect(isPlaylistUrl(url)).toBe(true);
    });

    test('returns true for video URL with playlist', () => {
      const url = 'https://www.youtube.com/watch?v=ahSnrXREvsA&list=PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k';
      expect(isPlaylistUrl(url)).toBe(true);
    });

    test('returns false for plain video URL', () => {
      const url = 'https://www.youtube.com/watch?v=ahSnrXREvsA';
      expect(isPlaylistUrl(url)).toBe(false);
    });
  });

  describe('isValidYouTubeUrl', () => {
    test('returns true for valid video URL', () => {
      const url = 'https://www.youtube.com/watch?v=ahSnrXREvsA';
      expect(isValidYouTubeUrl(url)).toBe(true);
    });

    test('returns true for valid playlist URL', () => {
      const url = 'https://www.youtube.com/playlist?list=PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k';
      expect(isValidYouTubeUrl(url)).toBe(true);
    });

    test('returns false for invalid URL', () => {
      const url = 'https://example.com/video';
      expect(isValidYouTubeUrl(url)).toBe(false);
    });
  });
});