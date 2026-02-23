import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();

    const payload: Record<string, any> = {};
    if (body.data !== undefined) payload.data = new Date(body.data).toISOString().split("T")[0];
    if (body.pauta !== undefined) payload.titulo = body.pauta;
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
