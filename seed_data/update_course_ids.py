#!/usr/bin/env python
"""
Script to extract YouTube video IDs from URLs in courses.json
and update the JSON file with the extracted IDs.

Run: python seed_data/update_course_ids.py
"""

import json
import re
import sys
from pathlib import Path

def extract_video_id(url):
    """
    Extract YouTube video ID from various URL formats
    Returns video_id or None if not found
    """
    if not url:
        return None
    
    # Pattern for youtube.com/watch?v=...
    watch_pattern = r'(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*[?&]v=)([^"&?\/\s]{11})'
    # Pattern for youtu.be/...
    short_pattern = r'youtu\.be\/([^"&?\/\s]{11})'
    # Pattern for embed
    embed_pattern = r'youtube\.com\/embed\/([^"&?\/\s]{11})'
    # Pattern for v= in any context
    v_pattern = r'[?&]v=([^"&?\/\s]{11})'
    
    patterns = [watch_pattern, short_pattern, embed_pattern, v_pattern]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

def extract_playlist_id(url):
    """Extract YouTube playlist ID from URL"""
    if not url:
        return None
    
    pattern = r'[?&]list=([^"&?\/\s]+)'
    match = re.search(pattern, url)
    return match.group(1) if match else None

def is_playlist_url(url):
    """Check if URL is a playlist"""
    if not url:
        return False
    return '/playlist?list=' in url or '&list=' in url or '?list=' in url

def get_video_info(url):
    """Get video info from URL"""
    if not url:
        return {'type': 'invalid', 'id': None, 'is_playlist': False}
    
    video_id = extract_video_id(url)
    playlist_id = extract_playlist_id(url)
    is_playlist = is_playlist_url(url)
    
    if video_id:
        return {'type': 'video', 'id': video_id, 'is_playlist': False}
    elif playlist_id:
        return {'type': 'playlist', 'id': playlist_id, 'is_playlist': True}
    else:
        return {'type': 'invalid', 'id': None, 'is_playlist': False}

def update_courses_json(json_path):
    """Update courses.json with video IDs"""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    stats = {
        'total_lessons': 0,
        'videos_found': 0,
        'playlists_found': 0,
        'invalid_urls': 0,
        'lessons_updated': []
    }
    
    for course in data.get('courses', []):
        for lesson in course.get('lessons', []):
            stats['total_lessons'] += 1
            
            url = lesson.get('video_url', '')
            if not url:
                stats['invalid_urls'] += 1
                continue
            
            info = get_video_info(url)
            
            # Add extracted info to lesson
            lesson['video_id'] = info['id']
            lesson['video_type'] = info['type']
            lesson['is_playlist'] = info['is_playlist']
            
            if info['type'] == 'video':
                stats['videos_found'] += 1
                stats['lessons_updated'].append({
                    'title': lesson.get('title', 'Unknown'),
                    'video_id': info['id']
                })
                print(f"  ✅ Video: {lesson.get('title', 'Unknown')} -> {info['id']}")
            elif info['type'] == 'playlist':
                stats['playlists_found'] += 1
                stats['lessons_updated'].append({
                    'title': lesson.get('title', 'Unknown'),
                    'playlist_id': info['id']
                })
                print(f"  📋 Playlist: {lesson.get('title', 'Unknown')} -> {info['id']}")
            else:
                stats['invalid_urls'] += 1
                print(f"  ❌ Invalid: {lesson.get('title', 'Unknown')} -> {url}")
    
    # Save updated JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    return stats

def main():
    # Get the JSON file path
    script_dir = Path(__file__).resolve().parent
    json_file = script_dir / 'courses.json'
    
    if not json_file.exists():
        print(f"❌ Error: courses.json not found at {json_file}")
        sys.exit(1)
    
    print("🐟 Updating courses.json with YouTube IDs")
    print("=" * 50)
    
    stats = update_courses_json(json_file)
    
    print("-" * 50)
    print("📊 Summary")
    print(f"  Total Lessons: {stats['total_lessons']}")
    print(f"  Videos Found: {stats['videos_found']}")
    print(f"  Playlists Found: {stats['playlists_found']}")
    print(f"  Invalid URLs: {stats['invalid_urls']}")
    print(f"  ✅ Updated {len(stats['lessons_updated'])} lessons")
    print("=" * 50)

if __name__ == '__main__':
    main()