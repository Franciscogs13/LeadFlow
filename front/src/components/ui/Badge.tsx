import type { LeadStatus } from '../../types';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    status: LeadStatus;
}

export function StatusBadge({ status, className, ...props }: BadgeProps) {
    const getStatusColor = (s: LeadStatus) => {
        switch (s) {
            case 'Novo':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Em Contato':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Convertido':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                getStatusColor(status),
                className
            )}
            {...props}
        >
            {status}
        </span>
    );
}
