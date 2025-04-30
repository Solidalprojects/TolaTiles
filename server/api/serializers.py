# server/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    TileCategory, TileImage, Project, ProjectImage, 
    Contact, Subscriber, Tile, ProductType, 
    TeamMember, CustomerTestimonial
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id', 'is_staff']

from rest_framework import serializers
from .models import ProductType

class ProductTypeSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    tiles_count = serializers.SerializerMethodField()
    categories_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductType
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url',
            'icon_name', 'display_order', 'active', 'show_in_navbar', 
            'created_at', 'updated_at', 'tiles_count', 'categories_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'tiles_count', 'image_url', 'categories_count']
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None
    
    def get_tiles_count(self, obj):
        return obj.tiles.count()
    
    def get_categories_count(self, obj):
        return obj.categories.count()

class ProductTypeDetailSerializer(ProductTypeSerializer):
    """Serializer for detailed product type view with associated categories and tiles"""
    categories = serializers.SerializerMethodField()
    
    class Meta(ProductTypeSerializer.Meta):
        fields = ProductTypeSerializer.Meta.fields + ['categories']
    
    def get_categories(self, obj):
        categories = obj.categories.all()
        return TileCategorySerializer(categories, many=True, context=self.context).data

class TeamMemberSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'position', 'bio', 'image', 'image_url',
            'email', 'phone', 'display_order', 'active', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'image_url']
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class CustomerTestimonialSerializer(serializers.ModelSerializer):
    project_title = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomerTestimonial
        fields = [
            'id', 'customer_name', 'location', 'testimonial', 
            'project', 'project_title', 'rating', 'date', 
            'image', 'image_url', 'approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'project_title', 'image_url']
    
    def get_project_title(self, obj):
        if obj.project:
            return obj.project.title
        return None
        
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

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

class TileCategorySerializer(serializers.ModelSerializer):
    tiles_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    product_type_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TileCategory
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url',
            'product_type', 'product_type_name', 'order', 'active', 
            'created_at', 'updated_at', 'tiles_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'tiles_count', 'image_url', 'product_type_name']
    
    def get_tiles_count(self, obj):
        return obj.tiles.count()
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None
        
    def get_product_type_name(self, obj):
        if obj.product_type:
            return obj.product_type.name
        return None

class TileCategoryDetailSerializer(TileCategorySerializer):
    """Serializer for detailed category view with associated tiles"""
    tiles = serializers.SerializerMethodField()
    
    class Meta(TileCategorySerializer.Meta):
        fields = TileCategorySerializer.Meta.fields + ['tiles']
    
    def get_tiles(self, obj):
        tiles = obj.tiles.all()
        return TileSerializer(tiles, many=True, context=self.context).data

class TileSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    product_type_name = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tile
        fields = [
            'id', 'title', 'slug', 'description', 
            'category', 'category_name', 
            'product_type', 'product_type_name',
            'price', 'size', 'material', 'in_stock', 'sku',
            'created_at', 'updated_at', 'primary_image', 'images_count'
        ]
        read_only_fields = ['id', 'slug', 'sku', 'created_at', 'updated_at', 'primary_image', 'images_count']
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_product_type_name(self, obj):
        return obj.product_type.name if obj.product_type else None
    
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
    product_type_name = serializers.SerializerMethodField()
    testimonials_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'client', 'location', 
            'completed_date', 'status', 'status_display', 
            'product_type', 'product_type_name',
            'area_size', 'testimonial', 'created_at', 'updated_at',
            'primary_image', 'images_count', 'testimonials_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 
                            'primary_image', 'status_display', 'images_count', 
                            'product_type_name', 'testimonials_count']
    
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
    
    def get_product_type_name(self, obj):
        return obj.product_type.name if obj.product_type else None
    
    def get_testimonials_count(self, obj):
        return obj.testimonials.count()

class ProjectDetailSerializer(ProjectSerializer):
    """Serializer for detailed project view with images and associated tiles"""
    images = ProjectImageSerializer(many=True, read_only=True)
    tiles_used = TileSerializer(many=True, read_only=True)
    testimonials = CustomerTestimonialSerializer(many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['images', 'tiles_used', 'testimonials']

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