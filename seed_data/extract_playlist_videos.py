#!/usr/bin/env python
"""
Script to extract individual video URLs from a YouTube playlist.
Uses YouTube Data API v3 to fetch video IDs from a playlist.

Run: python seed_data/extract_playlist_videos.py

Requirements:
    pip install google-api-python-client python-dotenv
"""

import os
import json
import sys
from pathlib import Path
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ============================================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================================

# Load .env from the backend directory
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(env_path)

# ============================================================================
# CONFIGURATION
# ============================================================================

# ✅ Get YouTube API Key from environment variables
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# The playlist ID we want to extract
PLAYLIST_ID = 'PL_5s5CPGqCKQbo6I_9_R6lmNEK3oAdd2k'

# ============================================================================

def get_playlist_videos(api_key, playlist_id, max_results=50):
    """
    Get all video IDs and titles from a YouTube playlist
    """
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        
        videos = []
        next_page_token = None
        
        while True:
            request = youtube.playlistItems().list(
                part='snippet',
                playlistId=playlist_id,
                maxResults=min(max_results, 50),
                pageToken=next_page_token
            )
            response = request.execute()
            
            for item in response.get('items', []):
                snippet = item.get('snippet', {})
                video_id = snippet.get('resourceId', {}).get('videoId')
                title = snippet.get('title', 'Unknown')
                
                if video_id:
                    videos.append({
                        'video_id': video_id,
                        'title': title,
                        'url': f'https://www.youtube.com/watch?v={video_id}'
                    })
            
            next_page_token = response.get('nextPageToken')
            if not next_page_token:
                break
        
        return videos
        
    except HttpError as e:
        print(f"❌ YouTube API Error: {e}")
        print("\n💡 To fix this:")
        print("  1. Make sure your API key is correct")
        print("  2. Enable the YouTube Data API v3 in Google Cloud Console")
        print("  3. Check that the playlist ID is correct")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def main():
    print("🐟 Extracting videos from YouTube Playlist")
    print("=" * 50)
    print(f"📋 Playlist ID: {PLAYLIST_ID}")
    print("-" * 50)
    
    if not YOUTUBE_API_KEY:
        print("❌ YOUTUBE_API_KEY not found in .env file")
        print(f"   Looking for .env at: {env_path}")
        print("\n   Please add to your .env file:")
        print("   YOUTUBE_API_KEY=your_api_key_here")
        sys.exit(1)
    
    print(f"✅ API Key found: {YOUTUBE_API_KEY[:10]}...")
    print("-" * 50)
    
    videos = get_playlist_videos(YOUTUBE_API_KEY, PLAYLIST_ID)
    
    if not videos:
        print("❌ No videos found. Check your API key or playlist ID.")
        sys.exit(1)
    
    print(f"\n📹 Found {len(videos)} videos in the playlist:")
    print("-" * 50)
    
    for i, video in enumerate(videos, 1):
        print(f"  {i}. {video['title']}")
        print(f"     URL: {video['url']}")
        print(f"     Video ID: {video['video_id']}")
        print()
    
    # ==========================================================================
    # Generate JSON output for courses.json update
    # ==========================================================================
    
    print("=" * 50)
    print("📝 Copy and paste these video URLs into your courses.json:")
    print("-" * 50)
    print()
    
    for i, video in enumerate(videos, 1):
        print(f'  // Video {i}: {video["title"]}')
        print(f'  "video_url": "https://www.youtube.com/watch?v={video["video_id"]}",')
        print()
    
    # ==========================================================================
    # Also generate the full lesson structure
    # ==========================================================================
    
    print("=" * 50)
    print("📝 Full lesson structure for your courses.json:")
    print("-" * 50)
    print()
    
    for i, video in enumerate(videos, 1):
        print(f'''    {{
      "title": "{video['title']}",
      "description": "Description for {video['title']}",
      "order": {i},
      "video_url": "https://www.youtube.com/watch?v={video['video_id']}",
      "video_duration": 0,
      "quiz_questions": [
        {{
          "question": "Your question here?",
          "option_1": "Option A",
          "option_2": "Option B",
          "option_3": "Option C",
          "option_4": "Option D",
          "correct_option": 1,
          "explanation": "Explanation for the correct answer."
        }}
      ]
    }}{',' if i < len(videos) else ''}''')
        print()

if __name__ == '__main__':
    main()