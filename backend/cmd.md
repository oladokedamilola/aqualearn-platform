# 1. Make migrations for all apps
python manage.py makemigrations users courses progress certificates

# 2. Apply migrations
python manage.py migrate

# 3. Create superuser
python manage.py createsuperuser

# 4. Load seed data
python seed_data/load_courses.py

# 5. 
python manage.py createcachetable

# 6.
python seed_data/load_courses.py

# 7. Run server
python manage.py runserver

python manage.py reset_progress

# Reset progress for a specific lesson
python manage.py reset_progress --user jonas@example.com --course "Introduction to Fish Farming" --lesson "How to Start Fish Farming for Beginners"

# Reset all lessons in a course
python manage.py reset_progress --user jonas@example.com --course "Introduction to Fish Farming" --all-lessons

# Dry run (preview without making changes)
python manage.py reset_progress --user jonas@example.com --course "Introduction to Fish Farming" --lesson "How to Start Fish Farming for Beginners" --dry-run

