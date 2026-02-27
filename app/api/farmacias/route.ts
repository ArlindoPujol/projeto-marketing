import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Farmacia } from "@/lib/db";

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('farmacias')
            .select('*')
            .order('nomeFarmacia', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const id = generateId();

        const novaFarmacia = {
            id,
            nomeFarmacia: body.nomeFarmacia,
            responsavelNome: body.responsavelNome || null,
            whatsapp: body.whatsapp || null,
            cidade: body.cidade || null,
            uf: body.uf || null,
            endereco: body.endereco || null,
            instagram: body.instagram || null,
            facebook: body.facebook || null,
            googleMyBusiness: body.googleMyBusiness || null,
            linkedin: body.linkedin || null,
            youtube: body.youtube || null,
            website: body.website || null,
            faturamentoDeliveryMensal: body.faturamentoDeliveryMensal || null,
            numeroPedidos: body.numeroPedidos || null,
            jaInvestiuTrafego: !!body.jaInvestiuTrafego,
            ondeInvestia: body.ondeInvestia || null,
            siteUrl: body.siteUrl || null,
            ecommerceDescricao: body.ecommerceDescricao || null,
            statusMarketing: body.statusMarketing || "waiting_access",
            prioridade: body.prioridade || "medium",
            notas: body.notas || null,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('farmacias')
            .insert([novaFarmacia])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
