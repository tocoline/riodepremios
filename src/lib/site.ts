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

export const adsense = {
  client: (import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined) || '',
  slot: (import.meta.env.PUBLIC_ADSENSE_SLOT as string | undefined) || '',
};
