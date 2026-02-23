import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const farmaciaId = searchParams.get("farmaciaId");

    let query = supabase
        .from("acessos")
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
            tipo: row.tipo ?? "",
            status: row.status ?? "pendente",
            observacao: row.observacao ?? "",
        }))
    );
}

export async function POST(request: Request) {
    const body = await request.json();

    const { data, error } = await supabase
        .from("acessos")
        .insert({
            farmacia_id: body.farmaciaId,
            tipo: body.tipo,
            status: body.status ?? "pendente",
            observacao: body.observacao ?? "",
        })
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        farmaciaId: data.farmacia_id,
        tipo: data.tipo,
        status: data.status,
        observacao: data.observacao,
    });
}
