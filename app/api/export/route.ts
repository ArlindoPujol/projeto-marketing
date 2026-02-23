import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    // ── Segurança: checar token ────────────────────────────
    const token = process.env.BACKUPEXPORT_TOKEN || process.env.BACKUP_TOKEN;

    if (!token) {
        return NextResponse.json(
            { error: 'Backup desabilitado. Defina a variável BACKUPEXPORT_TOKEN no servidor.' },
            { status: 503 },
        );
    }

    const authHeader = req.headers.get('authorization') ?? '';
    const provided = authHeader.replace('Bearer ', '').trim();

    if (provided !== token) {
        return NextResponse.json(
            { error: 'Token inválido.' },
            { status: 401 },
        );
    }

    // ── Lê o banco via Supabase ────────────────────────────
    try {
        const [
            { data: farmacias },
            { data: acessos },
            { data: tarefas },
            { data: reunioes },
            { data: playbookTemplates },
            { data: playbookRuns },
        ] = await Promise.all([
            supabase.from('farmacias').select('*'),
            supabase.from('acessos').select('*'),
            supabase.from('tarefas').select('*'),
            supabase.from('reunioes').select('*'),
            supabase.from('playbook_templates').select('*'),
            supabase.from('playbook_runs').select('*'),
        ]);

        const db = {
            farmacias: farmacias || [],
            acessos: acessos || [],
            tarefas: tarefas || [],
            reunioes: reunioes || [],
            playbookTemplates: playbookTemplates || [],
            playbookRuns: playbookRuns || [],
        };

        // ── Metadata de backup ────────────────────────────────
        const meta = {
            exportedAt: new Date().toISOString(),
            exportVersion: '2.0-supabase',
            counts: {
                farmacias: db.farmacias.length,
                tarefas: db.tarefas.length,
                reunioes: db.reunioes.length,
                acessos: db.acessos.length,
                playbookRuns: db.playbookRuns.length,
            },
        };

        return NextResponse.json(
            { meta, data: db },
            {
                status: 200,
                headers: {
                    'Content-Disposition': `attachment; filename="backup-supabase-${new Date().toISOString().slice(0, 10)}.json"`,
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
