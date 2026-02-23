import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// snake_case (Supabase) -> camelCase (seu app)
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

export async function GET() {
    const { data, error } = await supabase
        .from("farmacias")
        .select("*")
        .order("criado_em", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data ?? []).map(mapFarmacia));
}

export async function POST(request: Request) {
    const body = await request.json();

    // camelCase (seu app) -> snake_case (Supabase)
    const payload = {
        nome_farmacia: body.nomeFarmacia,
        responsavel_nome: body.responsavelNome ?? null,
        whatsapp: body.whatsapp ?? null,
        cidade: body.cidade ?? null,
        uf: body.uf ?? null,
        instagram: body.instagram ?? null,
        site_url: body.siteUrl ?? null,
        tem_entrega: body.temEntrega ?? false,
        ja_investiu_trafego: body.jaInvestiuTrafego ?? false,
        entrega_faturamento: body.entregaFaturamento ?? null,
        status_marketing: body.statusMarketing ?? "waiting_access",
        prioridade: body.prioridade ?? "medium",
    };

    const { data, error } = await supabase
        .from("farmacias")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mapFarmacia(data));
}