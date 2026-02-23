import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();

    const payload: Record<string, any> = {};
    if (body.titulo !== undefined) payload.titulo = body.titulo;
    if (body.descricao !== undefined) payload.descricao = body.descricao;
    if (body.status !== undefined) payload.status = body.status;
    if (body.vencimento !== undefined) payload.vencimento = body.vencimento;

    const { data, error } = await supabase
        .from("tarefas")
        .update(payload)
        .eq("id", id)
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await supabase
        .from("tarefas")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
