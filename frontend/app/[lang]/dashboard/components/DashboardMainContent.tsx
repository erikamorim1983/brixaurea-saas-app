'use client';

import { useSidebar } from './SidebarContext';

export default function DashboardMainContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div
            className={`
                flex-1 flex flex-col transition-all duration-300
                ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}
            `}
        >
            {children}
        </div>
    );
}
