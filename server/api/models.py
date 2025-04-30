# server/api/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import uuid

class ProductType(models.Model):
    name = models.CharField(max_length=100)  # Backsplash, Fireplace, etc.
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='product_types/', blank=True, null=True)
    icon_name = models.CharField(max_length=50, blank=True, null=True, default='Grid')  # Lucide icon name
    display_order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    show_in_navbar = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Product Type'
        verbose_name_plural = 'Product Types'
        ordering = ['display_order', 'name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

class TileCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    product_type = models.ForeignKey(ProductType, related_name='categories', on_delete=models.CASCADE, null=True)  # Link category to product type
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Tile Category'
        verbose_name_plural = 'Tile Categories'
        ordering = ['product_type', 'order', 'name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        product_type_name = self.product_type.name if self.product_type else "No Product Type"
        return f"{self.name} ({product_type_name})"
    
    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

class Tile(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(TileCategory, related_name='tiles', on_delete=models.CASCADE)
    product_type = models.ForeignKey(ProductType, related_name='tiles', on_delete=models.SET_NULL, null=True, blank=True)
    # featured field removed
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    size = models.CharField(max_length=100, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)
    in_stock = models.BooleanField(default=True)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Tile'
        verbose_name_plural = 'Tiles'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.sku:
            self.sku = f"TILE-{uuid.uuid4().hex[:8].upper()}"
        
        # If product_type is not set but category has a product_type, use that
        if not self.product_type and self.category and self.category.product_type:
            self.product_type = self.category.product_type
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title

class TileImage(models.Model):
    tile = models.ForeignKey(Tile, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='tiles/')
    thumbnail = models.ImageField(upload_to='tiles/thumbnails/', blank=True, null=True)
    caption = models.CharField(max_length=200, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Tile Image'
        verbose_name_plural = 'Tile Images'
        ordering = ['-is_primary', 'created_at']
    
    def __str__(self):
        return f"Image for {self.tile.title}"
    
    def save(self, *args, **kwargs):
        # If this image is being set as primary, unset any existing primary
        if self.is_primary:
            TileImage.objects.filter(tile=self.tile, is_primary=True).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)
    
    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    bio = models.TextField()
    image = models.ImageField(upload_to='team/')
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    display_order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Team Member'
        verbose_name_plural = 'Team Members'
        ordering = ['display_order', 'name']
    
    def __str__(self):
        return self.name
    
    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

class Project(models.Model):
    PROGRESS_CHOICES = (
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    client = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    completed_date = models.DateField()
    status = models.CharField(max_length=20, choices=PROGRESS_CHOICES, default='completed')
    # featured field removed
    tiles_used = models.ManyToManyField(Tile, related_name='projects', blank=True)
    product_type = models.ForeignKey(ProductType, related_name='projects', on_delete=models.SET_NULL, null=True, blank=True)
    area_size = models.CharField(max_length=100, blank=True, null=True)
    testimonial = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['-completed_date']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title

class CustomerTestimonial(models.Model):
    RATING_CHOICES = [(1, '1 Star'), (2, '2 Stars'), (3, '3 Stars'), (4, '4 Stars'), (5, '5 Stars')]
    
    customer_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True, null=True)
    testimonial = models.TextField()
    project = models.ForeignKey(Project, related_name='testimonials', on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.IntegerField(choices=RATING_CHOICES, default=5)
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)  # New field for customer image
    date = models.DateField(auto_now_add=True)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Customer Testimonial'
        verbose_name_plural = 'Customer Testimonials'
        ordering = ['-date']
    
    def __str__(self):
        return f"Testimonial by {self.customer_name}"
        
    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='projects/')
    caption = models.CharField(max_length=200, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Project Image'
        verbose_name_plural = 'Project Images'
        ordering = ['-is_primary', 'created_at']
    
    def __str__(self):
        return f"Image for {self.project.title}"
    
    def save(self, *args, **kwargs):
        # If this image is being set as primary, unset any existing primary
        if self.is_primary:
            ProjectImage.objects.filter(project=self.project, is_primary=True).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)
    
    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None

class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    responded = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Contact Message'
        verbose_name_plural = 'Contact Messages'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Message from {self.name} - {self.subject}"

class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Subscriber'
        verbose_name_plural = 'Subscribers'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email