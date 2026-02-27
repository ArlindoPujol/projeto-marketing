import fs from 'fs';
import path from 'path';
import { DB } from './db';

const DB_PATH = path.join(process.cwd(), 'data.json');

// Inicializa o arquivo se não existir
if (!fs.existsSync(DB_PATH)) {
    const initialDB: DB = {
        farmacias: [],
        playbookTemplates: [],
        playbookRuns: [],
        playbookRunItens: [],
        tarefas: [],
        reunioes: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
}

export async function readDB(): Promise<DB> {
    try {
        const content = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        return {
            farmacias: [],
            playbookTemplates: [],
            playbookRuns: [],
            playbookRunItens: [],
            tarefas: [],
            reunioes: []
        };
    }
}

export async function writeDB(db: DB): Promise<void> {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
