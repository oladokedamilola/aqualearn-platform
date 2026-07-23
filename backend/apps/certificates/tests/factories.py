import factory
from django.contrib.auth import get_user_model
from faker import Faker

fake = Faker()

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    
    email = factory.LazyAttribute(lambda _: fake.email())
    first_name = factory.LazyAttribute(lambda _: fake.first_name())
    last_name = factory.LazyAttribute(lambda _: fake.last_name())
    password = factory.PostGenerationMethodCall('set_password', 'TestPass123!')
    experience_level = 'beginner'
    is_active = True

class AdminUserFactory(UserFactory):
    is_staff = True
    is_superuser = True