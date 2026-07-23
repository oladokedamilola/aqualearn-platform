#!/usr/bin/env python
"""
Course Data Loader Script

This script loads course data from a JSON file into the database.
Run with: python manage.py runscript load_courses
Or: python seed_data/load_courses.py (with Django environment)
"""

import os
import sys
import json
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aqualearn.settings')

import django
django.setup()

from django.db import transaction
from django.core.files.base import ContentFile
from apps.courses.models import Course, Lesson, QuizQuestion


class CourseLoader:
    """Load courses from JSON file into database"""
    
    def __init__(self, json_file_path, clear_existing=False):
        self.json_file_path = json_file_path
        self.clear_existing = clear_existing
        self.stats = {
            'courses_created': 0,
            'courses_updated': 0,
            'lessons_created': 0,
            'lessons_updated': 0,
            'quiz_questions_created': 0,
            'quiz_questions_updated': 0,
            'errors': []
        }
    
    def load(self):
        """Main loading method"""
        print("🐟 AquaLearn Course Loader")
        print("=" * 50)
        
        # Clear existing data if requested
        if self.clear_existing:
            print("🗑️  Clearing existing courses...")
            QuizQuestion.objects.all().delete()
            Lesson.objects.all().delete()
            Course.objects.all().delete()
            print("   ✅ Cleared all courses, lessons, and quiz questions")
            print("-" * 50)
        
        # Read JSON file
        try:
            with open(self.json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            print(f"❌ Error: File not found: {self.json_file_path}")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Error: Invalid JSON: {e}")
            return False
        
        courses_data = data.get('courses', [])
        print(f"📚 Found {len(courses_data)} courses to load")
        print("-" * 50)
        
        with transaction.atomic():
            for course_data in courses_data:
                self._load_course(course_data)
        
        # Print summary
        self._print_summary()
        return len(self.stats['errors']) == 0
    
    def _load_course(self, course_data):
        """Load a single course and its lessons"""
        try:
            title = course_data.get('title')
            if not title:
                self.stats['errors'].append("Course missing title")
                return
            
            # Check if course exists
            course, created = Course.objects.get_or_create(
                title=title,
                defaults={
                    'description': course_data.get('description', ''),
                    'level': course_data.get('level', 'beginner'),
                    'is_active': True
                }
            )
            
            if created:
                self.stats['courses_created'] += 1
                print(f"  ✅ Created course: {title}")
            else:
                # Update existing course
                course.description = course_data.get('description', course.description)
                course.level = course_data.get('level', course.level)
                course.is_active = True
                course.save()
                self.stats['courses_updated'] += 1
                print(f"  🔄 Updated course: {title}")
            
            # Load lessons
            lessons_data = course_data.get('lessons', [])
            for lesson_data in lessons_data:
                self._load_lesson(course, lesson_data)
                
        except Exception as e:
            error_msg = f"Error loading course '{course_data.get('title', 'Unknown')}': {str(e)}"
            self.stats['errors'].append(error_msg)
            print(f"  ❌ {error_msg}")
    
    def _load_lesson(self, course, lesson_data):
        """Load a single lesson and its quiz questions"""
        try:
            title = lesson_data.get('title')
            if not title:
                self.stats['errors'].append(f"Lesson missing title for course '{course.title}'")
                return
            
            # Get or create lesson
            lesson, created = Lesson.objects.get_or_create(
                course=course,
                title=title,
                defaults={
                    'description': lesson_data.get('description', ''),
                    'order': lesson_data.get('order', 1),
                    'video_url': lesson_data.get('video_url', ''),
                    'video_duration': lesson_data.get('video_duration', 0)
                }
            )
            
            if created:
                self.stats['lessons_created'] += 1
                print(f"    ✅ Created lesson: {title}")
            else:
                # Update existing lesson
                lesson.description = lesson_data.get('description', lesson.description)
                lesson.order = lesson_data.get('order', lesson.order)
                lesson.video_url = lesson_data.get('video_url', lesson.video_url)
                lesson.video_duration = lesson_data.get('video_duration', lesson.video_duration)
                lesson.save()
                self.stats['lessons_updated'] += 1
                print(f"    🔄 Updated lesson: {title}")
            
            # Load quiz questions
            quiz_data = lesson_data.get('quiz_questions', [])
            for question_data in quiz_data:
                self._load_quiz_question(lesson, question_data)
                
        except Exception as e:
            error_msg = f"Error loading lesson '{lesson_data.get('title', 'Unknown')}': {str(e)}"
            self.stats['errors'].append(error_msg)
            print(f"    ❌ {error_msg}")
    
    def _load_quiz_question(self, lesson, question_data):
        """Load a single quiz question"""
        try:
            question_text = question_data.get('question')
            if not question_text:
                self.stats['errors'].append(f"Quiz question missing text for lesson '{lesson.title}'")
                return
            
            # Check if question exists
            quiz_question, created = QuizQuestion.objects.get_or_create(
                lesson=lesson,
                question=question_text,
                defaults={
                    'option_1': question_data.get('option_1', ''),
                    'option_2': question_data.get('option_2', ''),
                    'option_3': question_data.get('option_3', ''),
                    'option_4': question_data.get('option_4', ''),
                    'correct_option': question_data.get('correct_option', 1),
                    'explanation': question_data.get('explanation', '')
                }
            )
            
            if created:
                self.stats['quiz_questions_created'] += 1
            else:
                # Update existing quiz question
                quiz_question.option_1 = question_data.get('option_1', quiz_question.option_1)
                quiz_question.option_2 = question_data.get('option_2', quiz_question.option_2)
                quiz_question.option_3 = question_data.get('option_3', quiz_question.option_3)
                quiz_question.option_4 = question_data.get('option_4', quiz_question.option_4)
                quiz_question.correct_option = question_data.get('correct_option', quiz_question.correct_option)
                quiz_question.explanation = question_data.get('explanation', quiz_question.explanation)
                quiz_question.save()
                self.stats['quiz_questions_updated'] += 1
                
        except Exception as e:
            error_msg = f"Error loading quiz question: {str(e)}"
            self.stats['errors'].append(error_msg)
    
    def _print_summary(self):
        """Print loading summary"""
        print("-" * 50)
        print("📊 Loading Summary")
        print(f"  Courses Created: {self.stats['courses_created']}")
        print(f"  Courses Updated: {self.stats['courses_updated']}")
        print(f"  Lessons Created: {self.stats['lessons_created']}")
        print(f"  Lessons Updated: {self.stats['lessons_updated']}")
        print(f"  Quiz Questions Created: {self.stats['quiz_questions_created']}")
        print(f"  Quiz Questions Updated: {self.stats['quiz_questions_updated']}")
        
        if self.stats['errors']:
            print(f"  ⚠️ Errors: {len(self.stats['errors'])}")
            for error in self.stats['errors']:
                print(f"    - {error}")
        else:
            print("  ✅ All data loaded successfully!")
        print("=" * 50)


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Load courses from JSON file')
    parser.add_argument(
        '--file',
        type=str,
        help='Path to JSON file (default: seed_data/courses.json)',
        default=None
    )
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear existing courses before loading'
    )
    
    args = parser.parse_args()
    
    # Get the JSON file path
    if args.file:
        json_file = Path(args.file)
    else:
        script_dir = Path(__file__).resolve().parent
        json_file = script_dir / 'courses.json'
    
    # If file doesn't exist, look in current directory
    if not json_file.exists():
        json_file = Path.cwd() / 'courses.json'
    
    if not json_file.exists():
        print(f"❌ Error: courses.json not found")
        print(f"   Searched in: {Path(__file__).resolve().parent}")
        print(f"   And: {Path.cwd()}")
        return
    
    loader = CourseLoader(str(json_file), clear_existing=args.clear)
    success = loader.load()
    
    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()