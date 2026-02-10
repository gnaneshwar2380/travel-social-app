from django.apps import AppConfig
def ready(self):
    import backend.api.signals


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
