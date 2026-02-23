import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();

    const payload: Record<string, any> = {};
    if (body.concluido !== undefined) payload.concluido = body.concluido;
    if (body.evidenciaTexto !== undefined) payload.evidencia_texto = body.evidenciaTexto;
    if (body.observacao !== undefined) payload.observacao = body.observacao;

    const { data, error } = await supabase
        .from("playbook_run_itens")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        id: data.id,
        runId: data.run_id,
        templateItemId: data.template_item_id,
        concluido: data.concluido,
        evidenciaTexto: data.evidencia_texto,
        observacao: data.observacao,
    });
}
