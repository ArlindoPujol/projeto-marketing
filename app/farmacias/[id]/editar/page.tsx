
'use client';

import FarmaciaForm from '@/components/FarmaciaForm';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Farmacia } from '@/lib/db';
import { PageLoader, LoadError } from '@/components/ui/PageLoader';

export default function EditarFarmaciaPage() {
    const { id } = useParams() as { id: string };
    const [data, setData] = useState<Farmacia | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    function load() {
        setLoading(true);
        setError(false);
        fetch(`/api/farmacias/${id}`, { cache: 'no-store' })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(d => { setData(d); setLoading(false); })
            .catch(() => { setError(true); setLoading(false); });
    }


    useEffect(() => { load(); }, [id]);

    if (loading) return <PageLoader label="Carregando farmácia…" />;
    if (error || !data) return <LoadError message="Farmácia não encontrada ou falha ao carregar." onRetry={load} />;

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <FarmaciaForm initialData={data} />
        </div>
    );
}
