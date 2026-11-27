export const UFS: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};
/** "o Rio de Janeiro", "a Bahia", "São Paulo" — preposição adequada para cada estado. */
export const NO: Record<string, string> = {
  AC: 'no', AL: 'em', AP: 'no', AM: 'no', BA: 'na', CE: 'no', DF: 'no', ES: 'no', GO: 'em', MA: 'no', MT: 'em', MS: 'em', MG: 'em', PA: 'no', PB: 'na',
  PR: 'no', PE: 'em', PI: 'no', RJ: 'no', RN: 'no', RS: 'no', RO: 'em', RR: 'em', SC: 'em', SP: 'em', SE: 'em', TO: 'no',
};
export const cidadeBonita = (s: string) => s.toLowerCase().replace(/(^|\s|-|')(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E)\b/g, (m) => m.toLowerCase());
