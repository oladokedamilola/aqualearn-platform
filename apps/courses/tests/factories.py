import factory
from faker import Faker
from apps.courses.models import Course, Lesson, QuizQuestion

fake = Faker()

class CourseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Course
    
    title = factory.LazyAttribute(lambda _: fake.sentence(nb_words=4))
    description = factory.LazyAttribute(lambda _: fake.paragraph())
    level = factory.Iterator(['beginner', 'intermediate', 'advanced'])
    is_active = True

class LessonFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Lesson
    
    course = factory.SubFactory(CourseFactory)
    title = factory.LazyAttribute(lambda _: fake.sentence(nb_words=3))
    description = factory.LazyAttribute(lambda _: fake.paragraph())
    order = factory.Sequence(lambda n: n)
    video_url = "https://www.youtube.com/watch?v=test123"
    video_duration = factory.LazyAttribute(lambda _: fake.random_int(min=60, max=600))

class QuizQuestionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = QuizQuestion
    
    lesson = factory.SubFactory(LessonFactory)
    question = factory.LazyAttribute(lambda _: fake.sentence(nb_words=10))
    option_1 = factory.LazyAttribute(lambda _: fake.sentence(nb_words=3))
    option_2 = factory.LazyAttribute(lambda _: fake.sentence(nb_words=3))
    option_3 = factory.LazyAttribute(lambda _: fake.sentence(nb_words=3))
    option_4 = factory.LazyAttribute(lambda _: fake.sentence(nb_words=3))
    correct_option = factory.Iterator([1, 2, 3, 4])