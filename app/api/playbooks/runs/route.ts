import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const farmaciaId = searchParams.get("farmaciaId");

    let query = supabase
        .from("playbook_runs")
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
            templateId: row.template_id,
            status: row.status ?? "running",
            criadoEm: row.criado_em,
        }))
    );
}

export async function POST(request: Request) {
    const { farmaciaId, templateId } = await request.json();

    // Busca o template com seus itens
    const { data: template, error: tplErr } = await supabase
        .from("playbook_templates")
        .select("*, playbook_template_itens(*)")
        .eq("id", templateId)
        .single();

    if (tplErr || !template) {
        return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
    }

    // Cria o run
    const { data: run, error: runErr } = await supabase
        .from("playbook_runs")
        .insert({
            farmacia_id: farmaciaId,
            template_id: templateId,
            status: "running",
        })
        .select("*")
        .single();

    if (runErr || !run) {
        return NextResponse.json({ error: runErr?.message }, { status: 500 });
    }

    // Cria os itens do run baseado nos itens do template
    const itensToInsert = (template.playbook_template_itens ?? []).map((item: any) => ({
        run_id: run.id,
        template_item_id: item.id,
        concluido: false,
        evidencia_texto: "",
        observacao: "",
    }));

    const { data: items, error: itemsErr } = await supabase
        .from("playbook_run_itens")
        .insert(itensToInsert)
        .select("*");

    if (itemsErr) {
        return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json({
        run: {
            id: run.id,
            farmaciaId: run.farmacia_id,
            templateId: run.template_id,
            status: run.status,
            criadoEm: run.criado_em,
        },
        items: (items ?? []).map((item: any) => ({
            id: item.id,
            runId: item.run_id,
            templateItemId: item.template_item_id,
            concluido: item.concluido,
            evidenciaTexto: item.evidencia_texto,
            observacao: item.observacao,
        })),
    });
}
