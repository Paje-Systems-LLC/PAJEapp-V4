import sqlite3
import sys

try:
    conn = sqlite3.connect(r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp\db.sqlite3")
    c = conn.cursor()
    
    # Ignoramos erro de coluna ja existente via try-except
    try:
        c.execute('ALTER TABLE app_pages_patient ADD COLUMN patient_glycemia INTEGER')
    except sqlite3.OperationalError:
        pass
        
    try:
        c.execute('ALTER TABLE app_pages_patient ADD COLUMN patient_weight REAL')
    except sqlite3.OperationalError:
        pass
        
    try:
        c.execute('ALTER TABLE app_pages_patient ADD COLUMN patient_height REAL')
    except sqlite3.OperationalError:
        pass
        
    conn.commit()
    print("SCHEMA ATUALIZADO COM SUCESSO - COLUNAS ANTROPOMETRICAS INSERIDAS")
except Exception as e:
    print(f"ERRO CATASTROFICO: {e}")
    sys.exit(1)
