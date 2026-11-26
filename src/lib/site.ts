export const SITE = {
  nome: 'Rio de Prêmios',
  url: 'https://www.riodepremios.com.br',
  descricao: 'Resultados das loterias da Caixa atualizados automaticamente, estatísticas, calculadoras e guias completos — com uma seção especial da Mega da Virada.',
  email: 'contato@riodepremios.com.br',
  // Equipe editorial (organização) e autora responsável (pessoa) — E-E-A-T
  editor: {
    nome: 'Equipe Rio de Prêmios',
    cargo: 'Redação e dados',
    bio: 'Equipe dedicada a organizar e explicar os resultados e as regras das loterias brasileiras com dados oficiais.',
    sameAs: [] as string[],
  },
};

// IDs públicos (aparecem no HTML de qualquer site com anúncios). Podem ser trocados por variáveis de ambiente no Pages.
// Data da última revisão do conteúdo editorial fixo (guias, páginas institucionais) — usada no sitemap
export const CONTEUDO_ATUALIZADO = '2026-11-26';

export const adsense = {
  client: (import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined) || 'ca-pub-7489608946923439',
  slot: (import.meta.env.PUBLIC_ADSENSE_SLOT as string | undefined) || '5634434194',
};

// Google Analytics 4 (mesma propriedade do site antigo, para manter o histórico)
export const analytics = (import.meta.env.PUBLIC_GA_ID as string | undefined) || 'G-XRPG9WRVKV';

// Autora responsável pelo conteúdo editorial.
// Para fortalecer o E-E-A-T, acrescente aqui dados REAIS e verificáveis: formação, experiência e perfis (LinkedIn, Instagram…) em `sameAs`.
export const AUTORA = {
  nome: 'Cinthia Carla Pereira',
  slug: 'cinthia-carla-pereira',
  cargo: 'Editora-chefe do Rio de Prêmios',
  foto: '/autores/cinthia-carla-pereira-400.webp',
  fotoP: '/autores/cinthia-carla-pereira-160.webp',
  fotoJpg: '/autores/cinthia-carla-pereira-400.jpg',
  bio: 'Editora-chefe do Rio de Prêmios. Acompanha de perto os sorteios das loterias brasileiras e transforma regras, probabilidades e prazos em guias claros, sempre a partir de dados oficiais.',
  sameAs: [] as string[],
  areas: ['Mega da Virada e concursos especiais', 'Regras, preços e probabilidades das loterias da Caixa', 'Bolões: organização, cotas e divisão de prêmios', 'Imposto de Renda e resgate de prêmios', 'Rio de Prêmios, a loteria do Estado do RJ', 'Jogo responsável'],
  get url() { return `${SITE.url}/autores/${this.slug}/`; },
};

/** JSON-LD da autora (Person). */
export function autoraLD() {
  return { '@type': 'Person', '@id': `${AUTORA.url}#pessoa`, name: AUTORA.nome, url: AUTORA.url, image: `${SITE.url}${AUTORA.fotoJpg}`, jobTitle: AUTORA.cargo, worksFor: { '@id': `${SITE.url}/#org` }, ...(AUTORA.sameAs.length ? { sameAs: AUTORA.sameAs } : {}) };
}
