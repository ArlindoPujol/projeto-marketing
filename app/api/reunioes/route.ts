import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const farmaciaIdInput = searchParams.get("farmaciaId");

    try {
        let query = supabase.from('reunioes').select('*');

        if (farmaciaIdInput && farmaciaIdInput !== "global" && farmaciaIdInput !== "undefined") {
            const cleanId = decodeURIComponent(farmaciaIdInput).trim();
            query = query.eq('farmaciaId', cleanId);
        }

        const { data, error } = await query.order('data', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const farmaciaId = body.farmaciaId ? decodeURIComponent(String(body.farmaciaId)).trim() : null;

        if (!farmaciaId) {
            return NextResponse.json({ error: "farmaciaId é obrigatório" }, { status: 400 });
        }

        const novaReuniao = {
            id: generateId(),
            farmaciaId,
            data: body.data || new Date().toISOString().split("T")[0],
            pauta: body.pauta || "Reunião Sem Título",
            resumo: body.resumo || "",
            proximosPassos: body.proximosPassos || "",
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('reunioes')
            .insert([novaReuniao])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
