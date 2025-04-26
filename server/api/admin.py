
from django.contrib import admin
from .models import TileCategory, TileImage, Project, ProjectImage

class TileImageInline(admin.TabularInline):
    model = TileImage
    extra = 1

@admin.register(TileCategory)
class TileCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    inlines = [TileImageInline]

@admin.register(TileImage)
class TileImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'featured', 'created_at')
    list_filter = ('category', 'featured')
    search_fields = ('title', 'description')

class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'location', 'completed_date', 'featured')
    list_filter = ('featured', 'completed_date')
    search_fields = ('title', 'description', 'client', 'location')
    inlines = [ProjectImageInline]

@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ('project', 'caption')
    list_filter = ('project',)
    search_fields = ('caption', 'project__title')