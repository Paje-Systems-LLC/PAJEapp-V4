/**
 * mockPatient.js — Dados simulados para preview/teste
 * Paciente: João Silva, 58 anos, hipertenso estágio 2, sobrepeso
 * Período: Mar/2025 – Mar/2026 (100 medições)
 * TODO: remover antes do build de produção
 */

// Semente determinística para reprodutibilidade
const seed = (n) => {
    let x = Math.sin(n + 1) * 10000;
    return x - Math.floor(x);
};

// Gera valor com variação realista em torno de uma média
const vary = (base, amplitude, i) => Math.round(base + (seed(i) - 0.5) * 2 * amplitude);

// Tendência sazonal: picos no inverno (jun-ago), melhora no verão (dez-fev)
const seasonalOffset = (date) => {
    const month = date.getMonth(); // 0=jan … 11=dez
    // Inverno BR: jun(5)-ago(7) → +8 mmHg; Verão: dez(11)-fev(1) → -4 mmHg
    const offsets = [-4, -3, 0, 2, 4, 6, 8, 8, 5, 2, 0, -4];
    return offsets[month] ?? 0;
};

// Momentos de crise hipertensiva (índices 20, 45, 72)
const CRISES = new Set([20, 45, 72]);

export const MOCK_PATIENT = {
    id: 'mock-001',
    name: 'João Silva',
    age: 58,
    gender: 'M',
    diagnosis: 'Hipertensão arterial estágio 2',
    weight_kg: 84,
    height_cm: 170,
};

export const MOCK_MEASUREMENTS = (() => {
    const start = new Date('2025-03-21T07:00:00');
    const TOTAL = 100;
    const DAY_STEP = 365 / TOTAL; // ~3.65 dias entre medições

    const measurements = [];

    for (let i = 0; i < TOTAL; i++) {
        const date = new Date(start.getTime() + i * DAY_STEP * 24 * 60 * 60 * 1000);
        // Adiciona variação de horário (6h–22h)
        date.setHours(6 + Math.floor(seed(i * 3) * 16));
        date.setMinutes(Math.floor(seed(i * 7) * 60));

        const isCrise = CRISES.has(i);
        const seasonal = seasonalOffset(date);

        // PAS base hipertenso: 155 mmHg ± 18, com crise +35
        const pas = vary(155 + seasonal + (isCrise ? 35 : 0), 18, i * 2);
        // PAD base: 98 mmHg ± 10, com crise +20
        const pad = vary(98 + Math.round(seasonal * 0.6) + (isCrise ? 20 : 0), 10, i * 2 + 1);
        // PAM = (PAS + 2×PAD) / 3 — Float64 estrito (clinicaMath.js padrão)
        const pam = parseFloat(((pas + 2 * pad) / 3).toFixed(2));
        // FC: levemente elevada (72–95 bpm)
        const hr = vary(83 + (isCrise ? 12 : 0), 10, i * 5);
        // Glicemia: pré-diabético (95–145 mg/dL)
        const glucose = vary(115 + (isCrise ? 20 : 0), 20, i * 11);
        // Peso oscila ±3 kg ao longo do ano
        const weight = parseFloat((84 + (seed(i * 13) - 0.5) * 6).toFixed(1));

        measurements.push({
            id: `mock-${String(i + 1).padStart(3, '0')}`,
            patient_datetime: date.toISOString(),
            created_at:       date.toISOString(),
            patient_pas:           Math.max(100, pas),
            patient_pad:           Math.max(60, pad),
            patient_pam:           pam,
            patient_heart_rate:    Math.max(55, hr),
            patient_glucose:       Math.max(70, glucose),
            patient_weight:        weight,
            patient_height:        170,
        });
    }

    // Ordena do mais recente para o mais antigo (padrão da API)
    return measurements.sort((a, b) => new Date(b.patient_datetime) - new Date(a.patient_datetime));
})();
