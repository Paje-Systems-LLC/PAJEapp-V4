import sqlite3
import pprint

conn = sqlite3.connect(r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp\db.sqlite3")
c = conn.cursor()
c.execute("PRAGMA table_info(app_accounts_customuser)")
columns = c.fetchall()
print("app_accounts_customuser Columns:")
for col in columns:
    print(col[1], col[2])
    
c.execute("PRAGMA table_info(app_accounts_professionalinfo)")
columns_pro = c.fetchall()
print("\napp_accounts_professionalinfo Columns:")
for col in columns_pro:
    print(col[1], col[2])
