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
from .models import (
    UserProfile, Conversation, Message, ProductType, 
    TileCategory, TileImage, Project, ProjectImage, 
    Contact, Subscriber, Tile, TeamMember, CustomerTestimonial
)




class UserProfileSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'bio', 'profile_image', 'profile_image_url', 
            'phone', 'address', 'preferences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'profile_image_url']
    
    def get_profile_image_url(self, obj):
        if obj.profile_image:
            return self.context['request'].build_absolute_uri(obj.profile_image.url)
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'profile']
        read_only_fields = ['id', 'is_staff']
    
    def update(self, instance, validated_data):
        # Update User model fields
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        # Update UserProfile fields
        profile_data = self.context.get('profile_data')
        if profile_data:
            profile = instance.profile
            
            if 'bio' in profile_data:
                profile.bio = profile_data.get('bio')
            
            if 'phone' in profile_data:
                profile.phone = profile_data.get('phone')
            
            if 'address' in profile_data:
                profile.address = profile_data.get('address')
            
            if 'profile_image' in profile_data:
                profile.profile_image = profile_data.get('profile_image')
            
            if 'preferences' in profile_data:
                profile.preferences = profile_data.get('preferences')
            
            profile.save()
        
        return instance

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    sender_profile_image = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username', 'sender_profile_image',
            'receiver', 'receiver_username', 'content', 'attachment', 'attachment_url',
            'is_read', 'is_admin_message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'sender_username', 
                           'receiver_username', 'sender_profile_image', 'attachment_url']
    
    def get_sender_profile_image(self, obj):
        try:
            if obj.sender.profile.profile_image:
                return self.context['request'].build_absolute_uri(obj.sender.profile.profile_image.url)
        except:
            pass
        return None
    
    def get_attachment_url(self, obj):
        if obj.attachment:
            return self.context['request'].build_absolute_uri(obj.attachment.url)
        return None

class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_message', 'unread_count']
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return MessageSerializer(last_message, context=self.context).data
        return None
    
    def get_unread_count(self, obj):
        user = self.context.get('request').user
        return obj.messages.filter(receiver=user, is_read=False).count() if user else 0

# Registration Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

# Password Change Serializer
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
        
# Add serializers for sending messages
class SendMessageSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField(required=True)
    content = serializers.CharField(required=False, allow_blank=True)
    attachment = serializers.FileField(required=False)
    
    def validate(self, attrs):
        # Either content or attachment must be provided
        if not attrs.get('content') and not attrs.get('attachment'):
            raise serializers.ValidationError(
                "Either content or attachment must be provided."
            )
        return attrs

# Add serializers for marking messages as read
class MarkMessagesReadSerializer(serializers.Serializer):
    message_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )



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