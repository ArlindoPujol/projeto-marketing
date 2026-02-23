import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Mapeamento: Supabase usa "titulo" e "observacoes"
// Frontend espera "pauta", "resumo", "proximosPassos"
// Adaptamos na API para compatibilidade sem alterar o banco
function mapReuniao(row: any) {
    return {
        id: row.id,
        farmaciaId: row.farmacia_id,
        data: row.data,
        pauta: row.titulo ?? "",
        resumo: row.observacoes ?? "",
        proximosPassos: "",
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

    // Concatenar resumo e próximos passos em observacoes se necessário
    const observacoes = [body.resumo, body.proximosPassos]
        .filter(Boolean)
        .join("\n\n---\n\n") || "";

    const { data, error } = await supabase
        .from("reunioes")
        .insert({
            farmacia_id: body.farmaciaId,
            data: body.data
                ? new Date(body.data).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            titulo: body.pauta ?? "",
            observacoes: observacoes,
        })
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapReuniao(data));
}
