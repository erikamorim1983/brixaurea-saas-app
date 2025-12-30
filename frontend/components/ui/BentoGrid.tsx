
import { cn } from "@/lib/utils";

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto auto-rows-[20rem]",
                className
            )}
        >
            {children}
        </div>
    );
};
