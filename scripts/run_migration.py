import psycopg2
import sys

def run_sql(sql):
    # Try common local docker ports
    conn_configs = [
        "postgresql://postgres:password@127.0.0.1:5432/brixaurea_local",
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    ]
    
    success = False
    for conn_str in conn_configs:
        try:
            print(f"Connecting to {conn_str}...")
            conn = psycopg2.connect(conn_str)
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute(sql)
            print(f"SQL executed successfully on {conn_str}")
            cur.close()
            conn.close()
            success = True
            break
        except Exception as e:
            print(f"Failed to connect to {conn_str}: {e}")
    
    if not success:
        print("Could not connect to any database instances.")
        sys.exit(1)

if __name__ == "__main__":
    sql_to_run = """
    ALTER TABLE units_mix ADD COLUMN IF NOT EXISTS sale_date DATE;
    ALTER TABLE units_mix ADD COLUMN IF NOT EXISTS construction_start_date DATE;
    """
    run_sql(sql_to_run)
