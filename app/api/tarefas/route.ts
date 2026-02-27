import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const farmaciaIdInput = searchParams.get("farmaciaId");

    try {
        let query = supabase.from('tarefas').select('*');

        if (farmaciaIdInput && farmaciaIdInput !== "global" && farmaciaIdInput !== "undefined") {
            const cleanId = decodeURIComponent(farmaciaIdInput).trim();
            query = query.eq('farmaciaId', cleanId);
        }

        const { data, error } = await query.order('vencimento', { ascending: true, nullsFirst: false });

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const farmaciaId = body.farmaciaId ? decodeURIComponent(String(body.farmaciaId)).trim() : null;

        if (!farmaciaId) {
            return NextResponse.json({ error: "farmaciaId é obrigatório" }, { status: 400 });
        }

        const novaTarefa = {
            id: generateId(),
            farmaciaId,
            titulo: body.titulo?.trim() || "Nova Tarefa",
            descricao: body.descricao || "",
            status: body.status || "todo",
            vencimento: body.vencimento && body.vencimento !== "" ? body.vencimento : null,
            prioridade: body.prioridade || "medium",
            notas: body.notas || "",
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('tarefas')
            .insert([novaTarefa])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
