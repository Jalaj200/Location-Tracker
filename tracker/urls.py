from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/track/', views.track_number, name='track_number'),
]
