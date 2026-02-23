
'use client';

import { useState } from 'react';
import { RefreshCcw, CheckCircle, AlertOctagon, Database, Sparkles } from 'lucide-react';

export default function SeedPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    async function handleSeed() {
        setStatus('loading');
        try {
            const res = await fetch('/api/seed');
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setMessage('Dados sincronizados com sucesso');
                setTimeout(() => {
                    window.location.href = '/farmacias';
                }, 2000);
            } else {
                setStatus('error');
                setMessage('Erro na sincronização');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Falha na comunicação');
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000">
            <div className="glass-card p-12 rounded-[3.5rem] shadow-sm max-w-xl w-full text-center space-y-10 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 p-12 opacity-[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none">
                    <Database className="h-48 w-48 text-blue-500" />
                </div>

                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600/5 flex items-center justify-center border border-blue-500/10 shadow-inner">
                    <RefreshCcw className={`h-8 w-8 text-blue-600 ${status === 'loading' ? 'animate-spin' : ''}`} />
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Mapeamento Inicial</p>
                    <h1 className="text-4xl font-black tracking-tightest text-gray-900 dark:text-white uppercase leading-none">
                        Popular Base <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400 text-3xl">de Inteligência</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 px-8 leading-relaxed italic">
                        Esta ação irá restabelecer os dados padrão do ecossistema, incluindo unidades de teste e templates estratégicos.
                    </p>
                </div>

                <button
                    onClick={handleSeed}
                    disabled={status === 'loading'}
                    className="group relative inline-flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                >
                    <Sparkles className="h-4 w-4" />
                    {status === 'loading' ? 'Sincronizando...' : 'Iniciar Sincronismo'}
                </button>

                {status === 'success' && (
                    <div className="flex items-center justify-center gap-3 p-4 bg-green-500/5 text-green-600 rounded-2xl border border-green-500/10 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>{message}</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center justify-center gap-3 p-4 bg-red-500/5 text-red-600 rounded-2xl border border-red-500/10 text-[10px] font-black uppercase tracking-widest">
                        <AlertOctagon className="h-4 w-4" />
                        <span>{message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
