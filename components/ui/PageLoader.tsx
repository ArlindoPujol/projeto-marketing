
'use client';

import { cn } from '@/lib/utils';

interface Props {
    label?: string;
    className?: string;
}

/** Loading de página full-height — substitui os <div>Carregando...</div> */
export function PageLoader({ label = 'Carregando…', className }: Props) {
    return (
        <div className={cn('flex items-center justify-center min-h-[340px]', className)}>
            <div className="flex flex-col items-center gap-4">
                {/* Spinner Apple — anel fino com arco colorido */}
                <div className="relative h-9 w-9">
                    <div className="absolute inset-0 rounded-full border-[2px] border-[#1C1C1E]/[0.06] dark:border-white/[0.08]" />
                    <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-[#0071E3] dark:border-t-[#0A84FF] animate-spin" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8E8E93]">{label}</p>
            </div>
        </div>
    );
}

/** Esqueleto de linha único (para listas) */
export function SkeletonLine({ width = 'w-full', height = 'h-3' }: { width?: string; height?: string }) {
    return (
        <div className={cn('rounded-full bg-black/[0.05] dark:bg-white/[0.06] animate-pulse', width, height)} />
    );
}

/** Card de erro de carregamento */
export function LoadError({ message = 'Não foi possível carregar os dados.', onRetry }: { message?: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[260px] gap-4 text-center px-6">
            <div className="h-11 w-11 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>
            <div>
                <p className="text-[13px] font-bold text-[#1C1C1E] dark:text-white">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-3 text-[11px] font-bold text-[#0071E3] dark:text-[#0A84FF] hover:opacity-70 transition-opacity uppercase tracking-wide"
                    >
                        Tentar novamente
                    </button>
                )}
            </div>
        </div>
    );
}
