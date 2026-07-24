#!/usr/bin/env python
"""
Auto-setup script for Render deployment.
"""

import os
import sys
import django
from django.core.management import call_command
from django.contrib.auth import get_user_model

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aqualearn.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

django.setup()

User = get_user_model()


def run_migrations():
    """Run migrations for all apps"""
    print("📦 Running migrations...")
    try:
        call_command('makemigrations', 'users')
        call_command('makemigrations', 'courses')
        call_command('makemigrations', 'progress')
        call_command('makemigrations', 'certificates')
        call_command('migrate')
        print("✅ Migrations completed")
    except Exception as e:
        print(f"⚠️ Migration error: {e}")
        raise


def create_superuser():
    """Create superuser if it doesn't exist"""
    email = os.getenv('ADMIN_EMAIL', 'admin@aqualearn.com')
    password = os.getenv('ADMIN_PASSWORD', 'Admin123!')
    
    try:
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password=password,
                first_name='Admin',
                last_name='AquaLearn'
            )
            print(f"✅ Superuser created: {email}")
        else:
            print(f"✅ Superuser already exists: {email}")
    except Exception as e:
        print(f"⚠️ Could not create superuser: {e}")


def load_seed_data():
    """Load seed data if available"""
    try:
        # ✅ Fix: Import from seed_data.load_courses
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'seed_data'))
        from load_courses import main as load_courses
        load_courses()
        print("✅ Seed data loaded successfully")
    except ImportError as e:
        print(f"⚠️ Could not import load_courses: {e}")
    except Exception as e:
        print(f"⚠️ Could not load seed data: {e}")


def create_cache_table():
    """Create cache table if needed"""
    try:
        call_command('createcachetable')
        print("✅ Cache table created")
    except Exception as e:
        print(f"⚠️ Cache table creation skipped: {e}")


def main():
    print("=" * 50)
    print("🐟 AquaLearn - Auto Setup Script")
    print("=" * 50)
    
    run_migrations()
    create_superuser()
    load_seed_data()
    create_cache_table()
    
    print("=" * 50)
    print("✅ Setup complete!")
    print("=" * 50)


if __name__ == '__main__':
    main()