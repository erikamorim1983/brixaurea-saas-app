'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ProjectTabsProps {
    lang: string;
    projectId: string;
    dictionary: any;
}

export default function ProjectTabs({ lang, projectId, dictionary }: ProjectTabsProps) {
    const pathname = usePathname();

    // Define Tabs based on structure
    // We assume the dictionary has analysis.tabs keys based on your pt.json
    // 1. Top Level Tabs
    const topTabs = [
        { key: 'overview', label: dictionary.analysis.tabs.overview, path: '' },
        { key: 'regional', label: dictionary.analysis.tabs.regional, path: '/feasibility/regional' },
        { key: 'feasibility', label: dictionary.analysis.tabs.feasibility, path: '/feasibility/land' }, // Default entry for Feasibility
    ];

    // 2. Sub Tabs (Only for Feasibility Group)
    const feasibilityTabs = [
        { key: 'land', label: dictionary.analysis.tabs.land, path: '/feasibility/land' },
        { key: 'schedule', label: dictionary.analysis.tabs.schedule || 'CRONOGRAMA', path: '/feasibility/schedule' },
        { key: 'project', label: dictionary.analysis.tabs.project || 'PROJETO', path: '/feasibility/project' },
        { key: 'unit_mix', label: dictionary.analysis.tabs.unit_mix, path: '/feasibility/units' },
        { key: 'sales', label: dictionary.analysis.tabs.sales || 'Vendas', path: '/feasibility/sales' },
        { key: 'costs', label: dictionary.analysis.tabs.costs, path: '/feasibility/costs' },
        { key: 'hard_costs', label: dictionary.analysis.tabs.hard_costs, path: '/feasibility/hard-costs' },
        { key: 'financials', label: dictionary.analysis.tabs.financials, path: '/feasibility/financial' },
        // Add placeholders for Construction & Financing if/when routes exist
    ];

    // Helper to determine active state
    // Note: pathname includes the locale (e.g. /en/dashboard/...)
    const getFullPath = (path: string) => `/${lang}/dashboard/projects/${projectId}${path}`;

    const isTopActive = (path: string) => {
        const fullPath = getFullPath(path);

        if (path === '') {
            // Exact match for root or /overview
            return pathname === fullPath || pathname === `${fullPath}/overview`;
        }

        // Special Case: Regional is top level, but technically under /feasibility path in FS if applicable
        if (path === '/feasibility/regional') {
            return pathname?.includes('/feasibility/regional');
        }

        // Special Case: Feasibility Group
        if (path === '/feasibility/land') {
            // Active if in feasibility tree, but NOT in regional
            return pathname?.includes('/feasibility') && !pathname?.includes('/feasibility/regional');
        }

        return pathname?.startsWith(fullPath);
    };

    const isSubActive = (path: string) => {
        const fullPath = getFullPath(path);
        return pathname?.startsWith(fullPath);
    }

    // Determine if we should show the sub-bar (User is in Feasibility Group)
    const showFeasibilitySubNav = pathname?.includes('/feasibility') && !pathname?.includes('/feasibility/regional');

    return (
        <div className="flex flex-col border-b border-gray-200 mb-6 bg-white">
            {/* LEVEL 1: Main Navigation */}
            <nav className="flex space-x-8 px-4 overflow-x-auto no-scrollbar" aria-label="Main Tabs">
                {topTabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={`/${lang}/dashboard/projects/${projectId}${tab.path}`}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${isTopActive(tab.path)
                                ? 'border-[#00D9FF] text-[#081F2E] font-bold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>

            {/* LEVEL 2: Feasibility Sub-Navigation */}
            {showFeasibilitySubNav && (
                <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-2 animate-fadeIn">
                    <nav className="flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Feasibility Tabs">
                        {feasibilityTabs.map((tab) => (
                            <Link
                                key={tab.key}
                                href={`/${lang}/dashboard/projects/${projectId}${tab.path}`}
                                className={`
                                    whitespace-nowrap py-2 px-1 text-xs uppercase font-bold tracking-wider transition-all
                                    ${isSubActive(tab.path)
                                        ? 'text-[#00D9FF] border-b-2 border-[#00D9FF]'
                                        : 'text-gray-400 hover:text-gray-700 hover:border-b-2 hover:border-gray-300 border-b-2 border-transparent'
                                    }
                                `}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

        </div >
    );
}
