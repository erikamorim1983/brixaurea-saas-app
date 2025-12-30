// @ts-nocheck
'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    ComposedChart
} from 'recharts';

// Data derived from User's Excel (The Cove)
const monthlyCashflowData = [
    { month: 'Jan-26', sales: 0, costs: 148, cumulative: -148 },
    { month: 'Feb-26', sales: 0, costs: 148, cumulative: -296 },
    { month: 'Mar-26', sales: 2467, costs: 2319, cumulative: -148 },
    { month: 'Apr-26', sales: 0, costs: 297, cumulative: -445 },
    { month: 'May-26', sales: 148, costs: 446, cumulative: -743 },
    { month: 'Jun-26', sales: 0, costs: 595, cumulative: -1338 },
    { month: 'Jul-26', sales: 148, costs: 743, cumulative: -1933 },
    { month: 'Aug-26', sales: 148, costs: 892, cumulative: -2677 },
    { month: 'Sep-26', sales: 148, costs: 1041, cumulative: -3570 },
    { month: 'Oct-26', sales: 148, costs: 1041, cumulative: -4463 },
    { month: 'Nov-26', sales: 148, costs: 1041, cumulative: -5356 },
    { month: 'Dec-26', sales: 148, costs: 892, cumulative: -6100 },
    { month: 'Jan-27', sales: 2467, costs: 743, cumulative: -4376 },
    { month: 'Feb-27', sales: 0, costs: 595, cumulative: -4971 },
    { month: 'Mar-27', sales: 2319, costs: 446, cumulative: -3098 },
    { month: 'Apr-27', sales: 2319, costs: 297, cumulative: -1076 },
    { month: 'May-27', sales: 2319, costs: 148, cumulative: 1095 },
    { month: 'Jun-27', sales: 2319, costs: 0, cumulative: 3414 },
    { month: 'Jul-27', sales: 2319, costs: 0, cumulative: 5733 },
    { month: 'Aug-27', sales: 1855, costs: 0, cumulative: 7588 },
];

export function JCurveChart() {
    return (
        <div className="h-[400px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cash Flow Exposure (J-Curve)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyCashflowData}>
                    <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" style={{ fontSize: '10px' }} stroke="#9ca3af" />
                    <YAxis
                        style={{ fontSize: '10px' }}
                        stroke="#9ca3af"
                        label={{ value: 'USD (000)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`$ ${value.toLocaleString()}k`, '']}
                    />
                    <Legend />
                    <Bar dataKey="costs" name="Monthly Costs" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.6} barSize={20} />
                    <Bar dataKey="sales" name="Sales Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.6} barSize={20} />
                    <Area
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative Cash Flow"
                        stroke="#0ea5e9"
                        fill="url(#colorCumulative)"
                        strokeWidth={3}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

const salesData = [
    { name: 'Unit 1A', price: 2467500 },
    { name: 'Unit 1B', price: 2467500 },
    { name: 'Unit 2A', price: 2319450 },
    { name: 'Unit 2B', price: 2319450 },
    { name: 'Unit 3A', price: 2180000 },
    { name: 'Unit 3B', price: 2180000 },
    { name: 'PH 1', price: 2950000 },
    { name: 'PH 2', price: 2856000 },
];

export function SalesAllocationChart() {
    return (
        <div className="h-[400px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Unit Pricing Strategy</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                    <XAxis type="number" style={{ fontSize: '10px' }} stroke="#9ca3af" hide />
                    <YAxis dataKey="name" type="category" style={{ fontSize: '11px' }} stroke="#4b5563" width={60} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`$ ${value.toLocaleString()}`, 'Price']}
                    />
                    <Bar dataKey="price" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function CostBreakdownChart() {
    const data = [
        { name: 'Land', value: 2500000, fill: '#6366f1' },
        { name: 'Hard Costs', value: 8500000, fill: '#ef4444' },
        { name: 'Soft Costs', value: 1200000, fill: '#f59e0b' },
        { name: 'Financing', value: 950000, fill: '#14b8a6' },
        { name: 'Impact Fees', value: 170000, fill: '#8b5cf6' },
    ];

    // Simple donut placeholder using SVG to avoid Circular dependency issues or complexity with PieChart labels alignment in a hurry
    return (
        <div className="h-[400px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cost Breakdown</h3>
            <div className="flex-1 flex items-center justify-center">
                {/* Recharts Pie would go here, using a simpler visual for reliability in first pass or adding later if needed */}
                <div className="text-center text-gray-400">
                    <p>Use Details Table</p>
                </div>
            </div>
        </div>
    )
}
