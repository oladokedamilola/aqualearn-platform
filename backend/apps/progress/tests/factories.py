import factory
from django.utils import timezone
from apps.progress.models import UserProgress, CourseEnrollment
from apps.courses.tests.factories import LessonFactory, CourseFactory
from apps.users.tests.factories import UserFactory

class CourseEnrollmentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CourseEnrollment
    
    user = factory.SubFactory(UserFactory)
    course = factory.SubFactory(CourseFactory)
    enrolled_at = factory.LazyFunction(timezone.now)

class UserProgressFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserProgress
    
    user = factory.SubFactory(UserFactory)
    lesson = factory.SubFactory(LessonFactory)
    course = factory.SelfAttribute('lesson.course')
    watch_percentage = 0.0
    watch_threshold_met = False
    completed = False