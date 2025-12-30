
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
    children?: ReactNode;
    className?: string;
    title?: string | ReactNode;
    description?: string | ReactNode;
    header?: ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
}

export const BentoCard = ({
    className,
    title,
    description,
    header,
    icon,
    children,
    onClick,
}: BentoCardProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 w-full h-full flex flex-col space-y-4 glass-card cursor-pointer relative overflow-hidden",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10 h-full flex flex-col">
                {icon}
                {children || (
                    <div className="mt-auto">
                        <div className="font-bold font-sans text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                            {title}
                        </div>
                        <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
                            {description}
                        </div>
                    </div>
                )}
            </div>

            {/* Subtle Aura/Glow Effect on Hover */}
            <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary-glow)] rounded-full blur-3xl opacity-0 group-hover/bento:opacity-20 transition-opacity duration-500 pointer-events-none" />
        </div>
    );
};
