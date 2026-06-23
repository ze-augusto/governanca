import { type CSSProperties, type ReactNode } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from 'lucide-react';
import './ListaContratos.css';

/* -------------------------------------------------------------------------- */
/* Dados (mock — vindos do Figma node 63:8893)                                 */
/* -------------------------------------------------------------------------- */

type Estado =
  | 'fim-proximo'
  | 'vigente'
  | 'aguardando'
  | 'encerrado'
  | 'cancelado';

const ESTADO_LABEL: Record<Estado, string> = {
  'fim-proximo': 'Fim de contrato próximo',
  vigente: 'Vigente',
  aguardando: 'Aguardando início',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado manualmente',
};

/* mapeia o estado do contrato para o tom visual da tag */
const ESTADO_TONE: Record<Estado, TagTone> = {
  'fim-proximo': 'error',
  vigente: 'success',
  aguardando: 'warning',
  encerrado: 'neutral',
  cancelado: 'neutral',
};

type Contrato = {
  objeto: string;
  setores: string[];
  inicio: string;
  fim: string;
  valor: string;
  estado: Estado;
};

const CONTRATOS: Contrato[] = [
  {
    objeto: 'Licença de software - Pacote Office Pro',
    setores: ['Pesquisa e Desenv.', 'Gestão de projetos', 'Recursos Humanos', 'Suprimentos'],
    inicio: '30/11/2026',
    fim: '30/11/2026',
    valor: 'R$ 45.678,90',
    estado: 'fim-proximo',
  },
  {
    objeto: 'Licenças de software de design de interfaces - Figma',
    setores: ['Pesquisa e Desenv.'],
    inicio: '27/10/2026',
    fim: '27/10/2026',
    valor: 'R$ 78.901,23',
    estado: 'vigente',
  },
  {
    objeto: 'Sistema de controle de ponto',
    setores: ['Recursos Humanos'],
    inicio: '19/09/2026',
    fim: '19/09/2026',
    valor: 'R$ 34.567,89',
    estado: 'vigente',
  },
  {
    objeto: 'Licença SolidWorks',
    setores: ['Pesquisa e Desenv.'],
    inicio: '10/08/2026',
    fim: '10/08/2026',
    valor: 'R$ 23.456,78',
    estado: 'vigente',
  },
  {
    objeto: 'Licença de software para engenharia - AutoCAD',
    setores: ['Pesquisa e Desenv.', 'Engenharia Civil'],
    inicio: '08/07/2026',
    fim: '08/07/2026',
    valor: 'R$ 56.789,01',
    estado: 'vigente',
  },
  {
    objeto: 'Pacote empresarial de gestão de projetos - Atlassian Corporate',
    setores: ['Pesquisa e Desenv.', 'Gestão de Projetos', 'Suprimentos', 'Segurança do Trabalho'],
    inicio: '22/06/2026',
    fim: '22/06/2026',
    valor: 'R$ 67.890,12',
    estado: 'vigente',
  },
  {
    objeto: 'Licença Google Cloud IA - Workspace',
    setores: ['Pesquisa e Desenv.'],
    inicio: '25/05/2026',
    fim: '25/05/2026',
    valor: 'R$ 89.012,34',
    estado: 'vigente',
  },
  {
    objeto: 'Licença Figma Dev',
    setores: ['Pesquisa e Desenv.'],
    inicio: '15/04/2026',
    fim: '15/04/2026',
    valor: 'R$ 12.345,67',
    estado: 'aguardando',
  },
  {
    objeto: 'Licença de software - Pacote Office Pro',
    setores: ['Pesquisa e Desenv.', 'Gestão de projetos', 'Recursos Humanos', 'Suprimentos'],
    inicio: '12/03/2026',
    fim: '12/03/2026',
    valor: 'R$ 10.234,56',
    estado: 'encerrado',
  },
  {
    objeto: 'Licença Figma Dev',
    setores: ['Pesquisa e Desenv.'],
    inicio: '04/02/2026',
    fim: '04/02/2026',
    valor: 'R$ 43.210,98',
    estado: 'cancelado',
  },
];

/* Colunas da tabela — Figma: objeto 264 / setores 304 / início 160 / fim 148 /
   valor 160 / estado 180. Objeto estica; demais fixas. Gap 16. */
const gridCols = 'minmax(220px, 1fr) 304px 160px 148px 160px 180px';

/* -------------------------------------------------------------------------- */
/* Página                                                                      */
/* -------------------------------------------------------------------------- */

export default function ListaContratos({ onAdd }: { onAdd?: () => void }) {
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
          <div style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-8)', overflow: 'hidden' }}>
            {/* Cabeçalho */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                columnGap: 'var(--spacing-16)',
                alignItems: 'center',
                background: 'var(--color-bg-card)',
                padding: '0 var(--spacing-16)',
              }}
            >
              <HeaderCell sortable>Objeto do contrato</HeaderCell>
              <HeaderCell>Setores beneficiados</HeaderCell>
              <HeaderCell sortable>Início de contrato</HeaderCell>
              <HeaderCell sortable>Fim de contrato</HeaderCell>
              <HeaderCell sortable>Valor do contrato</HeaderCell>
              <HeaderCell sortable>Estado</HeaderCell>
            </div>

            {/* Linhas */}
            {CONTRATOS.map((c, i) => (
              <div
                key={i}
                className="lc-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: gridCols,
                  columnGap: 'var(--spacing-16)',
                  alignItems: 'center',
                  minHeight: 80,
                  padding: 'var(--spacing-12) var(--spacing-16)',
                  borderTop: `1px solid ${i === 0 ? 'var(--color-border-default)' : 'var(--color-border-subtle)'}`,
                }}
              >
                <Cell title>{c.objeto}</Cell>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)', padding: 'var(--spacing-8) 0' }}>
                  {c.setores.map((s) => (
                    <Tag key={s} tone="brand">{s}</Tag>
                  ))}
                </div>
                <Cell>{c.inicio}</Cell>
                <Cell>{c.fim}</Cell>
                <Cell tabular>{c.valor}</Cell>
                <div style={{ padding: 'var(--spacing-8) 0' }}>
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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponentes                                                              */
/* -------------------------------------------------------------------------- */

function HeaderCell({ children, sortable = false }: { children: ReactNode; sortable?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', padding: 'var(--spacing-12) var(--spacing-8)' }}>
      <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: 'var(--color-text-title)' }}>{children}</span>
      {sortable && <ArrowUpDown size={15} strokeWidth={1.66} color="var(--color-icon-secondary)" />}
    </div>
  );
}

function Cell({ children, title = false, tabular = false }: { children: ReactNode; title?: boolean; tabular?: boolean }) {
  return (
    <div
      style={{
        padding: 'var(--spacing-8)',
        fontSize: 14,
        lineHeight: '20px',
        color: title ? 'var(--color-text-title)' : 'var(--color-text-body)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontVariantNumeric: tabular ? 'tabular-nums' : undefined,
      }}
    >
      {children}
    </div>
  );
}

type TagTone = 'brand' | 'success' | 'warning' | 'error' | 'neutral';

/* tom → cores (bg / borda / texto), espelhando o componente Tags do Figma */
const TAG_TONE: Record<TagTone, CSSProperties> = {
  brand: { background: 'var(--color-brand-muted)', borderColor: 'var(--color-border-brand)', color: 'var(--color-text-brand)' },
  success: { background: 'var(--color-success-subtle)', borderColor: 'var(--color-success-default)', color: 'var(--color-success-default)' },
  warning: { background: 'var(--color-warning-subtle)', borderColor: 'var(--color-warning-default)', color: 'var(--color-warning-default)' },
  error: { background: 'var(--color-error-subtle)', borderColor: 'var(--color-error-default)', color: 'var(--color-error-default)' },
  neutral: { background: 'var(--color-info-subtle)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' },
};

function Tag({ children, tone }: { children: ReactNode; tone: TagTone }) {
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
