
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type MessageType = 'success' | 'error' | 'info';

interface Props {
    type: MessageType;
    message: string;
    onDismiss?: () => void;
    autoDismiss?: number; /* ms — 0 = não dispensa */
}

const configs: Record<MessageType, {
    icon: any;
    bg: string;
    border: string;
    text: string;
    iconCls: string;
}> = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-emerald-500/[0.07] dark:bg-emerald-500/[0.10]',
        border: 'border-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        iconCls: 'text-emerald-500',
    },
    error: {
        icon: AlertCircle,
        bg: 'bg-red-500/[0.07] dark:bg-red-500/[0.10]',
        border: 'border-red-500/20',
        text: 'text-red-700 dark:text-red-400',
        iconCls: 'text-red-500',
    },
    info: {
        icon: Info,
        bg: 'bg-[#0071E3]/[0.07] dark:bg-[#0A84FF]/[0.10]',
        border: 'border-[#0071E3]/20',
        text: 'text-[#0071E3] dark:text-[#0A84FF]',
        iconCls: 'text-[#0071E3] dark:text-[#0A84FF]',
    },
};

export function FormMessage({ type, message, onDismiss, autoDismiss = 0 }: Props) {
    const [visible, setVisible] = useState(true);
    const cfg = configs[type];
    const Icon = cfg.icon;

    useEffect(() => {
        setVisible(true);
        if (autoDismiss > 0) {
            const t = setTimeout(() => {
                setVisible(false);
                setTimeout(() => onDismiss?.(), 300);
            }, autoDismiss);
            return () => clearTimeout(t);
        }
    }, [message, autoDismiss]);

    return (
        <div className={cn(
            'flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold',
            'transition-all duration-300',
            cfg.bg, cfg.border, cfg.text,
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1',
        )}>
            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', cfg.iconCls)} />
            <p className="flex-1 text-[12px] leading-relaxed">{message}</p>
            {onDismiss && (
                <button
                    onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
                    className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
