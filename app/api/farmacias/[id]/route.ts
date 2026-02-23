import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Mapeamento Supabase -> App
function mapFarmacia(row: any) {
    if (!row) return null;
    return {
        id: row.id,
        nomeFarmacia: row.nome_farmacia || "",
        responsavelNome: row.responsavel_nome || "",
        whatsapp: row.whatsapp || "",
        cidade: row.cidade || "",
        uf: row.uf || "",
        endereco: row.endereco || "",
        instagram: row.instagram || "",
        facebook: row.facebook || "",
        googleMyBusiness: row.google_my_business || "",
        siteUrl: row.site_url || "",
        temDelivery: !!row.tem_entrega,
        faturamentoDeliveryMensal: row.entrega_faturamento != null ? Number(row.entrega_faturamento) : null,
        numeroPedidos: row.numero_pedidos || "",
        jaInvestiuTrafego: !!row.ja_investiu_trafego,
        quemFaziaTrafego: row.quem_fazia_trafego || "",
        quantoInvestia: row.quanto_investia != null ? Number(row.quanto_investia) : null,
        ondeInvestia: row.onde_investia || "",
        temSite: !!row.tem_site,
        temEcommerce: !!row.tem_ecommerce,
        ecommerceDescricao: row.ecommerce_descricao || "",
        statusMarketing: row.status_marketing || "waiting_access",
        prioridade: row.prioridade || "medium",
        notas: row.notas || "",
        acessosEnviadosWhatsapp: !!row.acessos_enviados_whatsapp,
        criadoEm: row.criado_em,
        atualizadoEm: row.atualizado_em,
    };
}

const ALL_COLUMNS = "id, nome_farmacia, responsavel_nome, whatsapp, cidade, uf, endereco, instagram, facebook, google_my_business, site_url, tem_entrega, entrega_faturamento, numero_pedidos, ja_investiu_trafego, quem_fazia_trafego, quanto_investia, onde_investia, tem_site, tem_ecommerce, ecommerce_descricao, status_marketing, prioridade, notas, acessos_enviados_whatsapp, criado_em, atualizado_em, linkedin, youtube, website";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data, error } = await supabase
        .from("farmacias")
        .select(ALL_COLUMNS)
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
    try {
        const body = await request.json();
        console.log(`[DEBUG] PUT Farmacias[${id}] - Body:`, body);

        const payload: any = {};
        if (body.nomeFarmacia !== undefined) payload.nome_farmacia = body.nomeFarmacia;
        if (body.responsavelNome !== undefined) payload.responsavel_nome = body.responsavelNome || null;
        if (body.whatsapp !== undefined) payload.whatsapp = body.whatsapp || null;
        if (body.cidade !== undefined) payload.cidade = body.cidade || null;
        if (body.uf !== undefined) payload.uf = body.uf || null;
        if (body.endereco !== undefined) payload.endereco = body.endereco || null;
        if (body.instagram !== undefined) payload.instagram = body.instagram || null;
        if (body.facebook !== undefined) payload.facebook = body.facebook || null;
        if (body.googleMyBusiness !== undefined) payload.google_my_business = body.googleMyBusiness || null;
        if (body.siteUrl !== undefined) payload.site_url = body.siteUrl || null;
        if (body.temDelivery !== undefined) payload.tem_entrega = !!body.temDelivery;
        if (body.faturamentoDeliveryMensal !== undefined) payload.entrega_faturamento = body.faturamentoDeliveryMensal != null ? Number(body.faturamentoDeliveryMensal) : null;
        if (body.numeroPedidos !== undefined) payload.numero_pedidos = body.numeroPedidos || null;
        if (body.jaInvestiuTrafego !== undefined) payload.ja_investiu_trafego = !!body.jaInvestiuTrafego;
        if (body.quemFaziaTrafego !== undefined) payload.quem_fazia_trafego = body.quemFaziaTrafego || null;
        if (body.quantoInvestia !== undefined) payload.quanto_investia = body.quantoInvestia != null ? Number(body.quantoInvestia) : null;
        if (body.ondeInvestia !== undefined) payload.onde_investia = body.ondeInvestia || null;
        if (body.temSite !== undefined) payload.tem_site = !!body.temSite;
        if (body.temEcommerce !== undefined) payload.tem_ecommerce = !!body.temEcommerce;
        if (body.ecommerceDescricao !== undefined) payload.ecommerce_descricao = body.ecommerceDescricao || null;
        if (body.statusMarketing !== undefined) payload.status_marketing = body.statusMarketing || "waiting_access";
        if (body.prioridade !== undefined) payload.prioridade = body.prioridade || "medium";
        if (body.notas !== undefined) payload.notas = body.notas || null;
        if (body.acessosEnviadosWhatsapp !== undefined) payload.acessos_enviados_whatsapp = !!body.acessosEnviadosWhatsapp;

        console.log(`[DEBUG] PUT Farmacias[${id}] - Payload para Supabase:`, payload);

        const { data, error } = await supabase
            .from("farmacias")
            .update(payload)
            .eq("id", id)
            .select(ALL_COLUMNS)
            .single();

        if (error) {
            console.error(`[DEBUG] PUT Farmacias[${id}] - Erro Supabase:`, error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[DEBUG] PUT Farmacias[${id}] - Resultado Supabase:`, data);
        return NextResponse.json(mapFarmacia(data));
    } catch (err: any) {
        console.error(`[DEBUG] PUT Farmacias[${id}] - Erro Fatal:`, err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
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
