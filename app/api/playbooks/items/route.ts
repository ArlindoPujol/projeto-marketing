import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get("runId");

    let query = supabase.from("playbook_run_itens").select("*");

    if (runId) {
        query = query.eq("run_id", runId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        (data ?? []).map((item: any) => ({
            id: item.id,
            runId: item.run_id,
            templateItemId: item.template_item_id,
            concluido: item.concluido,
            evidenciaTexto: item.evidencia_texto,
            observacao: item.observacao,
        }))
    );
}
