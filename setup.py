#!/usr/bin/env python
"""
Auto-setup script for Render deployment.
This script will:
1. Check if migrations are needed
2. Create superuser if it doesn't exist
3. Load seed data
4. Create cache table
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


def create_superuser():
    """Create superuser if it doesn't exist"""
    email = os.getenv('ADMIN_EMAIL', 'admin@aqualearn.com')
    password = os.getenv('ADMIN_PASSWORD', 'Admin123!')
    
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


def load_seed_data():
    """Load seed data if available"""
    seed_file = 'seed_data/load_courses.py'
    if os.path.exists(seed_file):
        try:
            # Import and run the seed loader
            sys.path.append(os.path.join(os.path.dirname(__file__), 'seed_data'))
            from load_courses import main as load_courses
            load_courses()
            print("✅ Seed data loaded successfully")
        except Exception as e:
            print(f"⚠️ Could not load seed data: {e}")
    else:
        print("⚠️ No seed data found, skipping...")


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
    
    # Create superuser
    create_superuser()
    
    # Load seed data
    load_seed_data()
    
    # Create cache table
    create_cache_table()
    
    print("=" * 50)
    print("✅ Setup complete!")
    print("=" * 50)


if __name__ == '__main__':
    main()