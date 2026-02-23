import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const farmaciaId = searchParams.get("farmaciaId");

    let query = supabase
        .from("tarefas")
        .select("*")
        .order("criado_em", { ascending: false });

    if (farmaciaId) {
        query = query.eq("farmacia_id", farmaciaId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        (data ?? []).map((row: any) => ({
            id: row.id,
            farmaciaId: row.farmacia_id,
            titulo: row.titulo ?? "",
            descricao: row.descricao ?? "",
            status: row.status ?? "pendente",
            vencimento: row.vencimento ?? null,
        }))
    );
}

export async function POST(request: Request) {
    const body = await request.json();

    const { data, error } = await supabase
        .from("tarefas")
        .insert({
            farmacia_id: body.farmaciaId,
            titulo: body.titulo,
            descricao: body.descricao ?? "",
            status: body.status ?? "pendente",
            vencimento: body.vencimento ?? null,
        })
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        farmaciaId: data.farmacia_id,
        titulo: data.titulo,
        descricao: data.descricao,
        status: data.status,
        vencimento: data.vencimento,
    });
}
