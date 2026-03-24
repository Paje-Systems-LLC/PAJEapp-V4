import os
import sys

sys.path.append(r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from app_accounts.models import CustomUser

try:
    print(f"Buscando no Banco Central: {CustomUser.objects.count()} Usuários Registrados.")
    users = CustomUser.objects.all()
    count = 0
    for u in users:
        print(f" - [{u.id}] {u.email} (Paciente: {u.is_patient})")
        count += 1
        if count >= 15:
            print("... limitando log de saida.")
            break
            
except Exception as e:
    print(f"Erro ao consultar DB: {e}")
