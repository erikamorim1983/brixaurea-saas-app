import os
from google import generativeai as genai
from typing import Dict, List
from finance_engine import FinancialEngine

class IntelligenceBrain:
    """
    The Intelligence behind BrixAurea. 
    Combines precise financial math with Generative AI for strategic insights.
    """
    
    def __init__(self):
        # Configure Gemini
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def get_strategic_analysis(self, metrics: Dict, scenario_name: str, costs: List[Dict]):
        """
        Takes raw financial metrics and returns a strategic paragraph.
        This is the "Brain" that learns from the data.
        """
        if not self.model:
            return "Intelligence Engine currently offline. Please check API configuration."

        # Prepare context for the AI
        cost_summary = ", ".join([f"{c['item_name']}: ${float(c['total_estimated']):,.2f}" for c in costs[:5]])
        
        prompt = f"""
        Analyze the following real estate development scenario: '{scenario_name}'.
        Key Financial Metrics:
        - Annualized IRR: {metrics['irr']:.2%},
        - NPV: ${metrics['npv']:,.2f},
        - ROI: {metrics['roi']:.2f}x.
        
        Top Cost Items: {cost_summary}.
        
        Task: 
        1. Identify 2 potential risks based on these numbers.
        2. Suggest one strategy to improve the IRR.
        3. Give a final 'Verdict' (Go/No-Go/Refine).
        
        Keep the tone executive, precise, and professional. Use Portuguese (BR).
        """
        
        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            return f"Error connecting to AI Brain: {str(e)}"

    def calculate_project_health_score(self, metrics: Dict) -> int:
        """
        A proprietary logic to score project health from 0-100.
        Learns from mathematical behavior.
        """
        score = 0
        
        # IRR contribution (Benchmark 15%)
        irr = metrics.get('irr', 0)
        if irr > 0.25: score += 40
        elif irr > 0.15: score += 30
        elif irr > 0.08: score += 15
        
        # ROI contribution (Benchmark 1.3x)
        roi = metrics.get('roi', 0)
        if roi > 1.5: score += 30
        elif roi > 1.25: score += 20
        elif roi > 1.1: score += 10
        
        # NPV contribution (Benchmark > 0)
        npv = metrics.get('npv', 0)
        if npv > 1000000: score += 30
        elif npv > 0: score += 20
        
        return min(score, 100)
