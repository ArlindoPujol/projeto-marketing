import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
    const { data, error } = await supabase
        .from("playbook_templates")
        .select("*, playbook_template_itens(*)")
        .order("criado_em", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        (data ?? []).map((row: any) => ({
            id: row.id,
            titulo: row.titulo,
            categoria: row.categoria ?? "",
            descricao: row.descricao ?? "",
            itens: (row.playbook_template_itens ?? [])
                .sort((a: any, b: any) => a.ordem - b.ordem)
                .map((item: any) => ({
                    id: item.id,
                    titulo: item.titulo,
                    obrigatorio: item.obrigatorio ?? true,
                    ordem: item.ordem ?? 0,
                })),
        }))
    );
}
