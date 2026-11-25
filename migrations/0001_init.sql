CREATE TABLE IF NOT EXISTS concursos (
  loteria TEXT NOT NULL,
  numero INTEGER NOT NULL,
  data TEXT NOT NULL,                 -- ISO yyyy-mm-dd
  dezenas TEXT NOT NULL,              -- JSON array (ordem crescente)
  dezenas_ordem TEXT,                 -- JSON array (ordem do sorteio)
  dezenas2 TEXT,                      -- JSON array (2º sorteio Dupla Sena)
  extra TEXT,                         -- JSON {time, mes, trevos}
  premiacoes TEXT NOT NULL,           -- JSON [{faixa, descricao, ganhadores, premio}]
  acumulado INTEGER NOT NULL DEFAULT 0,
  arrecadacao REAL,
  proximo_numero INTEGER,
  proximo_data TEXT,
  proximo_estimativa REAL,
  acumulado_especial REAL,            -- acumulado p/ concurso especial (ex.: Mega da Virada)
  local TEXT,
  cidades_ganhadoras TEXT,            -- JSON [{cidade, uf, ganhadores}]
  especial INTEGER NOT NULL DEFAULT 0,-- 1 = concurso especial (Virada, Independência, Páscoa, São João)
  fonte TEXT,
  atualizado_em TEXT NOT NULL,
  PRIMARY KEY (loteria, numero)
);
CREATE INDEX IF NOT EXISTS idx_concursos_data ON concursos (loteria, data DESC);
CREATE INDEX IF NOT EXISTS idx_concursos_especial ON concursos (loteria, especial, numero DESC);
