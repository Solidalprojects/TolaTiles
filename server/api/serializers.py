# server/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TileCategory, TileImage, Project, ProjectImage, Contact, Subscriber, Tile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id', 'is_staff']

class TileImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TileImage
        fields = [
            'id', 'image', 'image_url', 'thumbnail', 'thumbnail_url', 
            'caption', 'is_primary', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'image_url', 'thumbnail_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return self.context['request'].build_absolute_uri(obj.thumbnail.url)
        return self.get_image_url(obj) if obj.image else None

class TileSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tile
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'category_name', 
            'featured', 'price', 'size', 'material', 'in_stock', 'sku',
            'created_at', 'updated_at', 'primary_image', 'images_count'
        ]
        read_only_fields = ['id', 'slug', 'sku', 'created_at', 'updated_at', 'primary_image', 'images_count']
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image and primary_image.image:
            return self.context['request'].build_absolute_uri(primary_image.image.url)
        return None
    
    def get_images_count(self, obj):
        return obj.images.count()

class TileDetailSerializer(TileSerializer):
    """Serializer for detailed tile view with all images"""
    images = TileImageSerializer(many=True, read_only=True)
    
    class Meta(TileSerializer.Meta):
        fields = TileSerializer.Meta.fields + ['images']

class TileCategorySerializer(serializers.ModelSerializer):
    # Update to reference tiles instead of images
    tiles_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TileCategory
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url',
            'order', 'active', 'created_at', 'updated_at', 'tiles_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'tiles_count', 'image_url']
    
    def get_tiles_count(self, obj):
        return obj.tiles.count()
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class TileCategoryDetailSerializer(TileCategorySerializer):
    """Serializer for detailed category view with associated tiles"""
    tiles = TileSerializer(many=True, read_only=True)
    
    class Meta(TileCategorySerializer.Meta):
        fields = TileCategorySerializer.Meta.fields + ['tiles']

class ProjectImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'image_url', 'caption', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class ProjectSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'client', 'location', 
            'completed_date', 'status', 'status_display', 'featured', 
            'area_size', 'testimonial', 'created_at', 'updated_at',
            'primary_image', 'images_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'primary_image', 'status_display', 'images_count']
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        
        if primary_image and primary_image.image:
            return self.context['request'].build_absolute_uri(primary_image.image.url)
        return None
    
    def get_status_display(self, obj):
        return obj.get_status_display()
    
    def get_images_count(self, obj):
        return obj.images.count()

class ProjectDetailSerializer(ProjectSerializer):
    """Serializer for detailed project view with images and associated tiles"""
    images = ProjectImageSerializer(many=True, read_only=True)
    tiles_used = TileImageSerializer(many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['images', 'tiles_used']

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'created_at', 'responded']
        read_only_fields = ['id', 'created_at', 'responded']

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ['id', 'email', 'name', 'active', 'created_at']
        read_only_fields = ['id', 'created_at']