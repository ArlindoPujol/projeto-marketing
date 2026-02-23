import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function mapReuniao(row: any) {
    const obs = row.observacoes || "";
    const [resumoPart, ...rest] = obs.split("\n\n---\n\n");

    return {
        id: row.id,
        farmaciaId: row.farmacia_id,
        data: row.data,
        pauta: row.pauta ?? row.titulo ?? "",
        resumo: row.resumo ?? resumoPart ?? "",
        proximosPassos: row.proximos_passos ?? rest.join("\n\n---\n\n") ?? "",
    };
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();

    const payload: Record<string, any> = {};
    if (body.data !== undefined) payload.data = new Date(body.data).toISOString().split("T")[0];

    // Tenta ambos os formatos
    if (body.pauta !== undefined) {
        payload.pauta = body.pauta;
        payload.titulo = body.pauta;
    }
    if (body.resumo !== undefined) payload.resumo = body.resumo;
    if (body.proximosPassos !== undefined) payload.proximos_passos = body.proximosPassos;

    if (body.resumo !== undefined || body.proximosPassos !== undefined) {
        payload.observacoes = [body.resumo, body.proximosPassos]
            .filter(Boolean)
            .join("\n\n---\n\n") || "";
    }

    const { data, error } = await supabase
        .from("reunioes")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        // Fallback para legado se colunas novas não existirem
        if (error.code === '42703') {
            const legacyPayload: any = {};
            if (body.data !== undefined) legacyPayload.data = payload.data;
            if (body.pauta !== undefined) legacyPayload.titulo = body.pauta;
            if (body.resumo !== undefined || body.proximosPassos !== undefined) {
                legacyPayload.observacoes = payload.observacoes;
            }
            const { data: d2, error: e2 } = await supabase.from("reunioes").update(legacyPayload).eq("id", id).select("*").single();
            if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
            return NextResponse.json(mapReuniao(d2));
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapReuniao(data));
}


export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await supabase
        .from("reunioes")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
