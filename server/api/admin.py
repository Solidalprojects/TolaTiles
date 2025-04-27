# server/api/admin.py - Update admin configuration

from django.contrib import admin
from .models import (
    TileCategory, Tile, TileImage, Project, ProjectImage,
    ProductType, TeamMember, CustomerTestimonial, Contact, Subscriber
)

class TileImageInline(admin.TabularInline):
    model = TileImage
    extra = 1

@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_order', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('display_order', 'active')

@admin.register(TileCategory)
class TileCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'active', 'created_at')
    list_filter = ('active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('order', 'active')

@admin.register(Tile)
class TileAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'product_type', 'featured', 'in_stock', 'created_at')
    list_filter = ('category', 'product_type', 'featured', 'in_stock')
    search_fields = ('title', 'description', 'sku')
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['category', 'product_type']
    inlines = [TileImageInline]

@admin.register(TileImage)
class TileImageAdmin(admin.ModelAdmin):
    list_display = ('tile', 'caption', 'is_primary', 'created_at')
    list_filter = ('tile', 'is_primary')
    search_fields = ('tile__title', 'caption')
    autocomplete_fields = ['tile']

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'display_order', 'active')
    list_filter = ('active', 'position')
    search_fields = ('name', 'position', 'bio')
    list_editable = ('display_order', 'active')

class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1

class CustomerTestimonialInline(admin.TabularInline):
    model = CustomerTestimonial
    extra = 0
    fields = ('customer_name', 'rating', 'approved')
    readonly_fields = ('customer_name', 'rating')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'location', 'completed_date', 'product_type', 'featured')
    list_filter = ('featured', 'completed_date', 'product_type', 'status')
    search_fields = ('title', 'description', 'client', 'location')
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ['product_type']
    filter_horizontal = ('tiles_used',)
    inlines = [ProjectImageInline, CustomerTestimonialInline]

@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ('project', 'caption', 'is_primary')
    list_filter = ('project', 'is_primary')
    search_fields = ('caption', 'project__title')
    autocomplete_fields = ['project']

@admin.register(CustomerTestimonial)
class CustomerTestimonialAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'rating', 'date', 'project', 'approved')
    list_filter = ('rating', 'approved', 'date')
    search_fields = ('customer_name', 'testimonial', 'project__title')
    list_editable = ('approved',)
    autocomplete_fields = ['project']
    date_hierarchy = 'date'

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at', 'responded')
    list_filter = ('responded', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'phone', 'subject', 'message', 'created_at')
    list_editable = ('responded',)

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'active', 'created_at')
    list_filter = ('active', 'created_at')
    search_fields = ('email', 'name')
    list_editable = ('active',)