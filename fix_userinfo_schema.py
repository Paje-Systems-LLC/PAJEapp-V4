import sqlite3

db_path = r"C:\Users\Boas\OneDrive\Documentos\Playground\HDsys-V3\djangoapp\db.sqlite3"

with sqlite3.connect(db_path) as conn:
    cursor = conn.cursor()
    columns_to_add = [
        ("user_email", "varchar(254)"),
        ("sex", "varchar(20) DEFAULT ''"),
        ("smoker", "varchar(20) DEFAULT ''"),
        ("diabetic", "varchar(20) DEFAULT ''"),
        ("hypertensive", "varchar(20) DEFAULT ''"),
        ("weight", "integer DEFAULT 0"),
        ("height", "integer DEFAULT 0"),
        ("birth_date", "date DEFAULT '1980-01-01'"),
        ("age", "integer DEFAULT 0"),
        ("median_patient_pams", "real DEFAULT 0")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE app_accounts_userinfo ADD COLUMN {col_name} {col_type}")
            print(f"Succefully injected {col_name}.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding {col_name}: {e}")
    conn.commit()

print("SQLite DB comprehensive force upgrade complete.")
