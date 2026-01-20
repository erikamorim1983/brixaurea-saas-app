from fastapi import APIRouter, HTTPException
from finance_engine import FinancialEngine
from db_utils import fetch_scenario_data, update_cashflow_report
from ai_intelligence import IntelligenceBrain
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/finance", tags=["Finance"])
brain = IntelligenceBrain()

@router.post("/recalculate/{scenario_id}")
async def recalculate_scenario(scenario_id: str):
    """
    Triggers a full recalculation of a financial scenario.
    Uses the modern FinancialEngine to distribute costs and revenues.
    """
    try:
        data = fetch_scenario_data(scenario_id)
        if not data['scenario']:
            raise HTTPException(status_code=404, detail="Scenario not found")
            
        costs = data['costs']
        units = data['units']
        base_date = data['scenario']['base_date'] or datetime.now().date()
        
        # 1. Calculate Monthly Income from Units Mix
        max_month = 0
        income_by_month = {}
        
        for unit in units:
            # Simple linear absorption for now (extendable to bell curves)
            absorption = FinancialEngine.calculate_absorption(
                unit['unit_count'], 
                unit['sales_velocity_per_month'] or 1.0, 
                unit['sales_start_month_offset'] or 0
            ) 
            avg_price = float(unit['avg_price'] or 0)
            
            for m_idx, units_sold in enumerate(absorption):
                income_by_month[m_idx] = income_by_month.get(m_idx, 0.0) + (units_sold * avg_price)
                max_month = max(max_month, m_idx)
                
        # 2. Calculate Monthly Costs from Line Items
        costs_by_month = {}
        for item in costs:
            dist = item['distribution_curve'] or 'linear'
            total = float(item['total_estimated'] or 0)
            duration = item['duration_months'] or 1
            offset = item['start_month_offset'] or 0
            
            monthly_dist = []
            if dist == 's-curve':
                monthly_dist = FinancialEngine.distribute_s_curve(total, duration, offset)
            else: # default linear
                val = total / duration
                monthly_dist = [0.0] * offset + [val] * duration
                
            for m_idx, cost_val in enumerate(monthly_dist):
                costs_by_month[m_idx] = costs_by_month.get(m_idx, 0.0) + cost_val
                max_month = max(max_month, m_idx)
                
        # 3. Calculate Final Metrics for Intelligence
        full_cash_flow_temp = []
        max_month_loop = max_month
        for m in range(max_month_loop + 1):
            full_cash_flow_temp.append(income_by_month.get(m, 0.0) - costs_by_month.get(m, 0.0))

        metrics = FinancialEngine.calculate_metrics(full_cash_flow_temp)
        
        # 4. Generate AI Intelligence Analysis
        analysis = await brain.get_strategic_analysis(
            metrics, 
            data['scenario']['name'] or "Scenario Unnamed",
            costs
        )
        health_score = brain.calculate_project_health_score(metrics)
        intelligence_data = {
            "health_score": health_score,
            "strategic_analysis": analysis
        }

        # 5. Prepare Batch Data for Report
        report_data = []
        for m in range(max_month + 1):
            income = income_by_month.get(m, 0.0)
            cost = costs_by_month.get(m, 0.0)
            report_date = (base_date + timedelta(days=30*m)).replace(day=1)
            
            report_data.append({
                "index": m,
                "date": report_date,
                "income": income,
                "costs": cost,
                "net_flow": income - cost
            })
            
        # 6. Save to Database (including AI data)
        update_cashflow_report(scenario_id, report_data, intelligence_data)
        
        return {
            "status": "success",
            "message": f"Scenario {scenario_id} recalculated successfully",
            "metrics": metrics,
            "intelligence": intelligence_data,
            "months_calculated": max_month + 1
        }
        
    except Exception as e:
        print(f"Calculation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
