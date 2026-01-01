'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    isCollapsed: boolean;
    toggleSidebar: () => void;
    toggleCollapse: () => void;
    closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false); // For mobile overlay
    const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed by default

    useEffect(() => {
        // Set initial collapsed state based on screen size
        const handleResize = () => {
            const width = window.innerWidth;
            // Keep collapsed by default on all sizes md+
            if (width >= 768) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    const closeSidebar = () => setIsOpen(false);

    return (
        <SidebarContext.Provider value={{
            isOpen,
            isCollapsed,
            toggleSidebar,
            toggleCollapse,
            closeSidebar
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider');
    }
    return context;
}
