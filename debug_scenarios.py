import psycopg2

def list_all_scenarios():
    conn_configs = [
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        "postgresql://postgres:password@127.0.0.1:5432/brixaurea_local",
    ]
    
    for conn_str in conn_configs:
        try:
            conn = psycopg2.connect(conn_str)
            cur = conn.cursor()
            cur.execute("SELECT id, name, project_id FROM financial_scenarios ORDER BY created_at DESC LIMIT 20")
            rows = cur.fetchall()
            print(f"Connection: {conn_str}")
            for r in rows:
                print(f"ID: {r[0]}, Name: {r[1]}, Project: {r[2]}")
            cur.close()
            conn.close()
            return
        except Exception as e:
            print(f"Error connecting to {conn_str}: {e}")

if __name__ == "__main__":
    list_all_scenarios()
