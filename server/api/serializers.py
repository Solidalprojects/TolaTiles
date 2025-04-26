# server/api/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TileCategory, TileImage, Project, ProjectImage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class TileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TileImage
        fields = ['id', 'title', 'description', 'image', 'category', 'featured', 'created_at']
        read_only_fields = ['id', 'created_at']

class TileCategorySerializer(serializers.ModelSerializer):
    images = TileImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = TileCategory
        fields = ['id', 'name', 'description', 'images', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'caption']
        read_only_fields = ['id']

class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'client', 'location', 
                 'completed_date', 'featured', 'images', 'created_at']
        read_only_fields = ['id', 'created_at']