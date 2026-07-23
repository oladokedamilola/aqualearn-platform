# apps/courses/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def lesson_count(self):
        return self.lessons.count()
    
    @property
    def total_duration(self):
        return sum(lesson.video_duration for lesson in self.lessons.all())

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    video_url = models.URLField(max_length=500)
    video_duration = models.PositiveIntegerField(
        default=0, 
        help_text='Duration in seconds'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"
    
    @property
    def quiz_questions(self):
        return self.quiz_questions.all()

class QuizQuestion(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='quiz_questions')
    question = models.TextField()
    option_1 = models.CharField(max_length=255)
    option_2 = models.CharField(max_length=255)
    option_3 = models.CharField(max_length=255)
    option_4 = models.CharField(max_length=255)
    correct_option = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        help_text='Enter 1, 2, 3, or 4'
    )
    explanation = models.TextField(blank=True, null=True, help_text='Explanation for the correct answer')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"Q: {self.question[:50]}..."
    
    def get_options(self):
        return [
            {'id': 1, 'text': self.option_1},
            {'id': 2, 'text': self.option_2},
            {'id': 3, 'text': self.option_3},
            {'id': 4, 'text': self.option_4},
        ]