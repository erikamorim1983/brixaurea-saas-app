import os
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from contextlib import contextmanager

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Connection Pool Settings
# minconn: minimum idle connections
# maxconn: maximum concurrent connections (crucial for handling 200+ users)
db_pool = None

def get_pool():
    global db_pool
    if db_pool is None:
        try:
            db_pool = pool.ThreadedConnectionPool(
                1, 20, # Scale this up based on your server capacity (e.g. 5, 50)
                dsn=DATABASE_URL or "",
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                port=os.getenv("DB_PORT")
            )
            print("💾 Database Connection Pool Initialized")
        except Exception as e:
            print(f"❌ Error initializing connection pool: {e}")
            raise e
    return db_pool

@contextmanager
def get_db_cursor():
    """Context manager for thread-safe pool management"""
    pool = get_pool()
    conn = pool.getconn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        yield cur
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        pool.putconn(conn)

def fetch_scenario_data(scenario_id: str):
    with get_db_cursor() as cur:
        # Get costs
        cur.execute("SELECT * FROM public.cost_line_items WHERE scenario_id = %s", (scenario_id,))
        costs = cur.fetchall()
        
        # Get units
        cur.execute("SELECT * FROM public.units_mix WHERE scenario_id = %s", (scenario_id,))
        units = cur.fetchall()
        
        # Get scenario info
        cur.execute("SELECT * FROM public.financial_scenarios WHERE id = %s", (scenario_id,))
        scenario = cur.fetchone()
        
        return {
            "costs": costs,
            "units": units,
            "scenario": scenario
        }

def update_cashflow_report(scenario_id: str, monthly_data: list, intelligence: dict = None):
    with get_db_cursor() as cur:
        # 1. Clean old report for this scenario
        cur.execute("DELETE FROM public.monthly_cashflow_report WHERE scenario_id = %s", (scenario_id,))
        
        # 2. Bulk insert new report
        insert_query = """
        INSERT INTO public.monthly_cashflow_report 
        (scenario_id, month_date, project_month_index, projected_income, projected_costs, projected_net_flow)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        batch_data = []
        for item in monthly_data:
            batch_data.append((
                scenario_id,
                item['date'],
                item['index'],
                item['income'],
                item['costs'],
                item['net_flow']
            ))
            
        cur.executemany(insert_query, batch_data)

        # 3. Update Scenario with Intelligence (Sticky data)
        if intelligence:
            cur.execute(
                "UPDATE public.financial_scenarios SET health_score = %s, strategic_analysis = %s WHERE id = %s",
                (intelligence['health_score'], intelligence['strategic_analysis'], scenario_id)
            )
