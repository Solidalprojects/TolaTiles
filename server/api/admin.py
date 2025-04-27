# server/api/admin.py - Update admin configuration

from django.contrib import admin
from .models import TileCategory, Tile, TileImage, Project, ProjectImage

class TileImageInline(admin.TabularInline):
    model = TileImage
    extra = 1

@admin.register(TileCategory)
class TileCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Tile)
class TileAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'featured', 'created_at')
    list_filter = ('category', 'featured', 'in_stock')
    search_fields = ('title', 'description', 'sku')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [TileImageInline]

@admin.register(TileImage)
class TileImageAdmin(admin.ModelAdmin):
    list_display = ('tile', 'caption', 'is_primary', 'created_at')
    list_filter = ('tile', 'is_primary')
    search_fields = ('tile__title', 'caption')

class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'location', 'completed_date', 'featured')
    list_filter = ('featured', 'completed_date')
    search_fields = ('title', 'description', 'client', 'location')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProjectImageInline]

@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ('project', 'caption', 'is_primary')
    list_filter = ('project', 'is_primary')
    search_fields = ('caption', 'project__title')