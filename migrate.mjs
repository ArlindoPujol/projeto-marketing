import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Nota: Usando node --env-file=.env.local para carregar as variáveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL ou Key não encontradas no ambiente.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
    console.log('🚀 Iniciando migração de dados...');

    const dbPath = path.join(process.cwd(), 'data.json');
    if (!fs.existsSync(dbPath)) {
        console.error('❌ data.json não encontrado.');
        return;
    }

    let db;
    try {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (e) {
        console.error('❌ Erro ao ler data.json:', e.message);
        return;
    }

    // 1. Farmácias
    if (db.farmacias?.length > 0) {
        console.log(`📌 Migrando ${db.farmacias.length} farmácias...`);
        const { error: fErr } = await supabase.from('farmacias').upsert(db.farmacias);
        if (fErr) console.error('❌ Erro farmácias:', fErr.message);
        else console.log('✅ Farmácias ok!');
    }

    // 2. Tarefas
    if (db.tarefas?.length > 0) {
        console.log(`📌 Migrando ${db.tarefas.length} tarefas...`);
        const { error: tErr } = await supabase.from('tarefas').upsert(db.tarefas);
        if (tErr) console.error('❌ Erro tarefas:', tErr.message);
        else console.log('✅ Tarefas ok!');
    }

    // 3. Reuniões
    if (db.reunioes?.length > 0) {
        console.log(`📌 Migrando ${db.reunioes.length} reuniões...`);
        const { error: rErr } = await supabase.from('reunioes').upsert(db.reunioes);
        if (rErr) console.error('❌ Erro reuniões:', rErr.message);
        else console.log('✅ Reuniões ok!');
    }

    console.log('🏁 Migração concluída!');
}

migrate();
