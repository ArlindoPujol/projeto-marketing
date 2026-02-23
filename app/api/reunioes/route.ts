import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Mapeamento: Supabase pode usar "titulo"/"observacoes" ou "pauta"/"resumo"/"proximos_passos"
// Adaptamos para suportar ambos e evitar perda de dados
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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const farmaciaId = searchParams.get("farmaciaId");

    let query = supabase
        .from("reunioes")
        .select("*")
        .order("data", { ascending: false });

    if (farmaciaId) {
        query = query.eq("farmacia_id", farmaciaId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data ?? []).map(mapReuniao));
}

export async function POST(request: Request) {
    const body = await request.json();

    // Compatibilidade: tenta salvar nos campos novos e nos antigos (o Supabase ignorará o que não existir)
    const payload: any = {
        farmacia_id: body.farmaciaId,
        data: body.data
            ? new Date(body.data).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        // Campos novos (preferencial)
        pauta: body.pauta ?? "",
        resumo: body.resumo ?? "",
        proximos_passos: body.proximosPassos ?? "",
        // Campos legados
        titulo: body.pauta ?? "",
        observacoes: [body.resumo, body.proximosPassos].filter(Boolean).join("\n\n---\n\n")
    };

    const { data, error } = await supabase
        .from("reunioes")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        // Se der erro de coluna não encontrada, tenta apenas o formato legado
        if (error.code === '42703') {
            const legacyPayload = {
                farmacia_id: body.farmaciaId,
                data: payload.data,
                titulo: body.pauta ?? "",
                observacoes: payload.observacoes
            };
            const { data: d2, error: e2 } = await supabase.from("reunioes").insert(legacyPayload).select("*").single();
            if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
            return NextResponse.json(mapReuniao(d2));
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapReuniao(data));
}

