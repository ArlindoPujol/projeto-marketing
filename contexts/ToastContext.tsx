
'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── tipos ─────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastCtx {
    toast: (message: string, type?: ToastType) => void;
}

/* ── context ────────────────────────────────────────── */
const ToastContext = createContext<ToastCtx>({ toast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

/* ── ícones e estilos por tipo ───────────────────────── */
const config: Record<ToastType, { icon: any; cls: string; iconCls: string }> = {
    success: {
        icon: CheckCircle2,
        cls: 'border-emerald-500/25 bg-emerald-500/8 dark:bg-emerald-500/10',
        iconCls: 'text-emerald-500',
    },
    error: {
        icon: AlertTriangle,
        cls: 'border-red-500/25 bg-red-500/8 dark:bg-red-500/10',
        iconCls: 'text-red-500',
    },
    info: {
        icon: Info,
        cls: 'border-blue-500/25 bg-blue-500/8 dark:bg-blue-500/10',
        iconCls: 'text-blue-500',
    },
};

/* ── provider ────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        clearTimeout(timers.current[id]);
        delete timers.current[id];
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev.slice(-4), { id, message, type }]); // máx 5 toasts
        timers.current[id] = setTimeout(() => dismiss(id), 3500);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Portal de toasts */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => {
                    const { icon: Icon, cls, iconCls } = config[t.type];
                    return (
                        <div
                            key={t.id}
                            className={cn(
                                'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg',
                                'backdrop-filter backdrop-blur-xl',
                                'animate-in slide-in-from-right-4 fade-in duration-300',
                                /* Light */
                                'bg-white/90',
                                /* Dark */
                                'dark:bg-gray-900/90',
                                cls,
                            )}
                            style={{ minWidth: 260, maxWidth: 380 }}
                        >
                            <Icon className={cn('h-4 w-4 shrink-0', iconCls)} />
                            <p className="flex-1 text-[12px] font-semibold text-gray-900 dark:text-white leading-snug">
                                {t.message}
                            </p>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="shrink-0 p-0.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
