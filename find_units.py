import psycopg2
import sys

def find_units():
    conn_configs = [
        "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        "postgresql://postgres:password@127.0.0.1:5432/brixaurea_local",
    ]
    
    project_id = "cff8c323-b2a7-4985-a9c4-aa87bfdda18c"
    
    for conn_str in conn_configs:
        try:
            conn = psycopg2.connect(conn_str)
            cur = conn.cursor()
            
            # Find all scenarios for this project and count units
            cur.execute("""
                SELECT fs.id, fs.name, fs.created_at, COUNT(um.id) as unit_count
                FROM financial_scenarios fs
                LEFT JOIN units_mix um ON um.scenario_id = fs.id
                WHERE fs.project_id = %s
                GROUP BY fs.id, fs.name, fs.created_at
                ORDER BY fs.created_at DESC
            """, (project_id,))
            
            scenarios = cur.fetchall()
            print(f"Connection: {conn_str}")
            print(f"{'ID':<40} | {'Name':<20} | {'Created At':<25} | {'Units':<5}")
            print("-" * 100)
            for s in scenarios:
                print(f"{s[0]:<40} | {s[1]:<20} | {str(s[2]):<25} | {s[3]:<5}")
            
            cur.close()
            conn.close()
            return
        except Exception as e:
            pass

if __name__ == "__main__":
    find_units()
