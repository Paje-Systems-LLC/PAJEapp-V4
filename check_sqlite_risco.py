import sqlite3
conn = sqlite3.connect(r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp\db.sqlite3")
c = conn.cursor()
c.execute("PRAGMA table_info(app_pages_fatorriscopaciente)")
columns = c.fetchall()
print("app_pages_fatorriscopaciente Columns:")
for col in columns:
    print(col[1])
