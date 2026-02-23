import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Mapeamento Supabase -> App
function mapFarmacia(row: any) {
    return {
        id: row.id,
        nomeFarmacia: row.nome_farmacia,
        responsavelNome: row.responsavel_nome ?? "",
        whatsapp: row.whatsapp ?? "",
        cidade: row.cidade ?? "",
        uf: row.uf ?? "",
        instagram: row.instagram ?? "",
        siteUrl: row.site_url ?? null,
        temEntrega: row.tem_entrega ?? false,
        jaInvestiuTrafego: row.ja_investiu_trafego ?? false,
        entregaFaturamento: row.entrega_faturamento ?? null,
        statusMarketing: row.status_marketing ?? "waiting_access",
        prioridade: row.prioridade ?? "medium",
        criadoEm: row.criado_em,
        atualizadoEm: row.atualizado_em,
    };
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await supabase
        .from("farmacias")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Farmácia não encontrada" }, { status: 404 });
    }

    return NextResponse.json(mapFarmacia(data));
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();

    // Mapeamento camelCase -> snake_case para o Supabase
    const payload: any = {};
    if (body.nomeFarmacia !== undefined) payload.nome_farmacia = body.nomeFarmacia;
    if (body.responsavelNome !== undefined) payload.responsavel_nome = body.responsavelNome;
    if (body.whatsapp !== undefined) payload.whatsapp = body.whatsapp;
    if (body.cidade !== undefined) payload.cidade = body.cidade;
    if (body.uf !== undefined) payload.uf = body.uf;
    if (body.instagram !== undefined) payload.instagram = body.instagram;
    if (body.siteUrl !== undefined) payload.site_url = body.siteUrl;
    if (body.temEntrega !== undefined) payload.tem_entrega = body.temEntrega;
    if (body.jaInvestiuTrafego !== undefined) payload.ja_investiu_trafego = body.jaInvestiuTrafego;
    if (body.entregaFaturamento !== undefined) payload.entrega_faturamento = body.entregaFaturamento;
    if (body.statusMarketing !== undefined) payload.status_marketing = body.statusMarketing;
    if (body.prioridade !== undefined) payload.prioridade = body.prioridade;

    const { data, error } = await supabase
        .from("farmacias")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapFarmacia(data));
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await supabase
        .from("farmacias")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
