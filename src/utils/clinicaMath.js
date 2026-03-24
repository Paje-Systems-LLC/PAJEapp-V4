/**
 * Utilidades de Matemática Clínica LaMPS - Segurança Float64 Rigída
 * Módulo de Regras Críticas. Alterações de core logic proibidas sem auditoria de Governance.
 */

/**
 * Calcula a Pressão Arterial Média (PAM) com precisão computacional clínica Float64.
 * 
 * Regra: PAM = Diastolica + [(Sistolica - Diastolica) / 3]
 * 
 * @param {number} sistolica - Pressão sistólica em Float64
 * @param {number} diastolica - Pressão diastólica em Float64
 * @returns {number} O valor exato da PAM. Jamais arredondar usando Math.round() antes da renderização final para não mascarar variabilidades fracionadas críticas (Ex: 59.8).
 * @throws {Error} Dispara um bloqueio imediato caso os números sejam nulos, vazios ou em formatos imprecisos numéricos a fim de evitar falsos scores clínicos para risco sistêmico.
 */
export const calcularPAM = (sistolica, diastolica) => {
    if (typeof sistolica !== 'number' || typeof diastolica !== 'number' || isNaN(sistolica) || isNaN(diastolica)) {
        throw new Error("Input clínico inválido. PAM exige valores numéricos literais (Float64 Precision). O cálculo de Isquemia não pode falhar silenciosamente nem assumir valores padrão de null/zero.");
    }

    // PAM Float64 Formula
    return diastolica + ((sistolica - diastolica) / 3.0);
};
