"""
Django Management Command to Reset User Progress

Usage: python manage.py reset_progress
"""

import sys
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.courses.models import Course, Lesson
from apps.progress.models import UserProgress, CourseEnrollment

User = get_user_model()


class Command(BaseCommand):
    help = 'Reset progress for a specific user, course, and lesson'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=str,
            help='User email or ID to reset progress for',
        )
        parser.add_argument(
            '--course',
            type=str,
            help='Course ID or title to reset progress for',
        )
        parser.add_argument(
            '--lesson',
            type=str,
            help='Lesson ID or title to reset progress for',
        )
        parser.add_argument(
            '--all-lessons',
            action='store_true',
            help='Reset progress for all lessons in the course',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be reset without making changes',
        )

    def handle(self, *args, **options):
        self.stdout.write('🐟 AquaLearn - Progress Reset Tool')
        self.stdout.write('=' * 50)
        
        # Get user
        user = self.get_user(options)
        if not user:
            return
        
        # Get course
        course = self.get_course(options, user)
        if not course:
            return
        
        # Get lesson(s)
        lessons = self.get_lessons(options, course, user)
        if not lessons:
            return
        
        # Perform reset
        self.reset_progress(user, course, lessons, options)
    
    def get_user(self, options):
        """Get user from options or interactively"""
        user_identifier = options.get('user')
        
        if user_identifier:
            try:
                if user_identifier.isdigit():
                    user = User.objects.get(id=int(user_identifier))
                else:
                    user = User.objects.get(email=user_identifier)
                self.stdout.write(self.style.SUCCESS(f'✅ User found: {user.email} ({user.get_full_name()})'))
                return user
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'❌ User not found: {user_identifier}'))
                return None
        
        # Interactive mode - list all users
        self.stdout.write('\n📋 Select a user:')
        users = User.objects.all().order_by('email')
        
        if users.count() == 0:
            self.stdout.write(self.style.ERROR('❌ No users found in the database.'))
            return None
        
        # Show user list with pagination
        page_size = 10
        total_users = users.count()
        page = 0
        
        while True:
            start = page * page_size
            end = min(start + page_size, total_users)
            page_users = users[start:end]
            
            self.stdout.write('\n' + '-' * 70)
            self.stdout.write(f'  Users {start+1}-{end} of {total_users}')
            self.stdout.write('  ' + '-' * 70)
            self.stdout.write('  ID  | Email                          | Name')
            self.stdout.write('  ' + '-' * 70)
            
            for i, u in enumerate(page_users, start + 1):
                self.stdout.write(f'  {i}.   {u.email:<30} | {u.get_full_name()}')
            
            self.stdout.write('  ' + '-' * 70)
            if end < total_users:
                self.stdout.write('  n.   Next page')
            if start > 0:
                self.stdout.write('  p.   Previous page')
            self.stdout.write('  0.   Cancel')
            self.stdout.write('  Or enter user number or email:')
            
            choice = input('\n> ').strip()
            
            if choice == '0':
                return None
            if choice.lower() == 'n' and end < total_users:
                page += 1
                continue
            if choice.lower() == 'p' and start > 0:
                page -= 1
                continue
            
            # Check if choice is a number
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < total_users:
                    return users[idx]
                else:
                    self.stdout.write(self.style.ERROR('❌ Invalid selection. Please try again.'))
                    continue
            
            # Try as email
            try:
                user = User.objects.get(email=choice)
                return user
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'❌ User not found with email: {choice}'))
                continue
            except KeyboardInterrupt:
                self.stdout.write('\n❌ Cancelled.')
                return None
    
    def get_course(self, options, user):
        """Get course from options or interactively"""
        course_identifier = options.get('course')
        
        if course_identifier:
            try:
                if course_identifier.isdigit():
                    course = Course.objects.get(id=int(course_identifier))
                else:
                    course = Course.objects.get(title__icontains=course_identifier)
                self.stdout.write(self.style.SUCCESS(f'✅ Course found: {course.title}'))
                return course
            except Course.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'❌ Course not found: {course_identifier}'))
                return None
            except Course.MultipleObjectsReturned:
                self.stdout.write(self.style.WARNING(f'⚠️ Multiple courses found with "{course_identifier}". Please be more specific.'))
                courses = Course.objects.filter(title__icontains=course_identifier)
                for c in courses:
                    self.stdout.write(f'   - {c.title} (ID: {c.id})')
                return None
        
        # Interactive mode - list enrolled courses for the user
        self.stdout.write(f'\n📚 Select a course for {user.email}:')
        enrollments = CourseEnrollment.objects.filter(user=user).select_related('course')
        
        if enrollments.count() == 0:
            self.stdout.write(self.style.WARNING('⚠️ User is not enrolled in any courses.'))
            return None
        
        self.stdout.write('  ID  | Title')
        self.stdout.write('  ' + '-' * 50)
        for i, e in enumerate(enrollments, 1):
            progress_count = UserProgress.objects.filter(user=user, course=e.course).count()
            self.stdout.write(f'  {i}.   {e.course.title} ({progress_count} progress records)')
        
        self.stdout.write('  0.   Cancel')
        
        while True:
            try:
                choice = input('\nEnter course number or course title: ').strip()
                if choice == '0':
                    return None
                
                if choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(enrollments):
                        return enrollments[idx].course
                    else:
                        self.stdout.write(self.style.ERROR('❌ Invalid selection. Please try again.'))
                        continue
                
                # Try as title search
                matches = CourseEnrollment.objects.filter(
                    user=user,
                    course__title__icontains=choice
                ).select_related('course')
                if matches.count() == 1:
                    return matches.first().course
                elif matches.count() > 1:
                    self.stdout.write(self.style.WARNING(f'⚠️ Multiple courses found with "{choice}". Please be more specific.'))
                    for m in matches:
                        self.stdout.write(f'   - {m.course.title} (ID: {m.course.id})')
                    continue
                else:
                    self.stdout.write(self.style.ERROR(f'❌ No enrolled course found with title: {choice}'))
                    continue
                    
            except KeyboardInterrupt:
                self.stdout.write('\n❌ Cancelled.')
                return None
    
    def get_lessons(self, options, course, user):
        """Get lesson(s) from options or interactively"""
        lesson_identifier = options.get('lesson')
        
        if options.get('all_lessons'):
            return 'all'
        
        if lesson_identifier:
            try:
                if lesson_identifier.isdigit():
                    lesson = Lesson.objects.get(id=int(lesson_identifier), course=course)
                else:
                    lesson = Lesson.objects.get(title__icontains=lesson_identifier, course=course)
                self.stdout.write(self.style.SUCCESS(f'✅ Lesson found: {lesson.title}'))
                return [lesson]
            except Lesson.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'❌ Lesson not found in this course: {lesson_identifier}'))
                return None
            except Lesson.MultipleObjectsReturned:
                self.stdout.write(self.style.WARNING(f'⚠️ Multiple lessons found with "{lesson_identifier}". Please be more specific.'))
                lessons = Lesson.objects.filter(title__icontains=lesson_identifier, course=course)
                for l in lessons:
                    self.stdout.write(f'   - {l.title} (ID: {l.id})')
                return None
        
        # Interactive mode - list lessons in the course
        self.stdout.write(f'\n📖 Select a lesson from "{course.title}":')
        lessons = Lesson.objects.filter(course=course).order_by('order')
        
        if lessons.count() == 0:
            self.stdout.write(self.style.WARNING('⚠️ No lessons found in this course.'))
            return None
        
        self.stdout.write('  ID  | Title')
        self.stdout.write('  ' + '-' * 50)
        for i, l in enumerate(lessons, 1):
            progress = UserProgress.objects.filter(user=user, lesson=l).first()
            status = '✅ Completed' if progress and progress.completed else '🔄 In progress' if progress else '📝 Not started'
            self.stdout.write(f'  {i}.   {l.title} - {status}')
        
        self.stdout.write('  a.   All lessons')
        self.stdout.write('  0.   Cancel')
        
        while True:
            try:
                choice = input('\nEnter lesson number, "a" for all, or lesson title: ').strip()
                if choice == '0':
                    return None
                if choice.lower() == 'a':
                    return 'all'
                
                if choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(lessons):
                        return [lessons[idx]]
                    else:
                        self.stdout.write(self.style.ERROR('❌ Invalid selection. Please try again.'))
                        continue
                
                # Try as title search
                matches = Lesson.objects.filter(title__icontains=choice, course=course)
                if matches.count() == 1:
                    return [matches.first()]
                elif matches.count() > 1:
                    self.stdout.write(self.style.WARNING(f'⚠️ Multiple lessons found with "{choice}". Please be more specific.'))
                    for m in matches:
                        self.stdout.write(f'   - {m.title} (ID: {m.id})')
                    continue
                else:
                    self.stdout.write(self.style.ERROR(f'❌ No lesson found with title: {choice}'))
                    continue
                    
            except KeyboardInterrupt:
                self.stdout.write('\n❌ Cancelled.')
                return None
    
    def reset_progress(self, user, course, lessons, options):
        """Reset progress for the user"""
        dry_run = options.get('dry_run', False)
        
        if not lessons:
            self.stdout.write(self.style.ERROR('❌ No lessons selected.'))
            return
        
        # Determine which lessons to reset
        if lessons == 'all':
            lesson_list = Lesson.objects.filter(course=course)
        else:
            lesson_list = lessons
        
        if not lesson_list:
            self.stdout.write(self.style.WARNING('⚠️ No lessons found to reset.'))
            return
        
        # Show summary
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write('📊 Reset Summary:')
        self.stdout.write(f'  User: {user.email} ({user.get_full_name()})')
        self.stdout.write(f'  Course: {course.title}')
        self.stdout.write(f'  Lessons: {len(lesson_list)}')
        for l in lesson_list:
            progress = UserProgress.objects.filter(user=user, lesson=l).first()
            status = 'Completed' if progress and progress.completed else 'In progress' if progress else 'Not started'
            watch_pct = f'({progress.watch_percentage}% watched)' if progress else ''
            self.stdout.write(f'    - {l.title}: {status} {watch_pct}')
        self.stdout.write('=' * 60)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('⚠️ DRY RUN - No changes will be made.'))
            return
        
        # Confirm
        confirm = input('\n⚠️ This will permanently delete progress for these lessons. Continue? (y/N): ')
        if confirm.lower() != 'y':
            self.stdout.write('❌ Cancelled.')
            return
        
        # Perform reset
        with transaction.atomic():
            total_progress = 0
            
            for lesson in lesson_list:
                # Delete progress records for this lesson
                progress_deleted, _ = UserProgress.objects.filter(
                    user=user,
                    lesson=lesson
                ).delete()
                total_progress += progress_deleted
                
                self.stdout.write(f'  ✅ Reset: {lesson.title}')
                self.stdout.write(f'     - {progress_deleted} progress records deleted')
        
        # Update course enrollment status
        enrollment = CourseEnrollment.objects.filter(user=user, course=course).first()
        if enrollment:
            enrollment.is_completed = False
            enrollment.completed_at = None
            enrollment.save()
            self.stdout.write(f'  ✅ Updated enrollment status for {course.title}')
        
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('✅ Reset Complete!'))
        self.stdout.write(f'  Total progress records deleted: {total_progress}')
        self.stdout.write('=' * 60)