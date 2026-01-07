import psycopg2
import sys
import json

def check_data():
    conn_configs = [
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        "postgresql://postgres:password@127.0.0.1:5432/brixaurea_local",
    ]
    
    project_id = "cff8c323-b2a7-4985-a9c4-aa87bfdda18c"
    
    for conn_str in conn_configs:
        try:
            print(f"Connecting to {conn_str}...")
            conn = psycopg2.connect(conn_str)
            cur = conn.cursor()
            
            print("\n--- Scenarios ---")
            cur.execute("SELECT id, name, created_at FROM financial_scenarios WHERE project_id = %s", (project_id,))
            scenarios = cur.fetchall()
            for s in scenarios:
                print(f"ID: {s[0]}, Name: {s[1]}, Created At: {s[2]}")
                
            print("\n--- Units count per scenario ---")
            cur.execute("""
                SELECT scenario_id, COUNT(*) 
                FROM units_mix 
                WHERE scenario_id IN (SELECT id FROM financial_scenarios WHERE project_id = %s)
                GROUP BY scenario_id
            """, (project_id,))
            counts = cur.fetchall()
            for c in counts:
                print(f"Scenario ID: {c[0]}, Count: {c[1]}")
                
            cur.close()
            conn.close()
            return
        except Exception as e:
            print(f"Failed to connect to {conn_str}: {e}")

if __name__ == "__main__":
    check_data()
