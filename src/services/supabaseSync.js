/**
 * Supabase Sync — Sincroniza medições pendentes do SQLite local
 * com a tabela `measurements` no Supabase (sso.pajesystems.com).
 *
 * Fluxo:
 *   1. Busca registros com synced=0 no SQLite local
 *   2. Envia em batch para o Supabase via REST
 *   3. Marca como synced=1 localmente em caso de sucesso
 */
import { supabase } from '../config/supabaseClient';
import { getPendingSync, markSynced } from './hdsysFreeDB';

const TABLE = 'measurements';
const BATCH_SIZE = 50;

/**
 * Executa sync de todas as medições pendentes.
 * @returns {{ synced: number, errors: number }}
 */
export const syncPendingMeasurements = async (userId) => {
    const pending = await getPendingSync();
    if (!pending || pending.length === 0) return { synced: 0, errors: 0 };

    let totalSynced = 0;
    let totalErrors = 0;

    // Processa em batches
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const batch = pending.slice(i, i + BATCH_SIZE);

        const rows = batch.map(m => ({
            user_id:     userId,
            patient_pas: m.pas,
            patient_pad: m.pad,
            patient_pam: m.pam,
            patient_heart_rate: m.heart_rate,
            patient_glycemia:   m.glycemia,
            patient_weight:     m.weight,
            patient_height:     m.height,
            patient_datetime:   m.measured_at,
            source:      'hdsys_free_mobile',
        }));

        const { error } = await supabase.from(TABLE).insert(rows);

        if (error) {
            console.error('supabaseSync: erro no batch', error.message);
            totalErrors += batch.length;
        } else {
            await markSynced(batch.map(m => m.id));
            totalSynced += batch.length;
        }
    }

    return { synced: totalSynced, errors: totalErrors };
};

/**
 * Busca histórico do usuário direto do Supabase (modo online).
 * @returns {Array} medições ordenadas pela mais recente
 */
export const fetchCloudHistory = async (userId, limit = 100) => {
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('patient_datetime', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('supabaseSync: erro ao buscar histórico cloud', error.message);
        return null;
    }
    return data;
};
