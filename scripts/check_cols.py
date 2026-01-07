import psycopg2
import sys

def check_columns():
    conn_configs = [
        "postgresql://postgres:password@127.0.0.1:5432/brixaurea_local",
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    ]
    
    for conn_str in conn_configs:
        try:
            conn = psycopg2.connect(conn_str)
            cur = conn.cursor()
            cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'financial_scenarios';")
            cols = [r[0] for r in cur.fetchall()]
            print(f"Columns in financial_scenarios ({conn_str}): {cols}")
            cur.close()
            conn.close()
            return
        except Exception:
            pass
    print("Could not connect to database")

if __name__ == "__main__":
    check_columns()
