import psycopg2

def list_projects():
    conn_configs = [
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        "postgresql://postgres:password@127.0.0.1:5432/brixaurea_local",
    ]
    
    for conn_str in conn_configs:
        try:
            conn = psycopg2.connect(conn_str)
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM projects ORDER BY created_at DESC LIMIT 5")
            projects = cur.fetchall()
            print(f"Connection: {conn_str}")
            for p in projects:
                print(f"ID: {p[0]}, Name: {p[1]}")
            cur.close()
            conn.close()
            return
        except Exception:
            pass

if __name__ == "__main__":
    list_projects()
