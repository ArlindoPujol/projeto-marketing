
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Tipos ─────────────────────────────────────────────── */
interface ConfirmOptions {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
    resolve: (value: boolean) => void;
}

/* ── Context ─────────────────────────────────────────── */
const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(() => Promise.resolve(false));

export function useConfirm() {
    return useContext(ConfirmContext);
}

/* ── Provider ──────────────────────────────────────────── */
export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmState | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            setState({ ...opts, resolve });
        });
    }, []);

    function respond(value: boolean) {
        state?.resolve(value);
        setState(null);
    }

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state && <ConfirmModal state={state} onRespond={respond} />}
        </ConfirmContext.Provider>
    );
}

/* ── Modal ────────────────────────────────────────────── */
const variantConfig = {
    danger: {
        iconBg: 'bg-red-500/10 dark:bg-red-500/15',
        iconCls: 'text-red-500',
        icon: Trash2,
        btnCls: 'bg-red-500 hover:bg-red-600 active:scale-[0.97] shadow-[0_1px_3px_rgba(239,68,68,0.35)]',
    },
    warning: {
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
        iconCls: 'text-amber-500',
        icon: AlertTriangle,
        btnCls: 'bg-amber-500 hover:bg-amber-600 active:scale-[0.97] shadow-[0_1px_3px_rgba(245,158,11,0.35)]',
    },
    info: {
        iconBg: 'bg-[#0071E3]/10 dark:bg-[#0A84FF]/15',
        iconCls: 'text-[#0071E3] dark:text-[#0A84FF]',
        icon: AlertTriangle,
        btnCls: 'bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.97] dark:bg-[#0A84FF] shadow-[0_1px_3px_rgba(0,113,227,0.35)]',
    },
};

function ConfirmModal({
    state, onRespond,
}: {
    state: ConfirmState;
    onRespond: (v: boolean) => void;
}) {
    const variant = state.variant ?? 'danger';
    const cfg = variantConfig[variant];
    const Icon = cfg.icon;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9990] bg-black/30 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={() => onRespond(false)}
            />

            {/* Modal — Apple sheet centralized */}
            <div className="fixed inset-0 z-[9991] flex items-center justify-center p-4 pointer-events-none">
                <div className={cn(
                    'pointer-events-auto w-full max-w-[360px] rounded-2xl border overflow-hidden',
                    'animate-in fade-in zoom-in-95 duration-200',
                    /* Light */
                    'bg-white/98 border-black/[0.07]',
                    /* Dark */
                    'dark:bg-[#1C1C1E]/98 dark:border-white/[0.10]',
                    /* Sombra Apple */
                    'shadow-[0_20px_60px_-10px_rgba(0,0,0,0.22),0_6px_20px_-4px_rgba(0,0,0,0.14),0_0_0_0.5px_rgba(0,0,0,0.07)]',
                    'dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.75),0_6px_24px_-4px_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.06)]',
                )}>

                    {/* Body */}
                    <div className="px-6 pt-7 pb-5 text-center">

                        {/* Ícone */}
                        <div className={cn(
                            'h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4',
                            cfg.iconBg,
                        )}>
                            <Icon className={cn('h-5.5 w-5.5', cfg.iconCls)} style={{ width: 22, height: 22 }} />
                        </div>

                        {/* Título */}
                        <h3 className="text-[15px] font-bold text-[#1C1C1E] dark:text-white leading-snug mb-2">
                            {state.title}
                        </h3>

                        {/* Mensagem */}
                        {state.message && (
                            <p className="text-[13px] text-[#636366] dark:text-[#8E8E93] leading-relaxed">
                                {state.message}
                            </p>
                        )}
                    </div>

                    {/* Separador */}
                    <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

                    {/* Botões — estilo iOS action sheet */}
                    <div className="flex">
                        {/* Cancelar */}
                        <button
                            onClick={() => onRespond(false)}
                            className={cn(
                                'flex-1 py-3.5 text-[14px] font-semibold transition-colors',
                                'text-[#636366] dark:text-[#8E8E93]',
                                'hover:bg-black/[0.03] dark:hover:bg-white/[0.05]',
                                'border-r border-black/[0.06] dark:border-white/[0.08]',
                            )}
                        >
                            {state.cancelLabel ?? 'Cancelar'}
                        </button>

                        {/* Confirmar */}
                        <button
                            autoFocus
                            onClick={() => onRespond(true)}
                            className={cn(
                                'flex-1 py-3.5 text-[14px] font-bold transition-all text-white',
                                cfg.btnCls,
                            )}
                        >
                            {state.confirmLabel ?? 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
