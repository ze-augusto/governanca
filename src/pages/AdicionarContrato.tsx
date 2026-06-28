import { useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { Pencil, Trash2, Check, X, AlertTriangle, Plus } from 'lucide-react';
import { Tag, ESTADO_LABEL, ESTADO_TONE, type Contrato } from './ListaContratos';
import './AdicionarContrato.css';

/* -------------------------------------------------------------------------- */
/* Dados (mock — vindos do protótipo)                                          */
/* -------------------------------------------------------------------------- */

type Item = {
  desc: string;
  unidade: string;
  quant: string;
  unit: string;
  total: string;
};

const ORG: Item = { desc: 'Licença Figma Organization', unidade: 'Anual', quant: '3', unit: 'R$ 1.017,59', total: 'R$ 3.052,77' };
const DEV: Item = { desc: 'Licença Figma Dev', unidade: 'Anual', quant: '3', unit: 'R$ 305,28', total: 'R$ 915,84' };
const ITENS: Item[] = [ORG, ORG, ORG, ORG, DEV, DEV, DEV, DEV, DEV, DEV];

/* Item em branco — base para adicionar uma nova linha */
const ITEM_VAZIO: Item = { desc: '', unidade: '', quant: '', unit: '', total: '' };

/* Parse de número em formato BR (ex.: "R$ 1.017,59" → 1017.59; "3 anos" → 3).
   Remove milhar (.), troca vírgula decimal por ponto. */
function parseBR(str: string): number {
  const m = str.replace(/[^\d.,]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = parseFloat(m);
  return Number.isFinite(n) ? n : 0;
}

/* Formata número como moeda BR (ex.: 3052.77 → "R$ 3.052,77"). */
function formatBRL(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* Valor total = quantidade × valor unitário. */
function calcTotal(quant: string, unit: string): string {
  return formatBRL(parseBR(quant) * parseBR(unit));
}

/* Valores extraídos do contrato (estado pós-upload) */
const CONTRATO = {
  objeto: 'Licenças de software de design de interfaces — Figma',
  uf: 'CE',
  valor: 'R$ 17.706,12',
  dataInicio: '01/01/2026',
  dataFim: '01/01/2029',
  empresa: 'Software Mais',
  cnpj: '72.333.486/0001-90',
  representante: 'Maria Alsanir Sousa Silva',
  cpf: '123.456.789-10',
};

/* Placeholders (estado pré-upload) — Figma node 60:1111 */
const PLACEHOLDERS = {
  objeto: 'Ex.: Licenças de software de gestão',
  uf: 'Ex.: DF',
  valor: 'R$ 0,00',
  data: 'DD/MM/AAAA',
  empresa: 'Ex.: Empresa ABC',
  cnpj: '00.000.000/0000-00',
  representante: 'Ex.: João da Silva',
  cpf: '000.000.000-00',
};

const SETORES_INICIAIS = [
  { nome: 'Almoxarifado', checked: false },
  { nome: 'Pesquisa e Desenv.', checked: false },
  { nome: 'Gestão de Projetos', checked: false },
  { nome: 'Suprimentos', checked: false },
  { nome: 'Recursos Humanos', checked: false },
  { nome: 'Segurança do Trabalho', checked: false },
  { nome: 'Engenharia Civil', checked: false },
];

/* marca como selecionados os setores que o contrato já beneficia (match
   tolerante a caixa/espaços, pois os nomes da lista variam) */
function setoresFrom(nomes: string[]): typeof SETORES_INICIAIS {
  const norm = (s: string) => s.trim().toLowerCase();
  const sel = new Set(nomes.map(norm));
  return SETORES_INICIAIS.map((s) => ({ ...s, checked: sel.has(norm(s.nome)) }));
}

/* Contratante fictício (órgão público) — base do contrato gerado */
const CONTRATANTE = {
  nome: 'CONSELHO NACIONAL DE GESTÃO PÚBLICA — CNGP',
  cnpj: '00.394.460/0008-07',
  endereco: 'SAS Quadra 03, Lote 5/6, Bloco "O", Asa Sul, Brasília/DF, CEP 70.070-030',
  representante: 'Dr. Antônio Carlos Pereira Lima',
  cargo: 'Diretor-Geral',
  numero: '024/2026',
  processo: '2026.0001.024-7',
};

/* nº total de páginas do contrato gerado (ver VisualizadorContrato) */
const TOTAL_PAGINAS = 11;

/* -------------------------------------------------------------------------- */
/* Estilos reutilizados                                                        */
/* -------------------------------------------------------------------------- */

/* Input — Figma: altura 36, radius 8, border default, texto 14 */
const field: CSSProperties = {
  height: 36,
  display: 'flex',
  alignItems: 'center',
  padding: '0 var(--spacing-12)',
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-8)',
  fontSize: 14,
  color: 'var(--color-text-body)',
};

/* Label — Figma: caption 12, line-height 16, gap p/ input 4 */
const fieldLabel: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '16px',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--spacing-4)',
};

/* Título de seção — Figma: text-small-semibold 14/20, gap p/ campos 12 */
const sectionTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  color: 'var(--color-text-title)',
  marginBottom: 'var(--spacing-12)',
};

/* Divisor entre seções — Figma: gap de 16 entre blocos */
const sectionDivider: CSSProperties = {
  paddingTop: 'var(--spacing-16)',
  marginTop: 'var(--spacing-16)',
  borderTop: '1px solid var(--cinza-200)',
};

/* Colunas da tabela — Figma: desc ≥136 + larguras fixas, gap 16 entre colunas */
const gridCols = 'minmax(136px, 1fr) 84px 64px 124px 124px 96px';

/* -------------------------------------------------------------------------- */
/* Ícones                                                                      */
/* -------------------------------------------------------------------------- */

const CalendarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Página                                                                      */
/* -------------------------------------------------------------------------- */

const FORM_VAZIO = {
  objeto: '',
  uf: '',
  valor: '',
  dataInicio: '',
  dataFim: '',
  empresa: '',
  cnpj: '',
  representante: '',
  cpf: '',
};

export default function AdicionarContrato({ onBack, contrato, onSaved }: { onBack?: () => void; contrato?: Contrato; onSaved?: (nome: string) => void }) {
  /* modo visualizar = abrimos um contrato existente (vindo da lista) */
  const modoVisualizar = !!contrato;
  const [uploaded, setUploaded] = useState(modoVisualizar);
  /* só-leitura por padrão ao visualizar — usuário habilita a edição */
  const [readOnly, setReadOnly] = useState(modoVisualizar);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(contrato ? `${contrato.objeto}.pdf` : '');
  const [setores, setSetores] = useState(contrato ? setoresFrom(contrato.setores) : SETORES_INICIAIS);
  const [form, setForm] = useState(
    contrato
      ? {
          objeto: contrato.objeto,
          uf: contrato.uf,
          valor: contrato.valor,
          dataInicio: contrato.inicio,
          dataFim: contrato.fim,
          empresa: CONTRATO.empresa,
          cnpj: CONTRATO.cnpj,
          representante: CONTRATO.representante,
          cpf: CONTRATO.cpf,
        }
      : FORM_VAZIO,
  );
  const [paginaAtual, setPaginaAtual] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfScrollRef = useRef<HTMLDivElement>(null);

  /* atualiza o nº da página visível conforme o scroll do visualizador */
  const onScrollPdf = () => {
    const el = pdfScrollRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    let atual = 1;
    Array.from(el.children).forEach((c, i) => {
      if ((c as HTMLElement).getBoundingClientRect().top - top <= 80) atual = i + 1;
    });
    setPaginaAtual(atual);
  };

  /* Upload: lê o arquivo, mostra carregamento por 3s e extrai os dados */
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setTimeout(() => {
      setForm({
        objeto: CONTRATO.objeto,
        uf: CONTRATO.uf,
        valor: CONTRATO.valor,
        dataInicio: CONTRATO.dataInicio,
        dataFim: CONTRATO.dataFim,
        empresa: CONTRATO.empresa,
        cnpj: CONTRATO.cnpj,
        representante: CONTRATO.representante,
        cpf: CONTRATO.cpf,
      });
      setLoading(false);
      setUploaded(true);
      setPaginaAtual(1);
    }, 3000);
    e.target.value = '';
  };

  const setField = (campo: keyof typeof FORM_VAZIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  /* campos liberados só com upload feito E fora do modo só-leitura */
  const podeEditar = uploaded && !readOnly;
  /* visualização pura — exibe os dados sem inputs (Figma 132:7412) */
  const somenteLeitura = readOnly;
  /* na visualização, rótulo cola no valor (sem margem de 4px) */
  const labelStyle = somenteLeitura ? { ...fieldLabel, marginBottom: 0 } : fieldLabel;

  const toggle = (i: number) => {
    if (!podeEditar) return;
    setSetores((s) => s.map((x, j) => (j === i ? { ...x, checked: !x.checked } : x)));
  };

  /* salvar habilitado só com edição liberada E ao menos um setor selecionado */
  const podeSalvar = podeEditar && setores.some((s) => s.checked);

  /* itens contratados — do contrato aberto (visualizar) ou mock padrão (novo) */
  const [itens, setItens] = useState<Item[]>(contrato?.itens ?? ITENS);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<Item | null>(null);
  /* linha em edição é nova (recém-adicionada) — cancelar remove a linha */
  const [adding, setAdding] = useState(false);
  /* índice pendente de exclusão — abre o modal de confirmação */
  const [delIdx, setDelIdx] = useState<number | null>(null);

  const confirmDelete = () => {
    if (delIdx === null) return;
    setItens((arr) => arr.filter((_, j) => j !== delIdx));
    setDelIdx(null);
  };

  const startEdit = (i: number) => {
    setEditIdx(i);
    setAdding(false);
    /* unit editável sem o prefixo "R$" — só o número fica no input */
    setDraft({ ...itens[i], unit: itens[i].unit.replace(/^R\$\s*/, '') });
  };
  /* adiciona uma linha em branco e entra direto no modo de edição */
  const addItem = () => {
    setItens((arr) => [...arr, { ...ITEM_VAZIO }]);
    setEditIdx(itens.length);
    setDraft({ ...ITEM_VAZIO });
    setAdding(true);
  };
  const cancelEdit = () => {
    /* item novo cancelado não persiste — remove a linha em branco */
    if (adding && editIdx !== null) setItens((arr) => arr.filter((_, j) => j !== editIdx));
    setEditIdx(null);
    setDraft(null);
    setAdding(false);
  };
  const saveEdit = () => {
    if (editIdx === null || !draft) return;
    /* repõe o prefixo "R$" e normaliza o valor unitário */
    const saved = { ...draft, unit: formatBRL(parseBR(draft.unit)), total: calcTotal(draft.quant, draft.unit) };
    setItens((arr) => arr.map((it, j) => (j === editIdx ? saved : it)));
    setEditIdx(null);
    setDraft(null);
    setAdding(false);
  };
  const setDraftField = (k: keyof Item) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDraft((d) => (d ? { ...d, [k]: v } : d));
  };
  /* quantidade só aceita números — texto quebra os cálculos e a formatação */
  const setDraftQuant = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '');
    setDraft((d) => (d ? { ...d, quant: v } : d));
  };

  return (
    <div className="app-shell">
      {/* Sidebar rail — coluna 1 do shell. Figma: largura 52, ícones centrados */}
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
        {/* Logo */}
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-64)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M12 3 L22 20 H2 Z" fill="var(--color-brand-default)" />
          </svg>
        </div>
        {/* Ícones de navegação — gap 32 (Figma) */}
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

      {/* Coluna direita — coluna 2 do shell */}
      <div className="content-column">
        {/* Top bar */}
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
            justifyContent: 'space-between',
            padding: '0 var(--spacing-24) 0 var(--spacing-36)',
            flex: 'none',
          }}
        >
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', fontSize: 14, color: 'var(--color-text-secondary)' }}>
            <span>Início</span>
            <span style={{ color: 'var(--color-border-default)' }}>/</span>
            <button
              onClick={onBack}
              style={{ border: 'none', background: 'transparent', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer' }}
            >
              Lista de contratos
            </button>
            <span style={{ color: 'var(--color-border-default)' }}>/</span>
            <span style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>
              {modoVisualizar ? 'Visualizar contrato' : 'Adicionar contrato'}
            </span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
              {modoVisualizar && readOnly ? (
                <>
                  <button onClick={onBack} className="ac-btn ac-btn--secondary">Voltar</button>
                  <button onClick={() => setReadOnly(false)} className="ac-btn ac-btn--primary">
                    Editar contrato
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={modoVisualizar ? () => setReadOnly(true) : onBack}
                    className="ac-btn ac-btn--secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!podeSalvar}
                    onClick={modoVisualizar ? () => setReadOnly(true) : () => onSaved?.(form.objeto)}
                    className={`ac-btn ${podeSalvar ? 'ac-btn--primary' : 'ac-btn--disabled'}`}
                  >
                    {modoVisualizar ? 'Salvar alterações' : 'Salvar contrato'}
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo — grid de 12 colunas */}
        <main className="content-grid">
          {/* ESQUERDA — preview do PDF (5 de 12 colunas) */}
          <section
            className="col-span-5"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--cinza-300)',
              borderRadius: 'var(--radius-8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 116px)',
            }}
          >
            {/* Cabeçalho — Figma 60:1137: padding 16/8, borda default, caption 12 */}
            <div style={{ flex: 'none', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-16)', borderBottom: '1px solid var(--color-border-default)' }}>
              <span style={{ fontSize: 12, lineHeight: '16px', color: uploaded ? 'var(--color-text-body)' : 'var(--color-text-secondary)' }}>
                {uploaded ? fileName : 'Sem arquivos adicionados'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 24, border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-4)', color: 'var(--color-text-body)' }}>
                  {uploaded ? paginaAtual : '-'}
                </span>
                <span style={{ width: 36, textAlign: 'center' }}>{uploaded ? `/ ${TOTAL_PAGINAS}` : '/ -'}</span>
              </div>
            </div>
            {/* Input de arquivo real (oculto) — acionado pela dropzone */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
            {/* Corpo — pós-upload: visualizador de PDF com scroll; carregando: spinner; pré: dropzone */}
            {uploaded ? (
              <div
                ref={pdfScrollRef}
                onScroll={onScrollPdf}
                style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-16)', background: 'var(--cinza-300)' }}
              >
                <VisualizadorContrato dados={form} itens={itens} />
              </div>
            ) : loading ? (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-16)', background: 'var(--cinza-300)' }}>
                <div
                  style={{
                    minHeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-16)',
                    padding: 'var(--spacing-24)',
                    border: '1px dashed #616161',
                    borderRadius: 'var(--radius-8)',
                    background: 'var(--color-bg-card)',
                  }}
                >
                  <span className="upload-spinner" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: 'var(--color-text-title)' }}>
                      Aguarde enquanto o arquivo é processado
                    </span>
                    <span style={{ fontSize: 12, lineHeight: '16px', color: 'var(--color-text-secondary)' }}>
                      Em poucos segundos seu arquivo estará pronto
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-16)', background: 'var(--cinza-300)', boxShadow: '0px 2px 8px rgba(0, 51, 51, 0.12)' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    minHeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-16)',
                    padding: 'var(--spacing-8) var(--spacing-16) var(--spacing-8) var(--spacing-24)',
                    border: '1px dashed #616161',
                    borderRadius: 'var(--radius-8)',
                    background: 'var(--color-bg-card)',
                    cursor: 'pointer',
                  }}
                >
                  <UploadIcon />
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
                      <span style={{ color: 'var(--color-brand-default)' }}>Clique aqui</span>
                      <span style={{ color: 'var(--color-text-title)' }}> ou arraste e solte o arquivo</span>
                    </span>
                    <span style={{ fontSize: 12, lineHeight: '16px', color: 'var(--color-text-secondary)' }}>Arquivo em PDF e tamanho máximo de 50MB</span>
                  </span>
                </button>
              </div>
            )}
          </section>

          {/* DIREITA — formulário (7 de 12 colunas) */}
          <section
            className="col-span-7"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--cinza-300)',
              borderRadius: 'var(--radius-8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 116px)',
            }}
          >
            {/* Cabeçalho do painel — Figma: altura 48, título 16/600, padding 16 */}
            <div
              style={{
                flex: 'none',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-12)',
                padding: '0 var(--spacing-16)',
                borderBottom: '1px solid var(--cinza-200)',
              }}
            >
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: 'var(--color-text-title)' }}>
                Dados do contrato
              </h1>
              {/* Estado do contrato — tag do design system, no cabeçalho do painel */}
              {modoVisualizar && contrato && (
                <Tag tone={ESTADO_TONE[contrato.estado]}>{ESTADO_LABEL[contrato.estado]}</Tag>
              )}
            </div>

            {/* Corpo — scroll próprio. Carregando: skeleton */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {loading ? (
              <FormSkeleton />
            ) : (
            <div style={{ padding: 'var(--spacing-16)' }}>
              {/* Dados gerais */}
              <div>
                <div style={sectionTitle}>Dados gerais</div>
                <div style={{ marginBottom: 'var(--spacing-16)' }}>
                  <label style={labelStyle}>Objeto do contrato</label>
                  <Field plain={somenteLeitura} disabled={!podeEditar} value={form.objeto} onChange={setField('objeto')} placeholder={PLACEHOLDERS.objeto} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'var(--spacing-16)' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>UF contratante</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.uf} onChange={setField('uf')} placeholder={PLACEHOLDERS.uf} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Valor do contrato</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.valor} onChange={setField('valor')} placeholder={PLACEHOLDERS.valor} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Data de início do contrato</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.dataInicio} onChange={setField('dataInicio')} placeholder={PLACEHOLDERS.data} icon={<CalendarIcon />} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Data de fim de contrato</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.dataFim} onChange={setField('dataFim')} placeholder={PLACEHOLDERS.data} icon={<CalendarIcon />} />
                  </div>
                </div>
              </div>

              {/* Dados do contratado — Figma: colunas 2:1 (nome largo / doc estreito) */}
              <div style={sectionDivider}>
                <div style={sectionTitle}>Dados do contratado</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'var(--spacing-16)' }}>
                  <div style={{ gridColumn: 'span 3', minWidth: 0 }}>
                    <label style={labelStyle}>Nome da empresa contratada</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.empresa} onChange={setField('empresa')} placeholder={PLACEHOLDERS.empresa} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>CNPJ</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.cnpj} onChange={setField('cnpj')} placeholder={PLACEHOLDERS.cnpj} />
                  </div>
                  <div style={{ gridColumn: 'span 3', minWidth: 0 }}>
                    <label style={labelStyle}>Representante da empresa contratada</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.representante} onChange={setField('representante')} placeholder={PLACEHOLDERS.representante} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>CPF</label>
                    <Field plain={somenteLeitura} disabled={!podeEditar} value={form.cpf} onChange={setField('cpf')} placeholder={PLACEHOLDERS.cpf} />
                  </div>
                </div>
              </div>

              {/* Setor(es) beneficiado(s) — antes da lista de itens */}
              <div style={sectionDivider}>
                <div style={{ ...sectionTitle, marginBottom: 'var(--spacing-4)' }}>Setor(es) beneficiado(s)</div>
                <p style={{ margin: '0 0 var(--spacing-12)', fontSize: 12, lineHeight: '16px', color: 'var(--color-text-secondary)' }}>
                  Informe os setores da empresa que serão atendidos por este contrato
                </p>

                {somenteLeitura ? (
                  /* Visualização — setores como tags do design system (Figma 132:7665) */
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
                    {setores.some((s) => s.checked) ? (
                      setores.filter((s) => s.checked).map((s) => (
                        <Tag key={s.nome} tone="brand">{s.nome}</Tag>
                      ))
                    ) : (
                      <span style={{ fontSize: 14, lineHeight: '20px', color: 'var(--color-text-secondary)' }}>—</span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-16)' }}>
                    {setores.map((setor, i) => (
                      <button
                        key={setor.nome}
                        onClick={() => toggle(i)}
                        disabled={!podeEditar}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-8)',
                          textAlign: 'left',
                          height: 44,
                          padding: '0 var(--spacing-16)',
                          borderRadius: 'var(--radius-8)',
                          border: `1px solid ${!uploaded ? 'var(--cinza-300)' : setor.checked ? 'var(--color-brand-default)' : 'var(--color-border-default)'}`,
                          background: !uploaded
                            ? 'var(--cinza-200)'
                            : setor.checked
                              ? 'var(--color-brand-muted)'
                              : 'var(--color-bg-card)',
                          cursor: podeEditar ? 'pointer' : 'default',
                          fontSize: 14,
                          color: uploaded ? 'var(--color-text-body)' : 'var(--color-text-disabled)',
                        }}
                      >
                        <span
                          style={{
                            width: uploaded ? 20 : 18,
                            height: uploaded ? 20 : 18,
                            flex: 'none',
                            borderRadius: uploaded ? 'var(--radius-4)' : 'var(--radius-2)',
                            border: `${uploaded ? '1.5px' : '1px'} solid ${!uploaded ? 'var(--color-icon-disabled)' : setor.checked ? 'var(--color-brand-default)' : 'var(--color-border-default)'}`,
                            background: !uploaded ? 'transparent' : setor.checked ? 'var(--color-brand-default)' : 'var(--color-bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-text-inverse)',
                          }}
                        >
                          {setor.checked && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </span>
                        <span style={{ color: setor.checked ? 'var(--color-text-brand)' : undefined }}>
                          {setor.nome}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Itens contratados — Figma: card com borda completa, linhas com border-top */}
              <div style={sectionDivider}>
                <div style={sectionTitle}>Itens contratados</div>
                <div style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-8)', overflow: 'hidden' }}>
                  {/* Cabeçalho — texto título 12/600 (semibold) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: gridCols,
                      columnGap: 'var(--spacing-16)',
                      alignItems: 'center',
                      height: 40,
                      padding: '0 var(--spacing-16)',
                      fontSize: 14,
                      fontWeight: 600,
                      lineHeight: '20px',
                      color: 'var(--color-text-title)',
                    }}
                  >
                    <div>Descrição</div>
                    <div>Unidade</div>
                    <div>Quant.</div>
                    <div>Valor Unit.</div>
                    <div>Valor total</div>
                    <div />
                  </div>
                  {uploaded ? (
                    itens.map((item, i) => {
                      const editing = editIdx === i;
                      return (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: gridCols,
                          columnGap: 'var(--spacing-16)',
                          alignItems: 'center',
                          minHeight: 60,
                          padding: '0 var(--spacing-16)',
                          borderTop: `1px solid ${i === 0 ? 'var(--color-border-default)' : 'var(--color-border-subtle)'}`,
                          fontSize: 14,
                          lineHeight: '20px',
                        }}
                      >
                        {editing && draft ? (
                          <>
                            <Field disabled={false} value={draft.desc} onChange={setDraftField('desc')} placeholder="Descrição" />
                            <Field disabled={false} value={draft.unidade} onChange={setDraftField('unidade')} placeholder="Unidade" />
                            <Field disabled={false} value={draft.quant} onChange={setDraftQuant} placeholder="Quant." />
                            <Field
                              disabled={false}
                              value={draft.unit}
                              onChange={setDraftField('unit')}
                              placeholder="0,00"
                              icon={<span style={{ flex: 'none', fontSize: 14, color: 'var(--color-text-secondary)' }}>R$</span>}
                            />
                            {/* total é calculado (quant × unit) — campo só-leitura */}
                            <Field disabled value={calcTotal(draft.quant, draft.unit)} onChange={() => {}} placeholder="Valor total" />
                            <div style={{ display: 'flex', gap: 'var(--spacing-8)', justifyContent: 'flex-end' }}>
                              <button className="icon-btn" aria-label="Cancelar edição" onClick={cancelEdit}>
                                <X size={15} strokeWidth={1.66} />
                              </button>
                              <button className="icon-btn icon-btn--primary" aria-label="Salvar item" onClick={saveEdit}>
                                <Check size={15} strokeWidth={1.66} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ color: 'var(--color-text-title)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                            <div style={{ color: 'var(--color-text-secondary)' }}>{item.unidade}</div>
                            <div style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{item.quant}</div>
                            <div style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{item.unit}</div>
                            <div style={{ color: 'var(--color-text-body)', fontVariantNumeric: 'tabular-nums' }}>{item.total}</div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-8)', justifyContent: 'flex-end' }}>
                              {podeEditar && (
                                <>
                                  <button className="icon-btn" aria-label="Editar item" onClick={() => startEdit(i)} disabled={editIdx !== null}>
                                    <Pencil size={15} strokeWidth={1.66} />
                                  </button>
                                  <button className="icon-btn icon-btn--danger" aria-label="Excluir item" disabled={editIdx !== null} onClick={() => setDelIdx(i)}>
                                    <Trash2 size={15} strokeWidth={1.66} />
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '36px var(--spacing-16)', textAlign: 'center', fontSize: 14, color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-default)' }}>
                      Adicione um contrato para visualizar seus itens
                    </div>
                  )}
                  {/* Adicionar item — só no modo de edição; entra direto na nova linha */}
                  {podeEditar && (
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={editIdx !== null}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--spacing-8)',
                        width: '100%',
                        minHeight: 44,
                        padding: '0 var(--spacing-16)',
                        border: 'none',
                        borderTop: '1px solid var(--color-border-default)',
                        background: 'transparent',
                        color: editIdx !== null ? 'var(--color-text-disabled)' : 'var(--color-text-brand)',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: editIdx !== null ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Plus size={16} strokeWidth={1.66} />
                      Adicionar item
                    </button>
                  )}
                  {/* Rodapé — border-top default, texto 12/600 #212121 (Cinza P do Figma) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 40, padding: '0 var(--spacing-16)', borderTop: '1px solid var(--color-border-default)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#212121' }}>
                      Total de itens: {uploaded ? itens.length : '-'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#212121', fontVariantNumeric: 'tabular-nums' }}>
                      Valor total dos itens: {uploaded ? formatBRL(itens.reduce((s, it) => s + parseBR(it.total), 0)) : 'R$ 0,00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            )}
            </div>
          </section>
        </main>
      </div>

      {delIdx !== null && (
        <ConfirmModal
          item={itens[delIdx]}
          onCancel={() => setDelIdx(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Visualizador do contrato (PDF fictício)                                     */
/* -------------------------------------------------------------------------- */

/* Folha — uma página do documento, com sombra e nº de rodapé */
const folhaStyle: CSSProperties = {
  background: '#ffffff',
  color: '#1f2328',
  borderRadius: 2,
  boxShadow: '0 1px 6px rgba(0, 30, 60, 0.16)',
  padding: '48px 52px 28px',
  marginBottom: 'var(--spacing-16)',
  minHeight: 760,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: 12.5,
  lineHeight: 1.75,
  textAlign: 'justify',
};
const cl: CSSProperties = { fontWeight: 700, textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.3, margin: '20px 0 8px' };
const pgFooter: CSSProperties = { marginTop: 'auto', paddingTop: 24, textAlign: 'center', fontSize: 10.5, color: '#8a93a0', letterSpacing: 0.4 };

function Folha({ numero, children }: { numero: number; children: ReactNode }) {
  return (
    <div style={folhaStyle}>
      <div style={{ flex: 1 }}>{children}</div>
      <div style={pgFooter}>
        {CONTRATANTE.nome.split(' — ')[1] ?? 'CNGP'} · Contrato nº {CONTRATANTE.numero} — Página {numero} de {TOTAL_PAGINAS}
      </div>
    </div>
  );
}

/* Documento completo — 11 páginas, geradas a partir dos dados do contrato.
   Recebe os valores do formulário e os itens — o PDF reflete o que está na tela. */
function VisualizadorContrato({ dados, itens }: { dados: typeof FORM_VAZIO; itens: Item[] }) {
  const C = dados;
  return (
    <>
      {/* 1 — Rosto e preâmbulo */}
      <Folha numero={1}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}>{CONTRATANTE.nome}</div>
          <div style={{ fontSize: 11, color: '#5d6779' }}>CNPJ {CONTRATANTE.cnpj}</div>
        </div>
        <h2 style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, margin: '28px 0 4px' }}>
          CONTRATO ADMINISTRATIVO Nº {CONTRATANTE.numero}
        </h2>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#5d6779', margin: '0 0 24px' }}>
          Processo Administrativo nº {CONTRATANTE.processo}
        </p>
        <p>
          Contrato de fornecimento que entre si celebram o <b>{CONTRATANTE.nome}</b> e a empresa{' '}
          <b>{C.empresa}</b>, tendo por objeto {C.objeto.toLowerCase()}, na forma e condições estabelecidas
          nas cláusulas seguintes.
        </p>
        <p style={{ marginTop: 16 }}>
          Pelo presente instrumento particular, de um lado o <b>CONTRATANTE</b>, {CONTRATANTE.nome}, inscrito
          no CNPJ sob o nº {CONTRATANTE.cnpj}, com sede em {CONTRATANTE.endereco}, neste ato representado por
          seu {CONTRATANTE.cargo}, {CONTRATANTE.representante}; e, de outro lado, a <b>CONTRATADA</b>,{' '}
          {C.empresa}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {C.cnpj}, neste ato
          representada por {C.representante}, inscrito(a) no CPF sob o nº {C.cpf}; têm entre si, justo e
          acordado, o presente contrato, mediante as cláusulas e condições a seguir.
        </p>
      </Folha>

      {/* 2 — Objeto */}
      <Folha numero={2}>
        <div style={cl}>Cláusula Primeira — Do Objeto</div>
        <p>
          1.1. O presente contrato tem por objeto {C.objeto}, conforme especificações técnicas, quantitativos e
          condições constantes do Termo de Referência e da proposta apresentada pela CONTRATADA, que passam a
          integrar este instrumento independentemente de transcrição.
        </p>
        <p>1.2. Integram ainda este contrato, como se nele estivessem transcritos:</p>
        <p style={{ paddingLeft: 24 }}>a) o instrumento convocatório e seus anexos;</p>
        <p style={{ paddingLeft: 24 }}>b) a proposta comercial da CONTRATADA;</p>
        <p style={{ paddingLeft: 24 }}>c) os atos de habilitação e adjudicação do procedimento.</p>
        <p>
          1.3. Eventuais divergências entre os documentos serão resolvidas em favor do interesse público,
          prevalecendo, em qualquer hipótese, as disposições do Termo de Referência.
        </p>
      </Folha>

      {/* 3 — Regime e vinculação */}
      <Folha numero={3}>
        <div style={cl}>Cláusula Segunda — Do Regime de Execução</div>
        <p>
          2.1. O objeto será executado sob o regime de execução indireta, na modalidade de fornecimento
          parcelado mediante demanda, observados os prazos e níveis de serviço definidos no Termo de Referência.
        </p>
        <p>
          2.2. A CONTRATADA obriga-se a manter, durante toda a execução, as condições de habilitação e
          qualificação exigidas na contratação, em compatibilidade com as obrigações assumidas.
        </p>
        <div style={cl}>Cláusula Terceira — Da Vinculação</div>
        <p>
          3.1. Este contrato vincula-se ao instrumento convocatório e à proposta da CONTRATADA, bem como à
          legislação aplicável às contratações públicas, em especial à Lei nº 14.133/2021.
        </p>
      </Folha>

      {/* 4 — Valor */}
      <Folha numero={4}>
        <div style={cl}>Cláusula Quarta — Do Valor</div>
        <p>
          4.1. O valor global do presente contrato é de <b>{C.valor}</b>, nele compreendidos todos os custos
          diretos e indiretos, tributos, encargos sociais e trabalhistas, licenças, seguros e demais despesas
          necessárias à perfeita execução do objeto.
        </p>
        <p>
          4.2. No valor acima estão inclusas todas as despesas com a prestação dos serviços e fornecimento das
          licenças, não cabendo à CONTRATANTE qualquer ônus adicional.
        </p>
        <div style={cl}>Cláusula Quinta — Da Dotação Orçamentária</div>
        <p>
          5.1. As despesas decorrentes deste contrato correrão à conta de dotação orçamentária própria,
          consignada no orçamento vigente do CONTRATANTE, emitindo-se a respectiva nota de empenho.
        </p>
      </Folha>

      {/* 5 — Vigência */}
      <Folha numero={5}>
        <div style={cl}>Cláusula Sexta — Da Vigência</div>
        <p>
          6.1. O prazo de vigência deste contrato inicia-se em <b>{C.dataInicio}</b> e encerra-se em{' '}
          <b>{C.dataFim}</b>, podendo ser prorrogado nas hipóteses e limites legais, mediante termo aditivo,
          desde que demonstrada a vantajosidade da prorrogação.
        </p>
        <p>
          6.2. A eventual prorrogação dependerá de manifestação prévia das partes, com antecedência mínima de
          60 (sessenta) dias do término da vigência.
        </p>
        <p>
          6.3. A vigência não impede a aplicação das sanções por inexecução total ou parcial verificada durante
          a execução do objeto.
        </p>
      </Folha>

      {/* 6 — Especificação / itens */}
      <Folha numero={6}>
        <div style={cl}>Cláusula Sétima — Da Especificação dos Itens</div>
        <p>7.1. Compõem o objeto deste contrato os seguintes itens:</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, margin: '12px 0' }}>
          <thead>
            <tr>
              {['Item', 'Descrição', 'Unid.', 'Quant.', 'Valor Unit.', 'Valor Total'].map((h) => (
                <th key={h} style={{ border: '1px solid #c7ccd4', padding: '5px 7px', textAlign: 'left', background: '#f3f4f5' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itens.map((it, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #c7ccd4', padding: '5px 7px' }}>{i + 1}</td>
                <td style={{ border: '1px solid #c7ccd4', padding: '5px 7px' }}>{it.desc}</td>
                <td style={{ border: '1px solid #c7ccd4', padding: '5px 7px' }}>{it.unidade}</td>
                <td style={{ border: '1px solid #c7ccd4', padding: '5px 7px' }}>{it.quant}</td>
                <td style={{ border: '1px solid #c7ccd4', padding: '5px 7px' }}>{it.unit}</td>
                <td style={{ border: '1px solid #c7ccd4', padding: '5px 7px' }}>{it.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ textAlign: 'right', fontWeight: 700 }}>
          Valor total dos itens: {formatBRL(itens.reduce((s, it) => s + parseBR(it.total), 0))}
        </p>
      </Folha>

      {/* 7 — Obrigações da contratada */}
      <Folha numero={7}>
        <div style={cl}>Cláusula Oitava — Das Obrigações da Contratada</div>
        <p>8.1. Constituem obrigações da CONTRATADA, sem prejuízo das demais previstas neste contrato:</p>
        <p style={{ paddingLeft: 24 }}>a) executar o objeto de acordo com as especificações e prazos pactuados;</p>
        <p style={{ paddingLeft: 24 }}>b) manter preposto para representá-la durante a execução do contrato;</p>
        <p style={{ paddingLeft: 24 }}>c) fornecer as licenças e o suporte técnico nas condições ofertadas;</p>
        <p style={{ paddingLeft: 24 }}>d) responsabilizar-se por danos causados à CONTRATANTE ou a terceiros;</p>
        <p style={{ paddingLeft: 24 }}>e) manter sigilo sobre as informações a que tiver acesso;</p>
        <p style={{ paddingLeft: 24 }}>f) substituir, no prazo fixado, o objeto recusado pela fiscalização.</p>
      </Folha>

      {/* 8 — Obrigações da contratante */}
      <Folha numero={8}>
        <div style={cl}>Cláusula Nona — Das Obrigações da Contratante</div>
        <p>9.1. Constituem obrigações da CONTRATANTE:</p>
        <p style={{ paddingLeft: 24 }}>a) proporcionar as condições necessárias à execução do objeto;</p>
        <p style={{ paddingLeft: 24 }}>b) designar comissão ou gestor para acompanhamento e fiscalização;</p>
        <p style={{ paddingLeft: 24 }}>c) efetuar os pagamentos nos prazos e condições estabelecidos;</p>
        <p style={{ paddingLeft: 24 }}>d) comunicar à CONTRATADA, por escrito, as irregularidades verificadas;</p>
        <p style={{ paddingLeft: 24 }}>e) prestar as informações e esclarecimentos necessários.</p>
      </Folha>

      {/* 9 — Pagamento e fiscalização */}
      <Folha numero={9}>
        <div style={cl}>Cláusula Décima — Do Pagamento</div>
        <p>
          10.1. O pagamento será efetuado em até 30 (trinta) dias após o recebimento definitivo do objeto,
          mediante apresentação de nota fiscal devidamente atestada pela fiscalização.
        </p>
        <p>
          10.2. Havendo erro na nota fiscal ou circunstância que impeça a liquidação, o pagamento ficará
          pendente até a regularização, sem ônus para a CONTRATANTE.
        </p>
        <div style={cl}>Cláusula Décima Primeira — Da Fiscalização</div>
        <p>
          11.1. A execução será acompanhada por gestor e fiscal designados, aos quais competirá registrar as
          ocorrências e determinar as providências necessárias à regularização das faltas observadas.
        </p>
      </Folha>

      {/* 10 — Sanções e rescisão */}
      <Folha numero={10}>
        <div style={cl}>Cláusula Décima Segunda — Das Sanções</div>
        <p>
          12.1. Pela inexecução total ou parcial do objeto, a CONTRATADA estará sujeita às sanções de
          advertência, multa, impedimento de licitar e contratar e declaração de inidoneidade, assegurados o
          contraditório e a ampla defesa.
        </p>
        <div style={cl}>Cláusula Décima Terceira — Da Rescisão</div>
        <p>
          13.1. O contrato poderá ser rescindido nas hipóteses legais, de forma unilateral pela Administração ou
          por acordo entre as partes, sem prejuízo das penalidades cabíveis e da apuração de eventuais perdas e
          danos.
        </p>
      </Folha>

      {/* 11 — Foro e assinaturas */}
      <Folha numero={11}>
        <div style={cl}>Cláusula Décima Quarta — Do Foro</div>
        <p>
          14.1. Fica eleito o foro da Comarca da Capital do Estado ({C.uf}) para dirimir as questões oriundas do
          presente contrato, com renúncia a qualquer outro, por mais privilegiado que seja.
        </p>
        <p style={{ marginTop: 16 }}>
          E, por estarem assim justas e acordadas, as partes firmam o presente instrumento em 2 (duas) vias de
          igual teor e forma, na presença das testemunhas abaixo.
        </p>
        <p style={{ textAlign: 'center', margin: '36px 0 48px' }}>{CONTRATANTE.endereco.split(',').slice(-2).join(',').trim()}, {C.dataInicio}.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32, marginTop: 24 }}>
          <div style={{ flex: 1, textAlign: 'center', borderTop: '1px solid #1f2328', paddingTop: 6, fontSize: 11 }}>
            {CONTRATANTE.representante}<br />CONTRATANTE
          </div>
          <div style={{ flex: 1, textAlign: 'center', borderTop: '1px solid #1f2328', paddingTop: 6, fontSize: 11 }}>
            {C.representante}<br />CONTRATADA
          </div>
        </div>
      </Folha>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponentes                                                              */
/* -------------------------------------------------------------------------- */

/* Barra de skeleton — shimmer (classe .skeleton no CSS) */
const Bar = ({ w, h = 20 }: { w: number | string; h?: number }) => (
  <div className="skeleton" style={{ width: w, height: h }} />
);

/* Skeleton do formulário — exibido durante o processamento (Figma 94:3535) */
function FormSkeleton() {
  const labeled = (largura: number | string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
      <Bar w={96} h={16} />
      <Bar w={largura} h={36} />
    </div>
  );

  return (
    <div style={{ padding: 'var(--spacing-16)' }}>
      {/* Dados gerais */}
      <div>
        <div style={sectionTitle}>Dados gerais</div>
        <div style={{ marginBottom: 'var(--spacing-16)' }}>{labeled('100%')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'var(--spacing-16)' }}>
          {labeled('100%')}
          {labeled('100%')}
          {labeled('100%')}
          {labeled('100%')}
        </div>
      </div>

      {/* Dados do contratado */}
      <div style={sectionDivider}>
        <div style={sectionTitle}>Dados do contratado</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 'var(--spacing-16)' }}>
          <div style={{ gridColumn: 'span 3' }}>{labeled('100%')}</div>
          {labeled('100%')}
          <div style={{ gridColumn: 'span 3' }}>{labeled('100%')}</div>
          {labeled('100%')}
        </div>
      </div>

      {/* Setor(es) beneficiado(s) — antes da lista de itens */}
      <div style={sectionDivider}>
        <div style={{ ...sectionTitle, marginBottom: 'var(--spacing-4)' }}>Setor(es) beneficiado(s)</div>
        <p style={{ margin: '0 0 var(--spacing-12)', fontSize: 12, lineHeight: '16px', color: 'var(--color-text-secondary)' }}>
          Informe os setores da empresa que serão atendidos por este contrato
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-16)' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', height: 44 }}>
              <Bar w={18} h={18} />
              <Bar w={`${50 + ((i * 17) % 40)}%`} />
            </div>
          ))}
        </div>
      </div>

      {/* Itens contratados */}
      <div style={sectionDivider}>
        <div style={sectionTitle}>Itens contratados</div>
        <div style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-8)', overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              columnGap: 'var(--spacing-16)',
              alignItems: 'center',
              height: 40,
              padding: '0 var(--spacing-16)',
              fontSize: 14,
              fontWeight: 600,
              lineHeight: '20px',
              color: 'var(--color-text-title)',
            }}
          >
            <div>Descrição</div>
            <div>Unidade</div>
            <div style={{ textAlign: 'right' }}>Quant.</div>
            <div style={{ textAlign: 'right' }}>Valor Unit.</div>
            <div style={{ textAlign: 'right' }}>Valor total</div>
            <div />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 92, padding: '0 var(--spacing-16)', borderTop: '1px solid var(--color-border-default)' }}>
            <Bar w={312} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, padding: '0 var(--spacing-16)', borderTop: '1px solid var(--color-border-default)' }}>
            <Bar w={108} />
            <Bar w={196} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Campo editável — desabilitado antes do upload, liberado depois.
   plain = visualização pura: exibe o valor como texto, sem caixa/borda. */
function Field({
  disabled,
  plain,
  value,
  onChange,
  placeholder,
  icon,
}: {
  disabled: boolean;
  plain?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: ReactNode;
}) {
  if (plain) {
    return (
      <div
        style={{
          minWidth: 0,
          padding: 'var(--spacing-8) 0',
          fontSize: 14,
          lineHeight: '20px',
          color: 'var(--color-text-body)',
          wordBreak: 'break-word',
        }}
      >
        {value || '—'}
      </div>
    );
  }
  return (
    <div
      style={{
        ...field,
        minWidth: 0,
        gap: icon ? 'var(--spacing-8)' : 0,
        background: disabled ? 'var(--cinza-200)' : 'var(--color-bg-card)',
        borderColor: disabled ? 'var(--cinza-300)' : 'var(--color-border-default)',
        cursor: disabled ? 'not-allowed' : 'text',
      }}
    >
      {icon}
      <input
        className="field-input"
        type="text"
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

/* Modal de confirmação de exclusão — segue o design system (overlay, card
   radius-12, ícone de erro, ações cancelar/excluir) */
function ConfirmModal({ item, onCancel, onConfirm }: { item: Item; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-24)',
        background: 'rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(440px, 100%)',
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-12)',
          padding: 'var(--spacing-24)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-16)' }}>
          <div
            style={{
              flex: 'none',
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-error-subtle)',
              color: 'var(--color-icon-error)',
            }}
          >
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 id="confirm-title" style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: 'var(--color-text-title)' }}>
              Excluir item contratado
            </h2>
            <p style={{ margin: 'var(--spacing-4) 0 0', fontSize: 14, lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
              Tem certeza que deseja excluir <strong style={{ color: 'var(--color-text-body)' }}>{item.desc}</strong>? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-8)', marginTop: 'var(--spacing-24)' }}>
          <button
            onClick={onCancel}
            style={{
              height: 36,
              padding: '0 var(--spacing-16)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--color-border-default)',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-body)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              height: 36,
              padding: '0 var(--spacing-16)',
              borderRadius: 'var(--radius-8)',
              border: '1px solid var(--color-error-default)',
              background: 'var(--color-error-default)',
              color: 'var(--color-text-inverse)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8l-5-5-5 5" />
    <path d="M12 3v12" />
  </svg>
);

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
