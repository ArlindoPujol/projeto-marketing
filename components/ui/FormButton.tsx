
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';

type State = 'idle' | 'loading' | 'success' | 'error';
type Variant = 'primary' | 'danger';

interface Props {
    state?: State;
    variant?: Variant;
    idleLabel?: string;
    loadingLabel?: string;
    successLabel?: string;
    errorLabel?: string;
    type?: 'submit' | 'button';
    onClick?: () => void;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

const sizeMap = {
    sm: 'h-8  px-4 text-[10px] gap-1.5 rounded-xl',
    md: 'h-10 px-6 text-[11px] gap-2   rounded-xl',
    lg: 'h-11 px-8 text-[11px] gap-2   rounded-2xl',
};

export function FormButton({
    state = 'idle',
    variant = 'primary',
    idleLabel = 'Salvar',
    loadingLabel = 'Salvando…',
    successLabel = 'Salvo!',
    errorLabel = 'Erro — tente novamente',
    type = 'submit',
    onClick,
    fullWidth = false,
    size = 'md',
    className,
    disabled,
    icon,
}: Props) {

    const isLoading = state === 'loading';
    const isSuccess = state === 'success';
    const isError = state === 'error';
    const isIdle = state === 'idle';

    const base = cn(
        'relative inline-flex items-center justify-center font-bold uppercase tracking-[0.08em] transition-all duration-300 select-none',
        sizeMap[size],
        fullWidth && 'w-full',
        /* disabled states */
        (isLoading || disabled) && 'opacity-60 cursor-not-allowed pointer-events-none',
        isSuccess && 'pointer-events-none',
    );

    const colorMap: Record<string, string> = {
        'primary-idle': 'bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.97] text-white shadow-[0_1px_3px_rgba(0,113,227,0.30),0_0_0_0.5px_rgba(0,113,227,0.20)]',
        'primary-loading': 'bg-[#0071E3]/80 text-white',
        'primary-success': 'bg-emerald-500 text-white shadow-[0_1px_3px_rgba(16,185,129,0.30)]',
        'primary-error': 'bg-red-500 text-white shadow-[0_1px_3px_rgba(239,68,68,0.30)]',
        'danger-idle': 'bg-red-500 hover:bg-red-600 active:scale-[0.97] text-white shadow-[0_1px_3px_rgba(239,68,68,0.30)]',
        'danger-loading': 'bg-red-500/80 text-white',
        'danger-success': 'bg-emerald-500 text-white',
        'danger-error': 'bg-red-600 text-white',
    };

    const colorClass = colorMap[`${variant}-${state}`] ?? colorMap[`${variant}-idle`];

    const renderContent = () => {
        if (isLoading) return (
            <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {loadingLabel}
            </>
        );
        if (isSuccess) return (
            <>
                <Check className="h-3.5 w-3.5" />
                {successLabel}
            </>
        );
        if (isError) return (
            <>
                <AlertCircle className="h-3.5 w-3.5" />
                {errorLabel}
            </>
        );
        return (
            <>
                {icon ?? <Save className="h-3.5 w-3.5" />}
                {idleLabel}
            </>
        );
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={cn(base, colorClass, className)}
        >
            {renderContent()}
        </button>
    );
}
