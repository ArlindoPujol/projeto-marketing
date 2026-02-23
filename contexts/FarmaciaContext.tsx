
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Farmacia } from '@/lib/db';

interface FarmaciaContextType {
    selectedFarmaciaId: string | 'global';
    setSelectedFarmaciaId: (id: string | 'global') => void;
    farmacias: Farmacia[];
    refreshFarmacias: () => Promise<void>;
}

const FarmaciaContext = createContext<FarmaciaContextType | undefined>(undefined);

export function FarmaciaProvider({ children }: { children: ReactNode }) {
    const [selectedFarmaciaId, setSelectedFarmaciaId] = useState<string | 'global'>('global');
    const [farmacias, setFarmacias] = useState<Farmacia[]>([]);

    const refreshFarmacias = useCallback(async () => {
        try {
            const res = await fetch('/api/farmacias', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setFarmacias(data);
            }
        } catch (error) {
            console.error('Erro ao buscar farmácias:', error);
        }
    }, []);

    // Busca inicial e recuperação do localStorage
    useEffect(() => {
        refreshFarmacias();
        const saved = localStorage.getItem('selectedFarmaciaId');
        if (saved) {
            setSelectedFarmaciaId(saved);
        }
    }, [refreshFarmacias]);

    // Persistência da seleção
    useEffect(() => {
        localStorage.setItem('selectedFarmaciaId', selectedFarmaciaId);
    }, [selectedFarmaciaId]);

    return (
        <FarmaciaContext.Provider value={{
            selectedFarmaciaId,
            setSelectedFarmaciaId,
            farmacias,
            refreshFarmacias
        }}>
            {children}
        </FarmaciaContext.Provider>
    );
}

export function useFarmacia() {
    const context = useContext(FarmaciaContext);
    if (context === undefined) {
        throw new Error('useFarmacia must be used within a FarmaciaProvider');
    }
    return context;
}
