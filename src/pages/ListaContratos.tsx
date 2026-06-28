import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  CheckCircle2,
  X,
} from 'lucide-react';
import './ListaContratos.css';

/* -------------------------------------------------------------------------- */
/* Dados (mock — vindos do Figma node 63:8893)                                 */
/* -------------------------------------------------------------------------- */

export type Estado =
  | 'fim-proximo'
  | 'vigente'
  | 'aguardando'
  | 'encerrado'
  | 'cancelado';

export const ESTADO_LABEL: Record<Estado, string> = {
  'fim-proximo': 'Fim de contrato próximo',
  vigente: 'Vigente',
  aguardando: 'Aguardando início',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado manualmente',
};

/* mapeia o estado do contrato para o tom visual da tag */
export const ESTADO_TONE: Record<Estado, TagTone> = {
  'fim-proximo': 'error',
  vigente: 'success',
  aguardando: 'warning',
  encerrado: 'neutral',
  cancelado: 'neutral',
};

/* item de um contrato — mesma forma usada na tabela de itens e no PDF */
export type ContratoItem = {
  desc: string;
  unidade: string;
  quant: string;
  unit: string;
  total: string;
};

export type Contrato = {
  objeto: string;
  setores: string[];
  uf: string;
  inicio: string;
  fim: string;
  valor: string;
  estado: Estado;
  itens: ContratoItem[];
};

/* "R$ 1.234,56" a partir de um número */
const brl = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* linha crua [descrição, unidade, qtd, valor unit.] → item formatado.
   quant é sempre numérico (só o número) — a natureza fica na coluna "unidade". */
type LinhaItem = [desc: string, unidade: string, qtd: number, valorUnit: number];
const montarItens = (linhas: LinhaItem[]) => {
  const itens = linhas.map<ContratoItem>(([desc, unidade, qtd, vu]) => ({
    desc,
    unidade,
    quant: String(qtd),
    unit: brl(vu),
    total: brl(qtd * vu),
  }));
  /* valor do contrato = soma dos itens (mantém lista e PDF coerentes) */
  const valor = brl(linhas.reduce((s, [, , qtd, vu]) => s + qtd * vu, 0));
  return { itens, valor };
};

/* monta um contrato completo; valor é derivado dos itens */
const mk = (
  objeto: string,
  setores: string[],
  uf: string,
  inicio: string,
  fim: string,
  estado: Estado,
  linhas: LinhaItem[],
): Contrato => {
  const { itens, valor } = montarItens(linhas);
  return { objeto, setores, uf, inicio, fim, valor, estado, itens };
};

const CONTRATOS: Contrato[] = [
  mk(
    'Licença de software - Pacote Office Pro',
    ['Pesquisa e Desenv.', 'Gestão de projetos', 'Recursos Humanos', 'Suprimentos'],
    'SP', '01/07/2025', '08/07/2026', 'fim-proximo',
    [
      ['Licença Microsoft 365 Business Standard', 'Anual', 40, 1080.0],
      ['Suporte e migração de dados', 'Serviço', 1, 2478.9],
    ],
  ),
  mk(
    'Licenças de software de design de interfaces - Figma',
    ['Pesquisa e Desenv.'],
    'MG', '15/08/2024', '15/08/2026', 'vigente',
    [
      ['Licença Figma Organization', 'Anual', 45, 1017.59],
      ['Licença Figma Dev', 'Anual', 100, 305.28],
      ['Suporte premium', 'Serviço', 1, 2581.68],
    ],
  ),
  mk(
    'Sistema de controle de ponto',
    ['Recursos Humanos'],
    'BA', '30/09/2024', '30/09/2026', 'vigente',
    [
      ['Plataforma de controle de ponto (SaaS)', 'Mensal', 24, 1200.0],
      ['Relógios de ponto biométricos', 'Unidade', 8, 650.0],
      ['Configuração inicial', 'Serviço', 1, 567.89],
    ],
  ),
  mk(
    'Licença SolidWorks',
    ['Pesquisa e Desenv.'],
    'PE', '25/11/2024', '25/11/2026', 'vigente',
    [
      ['Licença SolidWorks Professional', 'Anual', 5, 4200.0],
      ['Treinamento de equipe', 'Serviço', 1, 2456.78],
    ],
  ),
  mk(
    'Licença de software para engenharia - AutoCAD',
    ['Pesquisa e Desenv.', 'Engenharia Civil'],
    'RS', '10/02/2025', '10/02/2027', 'vigente',
    [
      ['Licença AutoCAD LT', 'Anual', 20, 2500.0],
      ['Licença AutoCAD Plant 3D', 'Anual', 2, 3200.0],
      ['Suporte técnico', 'Serviço', 1, 389.01],
    ],
  ),
  mk(
    'Pacote empresarial de gestão de projetos - Atlassian Corporate',
    ['Pesquisa e Desenv.', 'Gestão de Projetos', 'Suprimentos', 'Segurança do Trabalho'],
    'CE', '03/12/2024', '18/06/2027', 'vigente',
    [
      ['Jira Software (assinatura)', 'Anual', 120, 420.0],
      ['Confluence (assinatura)', 'Anual', 120, 140.0],
      ['Suporte e onboarding', 'Serviço', 1, 690.12],
    ],
  ),
  mk(
    'Licença Google Cloud IA - Workspace',
    ['Pesquisa e Desenv.'],
    'PR', '03/12/2023', '03/12/2027', 'vigente',
    [
      ['Google Workspace Enterprise', 'Mensal', 24, 2800.0],
      ['Créditos de IA (Vertex AI)', 'Pacote', 12, 1800.0],
      ['Consultoria de implantação', 'Serviço', 1, 212.34],
    ],
  ),
  mk(
    'Licença Figma Dev',
    ['Pesquisa e Desenv.'],
    'RJ', '01/09/2026', '01/09/2027', 'aguardando',
    [
      ['Licença Figma Dev', 'Anual', 40, 305.28],
      ['Suporte técnico', 'Serviço', 1, 134.47],
    ],
  ),
  mk(
    'Licença de software - Pacote Office Pro',
    ['Pesquisa e Desenv.', 'Gestão de projetos', 'Recursos Humanos', 'Suprimentos'],
    'PA', '12/03/2023', '12/03/2026', 'encerrado',
    [
      ['Licença Microsoft 365 Business Basic', 'Anual', 12, 820.0],
      ['Suporte técnico', 'Serviço', 1, 394.56],
    ],
  ),
  mk(
    'Licença Figma Dev',
    ['Pesquisa e Desenv.'],
    'SC', '20/01/2025', '20/01/2028', 'cancelado',
    [
      ['Licença Figma Dev', 'Anual', 140, 305.28],
      ['Suporte premium', 'Serviço', 1, 471.78],
    ],
  ),
];

/* Colunas — larguras default do Figma (objeto 296 / setores 304 / UF 60 /
   início 100 / fim 100 / valor 160 / estado 180). UF, Início e Fim começam no
   width mínimo (Figma node 63:8893). `sortable` espelha os ícones do Figma. */
type ColKey = 'objeto' | 'setores' | 'uf' | 'inicio' | 'fim' | 'valor' | 'estado';

const COLUMNS: { key: ColKey; label: string; sortable: boolean; width: number }[] = [
  { key: 'objeto', label: 'Objeto do contrato', sortable: true, width: 296 },
  { key: 'setores', label: 'Setores beneficiados', sortable: false, width: 304 },
  { key: 'uf', label: 'UF', sortable: true, width: 60 },
  { key: 'inicio', label: 'Início', sortable: true, width: 100 },
  { key: 'fim', label: 'Fim', sortable: true, width: 100 },
  { key: 'valor', label: 'Valor do contrato', sortable: true, width: 160 },
  { key: 'estado', label: 'Estado', sortable: true, width: 180 },
];

/* colunas que esticam p/ preencher o espaço: Objeto (0) e Setores (1) */
const FLEX_COLS = new Set([0, 1]);

/* -------------------------------------------------------------------------- */
/* Ordenação                                                                   */
/* -------------------------------------------------------------------------- */

/* colunas ordenáveis por clique e seu tipo de comparação */
type SortKey = 'objeto' | 'uf' | 'inicio' | 'fim' | 'valor' | 'estado';
const SORT_TYPE: Record<SortKey, 'texto' | 'data' | 'numero' | 'estado'> = {
  objeto: 'texto',
  uf: 'texto',
  inicio: 'data',
  fim: 'data',
  valor: 'numero',
  estado: 'estado',
};

/* prioridade dos estados — é a ordenação padrão (principal) da tabela */
const ESTADO_ORDER: Record<Estado, number> = {
  'fim-proximo': 0,
  vigente: 1,
  aguardando: 2,
  encerrado: 3,
  cancelado: 4,
};

type SortState = { key: SortKey; dir: 'asc' | 'desc' };

/* dd/mm/aaaa → timestamp */
const parseData = (s: string) => {
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d).getTime();
};
/* "R$ 45.678,90" → 45678.9 */
const parseValor = (s: string) =>
  Number(s.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'));

/* compara duas linhas pela coluna `key` (sempre crescente; dir trata o sentido) */
const compararLinhas = (a: Contrato, b: Contrato, key: SortKey) => {
  if (SORT_TYPE[key] === 'numero') return parseValor(a.valor) - parseValor(b.valor);
  if (SORT_TYPE[key] === 'data') return parseData(a[key as 'inicio' | 'fim']) - parseData(b[key as 'inicio' | 'fim']);
  /* estado: prioridade + desempate por fim mais próximo (espelha a ordem padrão) */
  if (SORT_TYPE[key] === 'estado')
    return ESTADO_ORDER[a.estado] - ESTADO_ORDER[b.estado] || parseData(a.fim) - parseData(b.fim);
  return (a[key as 'objeto' | 'uf']).localeCompare(b[key as 'objeto' | 'uf'], 'pt');
};

/* -------------------------------------------------------------------------- */
/* Página                                                                      */
/* -------------------------------------------------------------------------- */

export default function ListaContratos({
  onAdd,
  onView,
  toast,
}: {
  onAdd?: () => void;
  onView?: (c: Contrato) => void;
  toast?: { id: number; nome: string } | null;
}) {
  /* toast de sucesso — entra de cima, fica 3s, sai suave */
  const [toastNome, setToastNome] = useState<string | null>(null);
  const [toastSaindo, setToastSaindo] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setToastNome(toast.nome);
    setToastSaindo(false);
    const t1 = setTimeout(() => setToastSaindo(true), 3000);
    const t2 = setTimeout(() => setToastNome(null), 3320);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast?.id]);
  const fecharToast = () => {
    setToastSaindo(true);
    setTimeout(() => setToastNome(null), 320);
  };

  /* largura (px) de cada coluna — redimensionável pelo usuário */
  const [widths, setWidths] = useState<number[]>(() => COLUMNS.map((c) => c.width));
  /* índice da coluna sendo arrastada (p/ realce visual) */
  const [resizing, setResizing] = useState<number | null>(null);
  /* colunas flex que o usuário arrastou — saem do 1fr e viram px fixo */
  const [pinned, setPinned] = useState<Set<number>>(() => new Set());
  /* ordenação atual — null = ordem padrão (agrupada por estado) */
  const [sort, setSort] = useState<SortState | null>(null);

  /* clique no cabeçalho: asc → desc → padrão (3º clique). Só 1 coluna por vez. */
  const toggleSort = (key: SortKey) =>
    setSort((cur) => {
      if (!cur || cur.key !== key) return { key, dir: 'asc' };
      if (cur.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });

  /* linhas exibidas — ordenadas, ou a ordem padrão do mock quando sort = null */
  const rows = sort
    ? [...CONTRATOS].sort((a, b) => {
        const c = compararLinhas(a, b, sort.key);
        return sort.dir === 'asc' ? c : -c;
      })
    : CONTRATOS;

  /* Objeto (0) e Setores (1) crescem p/ preencher a largura sobrando (1fr) — até
     o usuário arrastá-las: aí entram em `pinned`, viram px fixo e encolhem
     livremente. As demais já são px fixo. Duplo-clique restaura (e volta a
     esticar). Em telas estreitas tudo respeita o mínimo e o scroll-x entra. */
  const isFlex = (i: number) => FLEX_COLS.has(i) && !pinned.has(i);
  const gridTemplate = widths
    .map((w, i) => (isFlex(i) ? `minmax(${w}px, 1fr)` : `${w}px`))
    .join(' ');

  /* arrasta a borda direita da coluna `i` */
  const startResize = (i: number, e: React.MouseEvent) => {
    e.preventDefault();
    const th = (e.currentTarget as HTMLElement).parentElement as HTMLElement;
    const label = th.querySelector('span') as HTMLElement;
    const col = COLUMNS[i];
    /* mínimo = 8 (borda) + texto + [8 + ícone de ordenação 15] + 8 (borda) */
    const min = 8 + Math.ceil(label.scrollWidth) + (col.sortable ? 8 + 15 : 0) + 8;
    const startX = e.clientX;
    /* largura real renderizada — cobre o caso flex (≠ do piso `widths[i]`) */
    const startW = th.getBoundingClientRect().width;
    setResizing(i);
    /* fixa a coluna flex p/ que o arraste passe a valer de verdade */
    if (FLEX_COLS.has(i)) setPinned((p) => new Set(p).add(i));

    const onMove = (ev: MouseEvent) => {
      const next = Math.max(min, startW + (ev.clientX - startX));
      setWidths((ws) => ws.map((w, j) => (j === i ? next : w)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setResizing(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  /* duplo-clique no handle → restaura largura do Figma e volta a esticar (flex) */
  const resetWidth = (i: number) => {
    setPinned((p) => {
      const n = new Set(p);
      n.delete(i);
      return n;
    });
    setWidths((ws) => ws.map((w, j) => (j === i ? COLUMNS[i].width : w)));
  };

  return (
    <div className="app-shell">
      {/* Sidebar rail — Figma: largura 52, ícones centrados */}
      <aside
        style={{
          width: 'var(--sidenav-width)',
          background: 'var(--color-bg-card)',
          borderRight: '1px solid var(--cinza-300)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--spacing-24) 0',
          flex: 'none',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
        }}
      >
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-64)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M12 3 L22 20 H2 Z" fill="var(--color-brand-default)" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-32)' }}>
          <RailIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <rect x="7" y="11" width="3" height="7" />
              <rect x="12" y="7" width="3" height="11" />
              <rect x="17" y="4" width="3" height="14" />
            </svg>
          </RailIcon>
          <RailIcon active>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" />
              <path d="M8 17h6" />
            </svg>
          </RailIcon>
          <RailIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </RailIcon>
        </div>
      </aside>

      {/* Coluna direita */}
      <div className="content-column">
        {/* Top bar — breadcrumb. Figma: altura 68, borda inferior 2px brand */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            height: 68,
            background: 'var(--color-bg-card)',
            borderBottom: '2px solid var(--color-border-brand)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--spacing-24) 0 var(--spacing-36)',
            flex: 'none',
          }}
        >
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', fontSize: 14, color: 'var(--color-text-secondary)' }}>
            <span>Início</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>/</span>
            <span style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Lista de contratos</span>
          </nav>
        </header>

        {/* Conteúdo */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)', padding: 'var(--spacing-24) var(--spacing-24) var(--spacing-64) var(--spacing-36)' }}>
          {/* Barra de ações — busca + filtros + adicionar */}
          <div style={{ display: 'flex', gap: 'var(--spacing-16)', alignItems: 'center' }}>
            {/* Busca — Figma: largura 544 */}
            <div
              style={{
                width: 544,
                maxWidth: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-8)',
                height: 36,
                padding: '0 var(--spacing-12)',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-8)',
              }}
            >
              <Search size={15} strokeWidth={1.66} color="var(--color-text-disabled)" />
              <input
                type="text"
                placeholder="Busque pelo objeto do contrato"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  color: 'var(--color-text-body)',
                }}
              />
            </div>

            {/* Filtros — botão secundário */}
            <button className="lc-btn lc-btn--secondary">
              <Filter size={15} strokeWidth={1.66} />
              Filtros
            </button>

            {/* Adicionar contrato — botão primário, alinhado à direita */}
            <button className="lc-btn lc-btn--primary" style={{ marginLeft: 'auto' }} onClick={onAdd}>
              <Plus size={15} strokeWidth={2} />
              Adicionar contrato
            </button>
          </div>

          {/* Tabela */}
          <div className="lc-table" style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-8)' }}>
            {/* Cabeçalho — colunas redimensionáveis */}
            <div
              className="lc-thead"
              style={{
                display: 'grid',
                gridTemplateColumns: gridTemplate,
                alignItems: 'center',
                background: 'var(--color-bg-card)',
                padding: '0 var(--spacing-16)',
              }}
            >
              {COLUMNS.map((col, i) => {
                const sortKey = col.key in SORT_TYPE ? (col.key as SortKey) : null;
                const active = sort && sortKey && sort.key === sortKey;
                return (
                <div
                  key={col.key}
                  className={`lc-th${resizing === i ? ' lc-th--resizing' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-8)',
                    padding: '12px 8px 12px',
                    /* coluna ativamente ordenada — fundo brand-muted preenche a
                       célula inteira (Figma node 112:1048) */
                    background: active ? 'var(--color-brand-muted)' : 'transparent',
                  }}
                >
                  <div
                    onClick={sortKey ? () => toggleSort(sortKey) : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-8)',
                      flex: 1,
                      minWidth: 0,
                      cursor: sortKey ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: active ? 'var(--color-text-brand)' : 'var(--color-text-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col.label}
                    </span>
                    {col.sortable &&
                      (active ? (
                        sort.dir === 'asc' ? (
                          <ArrowUpNarrowWide size={15} strokeWidth={1.66} color="var(--color-icon-brand)" style={{ flex: 'none' }} />
                        ) : (
                          <ArrowDownWideNarrow size={15} strokeWidth={1.66} color="var(--color-icon-brand)" style={{ flex: 'none' }} />
                        )
                      ) : (
                        <ArrowUpDown size={15} strokeWidth={1.66} color="var(--color-icon-secondary)" style={{ flex: 'none' }} />
                      ))}
                  </div>

                  {/* Handle de redimensionamento — discreto, aparece no hover */}
                  <div
                    className={`lc-resizer${resizing === i ? ' lc-resizer--active' : ''}`}
                    onMouseDown={(e) => startResize(i, e)}
                    onDoubleClick={() => resetWidth(i)}
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Redimensionar coluna ${col.label}`}
                    title="Arraste para redimensionar · duplo-clique para restaurar"
                  >
                    <span className="lc-resizer__line" />
                  </div>
                </div>
                );
              })}
            </div>

            {/* Linhas */}
            {rows.map((c, i) => (
              <div
                key={i}
                className="lc-row"
                onClick={() => onView?.(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView?.(c); } }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: gridTemplate,
                  alignItems: 'center',
                  minHeight: 80,
                  padding: 'var(--spacing-12) var(--spacing-16)',
                  borderTop: `1px solid ${i === 0 ? 'var(--color-border-default)' : 'var(--color-border-subtle)'}`,
                  cursor: 'pointer',
                }}
              >
                <Cell title clamp>{c.objeto}</Cell>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)', padding: 'var(--spacing-8)', minWidth: 0 }}>
                  {c.setores.map((s) => (
                    <Tag key={s} tone="brand">{s}</Tag>
                  ))}
                </div>
                <Cell>{c.uf}</Cell>
                <Cell tabular>{c.inicio}</Cell>
                <Cell tabular>{c.fim}</Cell>
                <Cell tabular>{c.valor}</Cell>
                <div style={{ padding: 'var(--spacing-8)', minWidth: 0 }}>
                  <Tag tone={ESTADO_TONE[c.estado]}>{ESTADO_LABEL[c.estado]}</Tag>
                </div>
              </div>
            ))}

            {/* Paginação — Figma: "Mostrando resultados 1-10 de 180" + páginas + por página */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 'var(--spacing-4)',
                padding: 'var(--spacing-8) var(--spacing-12)',
                borderTop: '1px solid var(--color-border-default)',
                background: 'var(--color-bg-card)',
                position: 'sticky',
                left: 0,
              }}
            >
              <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'right', paddingRight: 'var(--spacing-8)' }}>
                Mostrando resultados 1-10 de 180
              </span>
              <PageBtn aria-label="Primeira página"><ChevronsLeft size={14} /></PageBtn>
              <PageBtn aria-label="Página anterior"><ChevronLeft size={14} /></PageBtn>
              <PageBtn active>1</PageBtn>
              <PageBtn>2</PageBtn>
              <PageBtn>3</PageBtn>
              <PageBtn>4</PageBtn>
              <PageBtn>5</PageBtn>
              <PageBtn aria-label="Próxima página"><ChevronRight size={14} /></PageBtn>
              <PageBtn aria-label="Última página"><ChevronsRight size={14} /></PageBtn>
              <button className="lc-perpage">
                10
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Toast de sucesso — 12px abaixo da topbar, alinhado ao limite direito */}
      {toastNome && (
        <div
          role="status"
          aria-live="polite"
          className={`lc-toast${toastSaindo ? ' lc-toast--out' : ''}`}
        >
          <span className="lc-toast__accent" />
          <CheckCircle2 size={20} strokeWidth={2} color="var(--color-success-default)" style={{ flex: 'none', marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: 'var(--color-text-title)' }}>
              Contrato adicionado com sucesso
            </div>
            <div style={{ fontSize: 14, lineHeight: '20px', color: 'var(--color-success-default)', marginTop: 'var(--spacing-4)' }}>
              O contrato “{toastNome}” foi adicionado.
            </div>
          </div>
          <button
            onClick={fecharToast}
            aria-label="Fechar"
            style={{ flex: 'none', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: 'var(--color-text-secondary)', lineHeight: 0 }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponentes                                                              */
/* -------------------------------------------------------------------------- */

function Cell({ children, title = false, tabular = false, clamp = false }: { children: ReactNode; title?: boolean; tabular?: boolean; clamp?: boolean }) {
  return (
    <div
      style={{
        padding: 'var(--spacing-8)',
        minWidth: 0,
        fontSize: 14,
        lineHeight: '20px',
        color: title ? 'var(--color-text-title)' : 'var(--color-text-body)',
        overflow: 'hidden',
        /* clamp: trunca com (...) após 2 linhas; senão, 1 linha */
        ...(clamp
          ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, whiteSpace: 'normal' }
          : { textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
        fontVariantNumeric: tabular ? 'tabular-nums' : undefined,
      }}
    >
      {children}
    </div>
  );
}

export type TagTone = 'brand' | 'success' | 'warning' | 'error' | 'neutral';

/* tom → cores (bg / borda / texto), espelhando o componente Tags do Figma */
const TAG_TONE: Record<TagTone, CSSProperties> = {
  brand: { background: 'var(--color-brand-muted)', borderColor: 'var(--color-border-brand)', color: 'var(--color-text-brand)' },
  success: { background: 'var(--color-success-subtle)', borderColor: 'var(--color-success-default)', color: 'var(--color-success-default)' },
  warning: { background: 'var(--color-warning-subtle)', borderColor: 'var(--color-warning-default)', color: 'var(--color-warning-default)' },
  error: { background: 'var(--color-error-subtle)', borderColor: 'var(--color-error-default)', color: 'var(--color-error-default)' },
  neutral: { background: 'var(--color-info-subtle)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' },
};

export function Tag({ children, tone }: { children: ReactNode; tone: TagTone }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-4) var(--spacing-8)',
        borderRadius: 'var(--radius-8)',
        border: '1px solid',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '16px',
        whiteSpace: 'nowrap',
        ...TAG_TONE[tone],
      }}
    >
      {children}
    </span>
  );
}

function PageBtn({ children, active = false, ...rest }: { children: ReactNode; active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`lc-page${active ? ' lc-page--active' : ''}`} {...rest}>
      {children}
    </button>
  );
}

function RailIcon({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 'var(--radius-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'var(--color-brand-muted)' : 'transparent',
        color: active ? 'var(--color-brand-default)' : 'var(--color-text-secondary)',
      }}
    >
      {children}
    </div>
  );
}
