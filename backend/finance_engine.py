import numpy as np
import numpy_financial as npf
from datetime import datetime, date
from typing import List, Dict, Optional
import math

class FinancialEngine:
    """
    BrixAurea Ultra-High Performance Real Estate Financial Engine.
    Handles complex cash flow projections and viability metrics.
    """

    @staticmethod
    def calculate_absorption(total_units: int, velocity: float, start_month: int) -> List[float]:
        """Calculates units sold per month based on velocity."""
        if total_units <= 0: return []
        
        months = math.ceil(total_units / velocity) if velocity > 0 else 0
        absorption = [0.0] * (start_month + months)
        
        remaining = total_units
        for i in range(start_month, start_month + months):
            sold = min(remaining, velocity)
            absorption[i] = sold
            remaining -= sold
        return absorption

    @staticmethod
    def distribute_s_curve(total_amount: float, duration_months: int, start_month: int) -> List[float]:
        """
        Distributes costs using an S-Curve (Logistic distribution).
        Very common in construction for realistic cost ramp-up and ramp-down.
        """
        if duration_months <= 0: return []
        
        curve = [0.0] * (start_month + duration_months)
        x = np.linspace(-5, 5, duration_months)
        y = 1 / (1 + np.exp(-x)) # Logistic function
        
        # Calculate monthly deltas
        y_shifted = np.concatenate(([0], y))
        deltas = np.diff(y_shifted)
        # Normalize to ensure total_amount is exact
        normalized_deltas = deltas / np.sum(deltas)
        
        for i, val in enumerate(normalized_deltas):
            curve[start_month + i] = float(val * total_amount)
            
        return curve

    @staticmethod
    def calculate_metrics(cash_flow: List[float]) -> Dict:
        """Calculates IRR, NPV, and ROI."""
        if not cash_flow:
            return {"irr": 0, "npv": 0, "roi": 0}
            
        try:
            irr = npf.irr(cash_flow)
            # Default to 0 if IRR is NaN or string "NaN"
            irr = 0 if np.isnan(irr) else irr
            
            # Using 10% as default discount rate for NPV
            npv = npf.npv(0.1 / 12, cash_flow) 
            
            total_invested = abs(sum([x for x in cash_flow if x < 0]))
            total_returned = sum([x for x in cash_flow if x > 0])
            roi = (total_returned / total_invested) if total_invested > 0 else 0
            
            return {
                "irr": float(irr * 12), # Annualized
                "npv": float(npv),
                "roi": float(roi)
            }
        except:
            return {"irr": 0, "npv": 0, "roi": 0}

    @classmethod
    def compare_viability_vs_monitoring(cls, projected_flow: Dict[int, float], actual_flow: Dict[int, float], current_month: int) -> Dict:
        """
        The core engine for "Feasibility vs Monitoring".
        Merges actual data (past) with projected values (future) to recalculate the Final Outcome.
        """
        all_months = sorted(list(set(projected_flow.keys()) | set(actual_flow.keys())))
        if not all_months: return {}
        
        max_month = max(all_months)
        combined_flow = []
        
        for m in range(max_month + 1):
            if m < current_month:
                # Use actual data for the past
                combined_flow.append(actual_flow.get(m, 0.0))
            else:
                # Use projections for the future
                combined_flow.append(projected_flow.get(m, 0.0))
        
        # Original Metrics (Projected Only)
        orig_metrics = cls.calculate_metrics([projected_flow.get(m, 0.0) for m in range(max_month + 1)])
        # Real-time Metrics (Actuals + Remaining Projections)
        real_time_metrics = cls.calculate_metrics(combined_flow)
        
        return {
            "original_projections": orig_metrics,
            "real_time_performance": real_time_metrics,
            "variance": {
                "irr_delta": real_time_metrics["irr"] - orig_metrics["irr"],
                "npv_delta": real_time_metrics["npv"] - orig_metrics["npv"]
            }
        }
