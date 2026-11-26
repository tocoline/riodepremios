export const SITE = {
  nome: 'Rio de Prêmios',
  url: 'https://www.riodepremios.com.br',
  descricao: 'Resultados das loterias da Caixa atualizados automaticamente, estatísticas, calculadoras e guias completos — com uma seção especial da Mega da Virada.',
  email: 'contato@riodepremios.com.br',
  // E-E-A-T: preencha com o responsável editorial real (nome, cargo, bio, links)
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
