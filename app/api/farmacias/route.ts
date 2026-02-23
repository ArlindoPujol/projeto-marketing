import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// snake_case (Supabase) -> camelCase (seu app)
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

// camelCase (seu app) -> snake_case (Supabase)
function mapToSupabase(body: any) {
    return {
        nome_farmacia: body.nomeFarmacia || null,
        responsavel_nome: body.responsavelNome || null,
        whatsapp: body.whatsapp || null,
        cidade: body.cidade || null,
        uf: body.uf || null,
        endereco: body.endereco || null,
        instagram: body.instagram || null,
        facebook: body.facebook || null,
        google_my_business: body.googleMyBusiness || null,
        site_url: body.siteUrl || null,
        tem_entrega: !!body.temDelivery,
        entrega_faturamento: body.faturamentoDeliveryMensal != null ? Number(body.faturamentoDeliveryMensal) : null,
        numero_pedidos: body.numeroPedidos || null,
        ja_investiu_trafego: !!body.jaInvestiuTrafego,
        quem_fazia_trafego: body.quemFaziaTrafego || null,
        quanto_investia: body.quantoInvestia != null ? Number(body.quantoInvestia) : null,
        onde_investia: body.ondeInvestia || null,
        tem_site: !!body.temSite,
        tem_ecommerce: !!body.temEcommerce,
        ecommerce_descricao: body.ecommerceDescricao || null,
        status_marketing: body.statusMarketing || "waiting_access",
        prioridade: body.prioridade || "medium",
        notas: body.notas || null,
        acessos_enviados_whatsapp: !!body.acessosEnviadosWhatsapp,
    };
}
const ALL_COLUMNS = "id, nome_farmacia, responsavel_nome, whatsapp, cidade, uf, endereco, instagram, facebook, google_my_business, site_url, tem_entrega, entrega_faturamento, numero_pedidos, ja_investiu_trafego, quem_fazia_trafego, quanto_investia, onde_investia, tem_site, tem_ecommerce, ecommerce_descricao, status_marketing, prioridade, notas, acessos_enviados_whatsapp, criado_em, atualizado_em, linkedin, youtube, website";

export async function GET() {
    const { data, error } = await supabase
        .from("farmacias")
        .select(ALL_COLUMNS)
        .order("criado_em", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data ?? []).map(mapFarmacia));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const payload = {
            nome_farmacia: body.nomeFarmacia,
            responsavel_nome: body.responsavelNome || null,
            whatsapp: body.whatsapp || null,
            cidade: body.cidade || null,
            uf: body.uf || null,
            endereco: body.endereco || null,
            instagram: body.instagram || null,
            facebook: body.facebook || null,
            google_my_business: body.googleMyBusiness || null,
            site_url: body.siteUrl || null,
            tem_entrega: !!body.temDelivery,
            entrega_faturamento: body.faturamentoDeliveryMensal != null ? Number(body.faturamentoDeliveryMensal) : null,
            numero_pedidos: body.numeroPedidos || null,
            ja_investiu_trafego: !!body.jaInvestiuTrafego,
            quem_fazia_trafego: body.quemFaziaTrafego || null,
            quanto_investia: body.quantoInvestia != null ? Number(body.quanto_investia) : null,
            onde_investia: body.ondeInvestia || null,
            tem_site: !!body.temSite,
            tem_ecommerce: !!body.temEcommerce,
            ecommerce_descricao: body.ecommerceDescricao || null,
            status_marketing: body.statusMarketing || "waiting_access",
            prioridade: body.prioridade || "medium",
            notas: body.notas || null,
            acessos_enviados_whatsapp: !!body.acessosEnviadosWhatsapp,
        };

        const { data, error } = await supabase
            .from("farmacias")
            .insert(payload)
            .select(ALL_COLUMNS)
            .single();

        if (error) {
            console.error('Supabase Error (POST):', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(mapFarmacia(data));
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

