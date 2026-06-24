import { useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import './AdicionarContrato.css';
import contratoPreview from '../assets/contrato-preview.png';

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

const ORG: Item = { desc: 'Licença Figma Organization', unidade: 'Anual', quant: '3 anos', unit: 'R$ 1.017,59', total: 'R$ 3.052,77' };
const DEV: Item = { desc: 'Licença Figma Dev', unidade: 'Anual', quant: '3 anos', unit: 'R$ 305,28', total: 'R$ 915,84' };
const ITENS: Item[] = [ORG, ORG, ORG, ORG, DEV, DEV, DEV, DEV, DEV, DEV];

/* Valores extraídos do contrato (estado pós-upload) */
const CONTRATO = {
  objeto: 'Licenças de software de design de interfaces — Figma',
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
  valor: '',
  dataInicio: '',
  dataFim: '',
  empresa: '',
  cnpj: '',
  representante: '',
  cpf: '',
};

export default function AdicionarContrato({ onBack }: { onBack?: () => void }) {
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [setores, setSetores] = useState(SETORES_INICIAIS);
  const [form, setForm] = useState(FORM_VAZIO);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Upload: lê o arquivo, mostra carregamento por 3s e extrai os dados */
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setTimeout(() => {
      setForm({
        objeto: CONTRATO.objeto,
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
    }, 3000);
    e.target.value = '';
  };

  const setField = (campo: keyof typeof FORM_VAZIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const toggle = (i: number) => {
    if (!uploaded) return;
    setSetores((s) => s.map((x, j) => (j === i ? { ...x, checked: !x.checked } : x)));
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
            <span style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Adicionar contrato</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)' }}>
            <button
              onClick={onBack}
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
              disabled={!uploaded}
              style={{
                height: 36,
                padding: '0 var(--spacing-16)',
                borderRadius: 'var(--radius-8)',
                border: `1px solid ${uploaded ? 'var(--color-brand-default)' : 'var(--cinza-400)'}`,
                background: uploaded ? 'var(--color-brand-default)' : 'var(--cinza-400)',
                color: uploaded ? 'var(--color-text-inverse)' : 'var(--cinza-700)',
                fontSize: 14,
                fontWeight: 600,
                cursor: uploaded ? 'pointer' : 'not-allowed',
              }}
            >
              Salvar contrato
            </button>
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
            }}
          >
            {/* Cabeçalho — Figma 60:1137: padding 16/8, borda default, caption 12 */}
            <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-16)', borderBottom: '1px solid var(--color-border-default)' }}>
              <span style={{ fontSize: 12, lineHeight: '16px', color: uploaded ? 'var(--color-text-body)' : 'var(--color-text-secondary)' }}>
                {uploaded ? fileName : 'Sem arquivos adicionados'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 24, border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-4)', color: 'var(--color-text-body)' }}>
                  {uploaded ? '1' : '-'}
                </span>
                <span style={{ width: 36, textAlign: 'center' }}>{uploaded ? '/ 16' : '/ -'}</span>
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
            {/* Corpo — pós-upload: página; carregando: spinner; pré: dropzone */}
            {uploaded ? (
              <div style={{ padding: 'var(--spacing-16)', background: 'var(--cinza-300)' }}>
                <img
                  src={contratoPreview}
                  alt="Pré-visualização do contrato — página 1 de 16"
                  style={{ display: 'block', width: '100%', height: 'auto', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-8)' }}
                />
              </div>
            ) : loading ? (
              <div style={{ padding: 'var(--spacing-16)', background: 'var(--cinza-300)' }}>
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
              <div style={{ padding: 'var(--spacing-16)', background: 'var(--cinza-300)', boxShadow: '0px 2px 8px rgba(0, 51, 51, 0.12)' }}>
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
            }}
          >
            {/* Cabeçalho do painel — Figma: altura 48, título 16/600, padding 16 */}
            <div
              style={{
                height: 48,
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--spacing-16)',
                borderBottom: '1px solid var(--cinza-200)',
              }}
            >
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: '24px', color: 'var(--color-text-title)' }}>
                Dados do contrato
              </h1>
            </div>

            {/* Corpo — padding 16 (Figma). Carregando: skeleton */}
            {loading ? (
              <FormSkeleton />
            ) : (
            <div style={{ padding: 'var(--spacing-16)' }}>
              {/* Dados gerais */}
              <div>
                <div style={sectionTitle}>Dados gerais</div>
                <div style={{ marginBottom: 'var(--spacing-16)' }}>
                  <label style={fieldLabel}>Objeto do contrato</label>
                  <Field disabled={!uploaded} value={form.objeto} onChange={setField('objeto')} placeholder={PLACEHOLDERS.objeto} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-16)' }}>
                  <div>
                    <label style={fieldLabel}>Valor do contrato</label>
                    <Field disabled={!uploaded} value={form.valor} onChange={setField('valor')} placeholder={PLACEHOLDERS.valor} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Data de início do contrato</label>
                    <Field disabled={!uploaded} value={form.dataInicio} onChange={setField('dataInicio')} placeholder={PLACEHOLDERS.data} icon={<CalendarIcon />} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Data de fim de contrato</label>
                    <Field disabled={!uploaded} value={form.dataFim} onChange={setField('dataFim')} placeholder={PLACEHOLDERS.data} icon={<CalendarIcon />} />
                  </div>
                </div>
              </div>

              {/* Dados do contratado — Figma: colunas 2:1 (nome largo / doc estreito) */}
              <div style={sectionDivider}>
                <div style={sectionTitle}>Dados do contratado</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-16)' }}>
                  <div>
                    <label style={fieldLabel}>Nome da empresa contratada</label>
                    <Field disabled={!uploaded} value={form.empresa} onChange={setField('empresa')} placeholder={PLACEHOLDERS.empresa} />
                  </div>
                  <div>
                    <label style={fieldLabel}>CNPJ</label>
                    <Field disabled={!uploaded} value={form.cnpj} onChange={setField('cnpj')} placeholder={PLACEHOLDERS.cnpj} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Representante da empresa contratada</label>
                    <Field disabled={!uploaded} value={form.representante} onChange={setField('representante')} placeholder={PLACEHOLDERS.representante} />
                  </div>
                  <div>
                    <label style={fieldLabel}>CPF</label>
                    <Field disabled={!uploaded} value={form.cpf} onChange={setField('cpf')} placeholder={PLACEHOLDERS.cpf} />
                  </div>
                </div>
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
                    <div style={{ textAlign: 'right' }}>Quant.</div>
                    <div style={{ textAlign: 'right' }}>Valor Unit.</div>
                    <div style={{ textAlign: 'right' }}>Valor total</div>
                    <div />
                  </div>
                  {uploaded ? (
                    ITENS.map((item, i) => (
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
                        <div style={{ color: 'var(--color-text-title)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>{item.unidade}</div>
                        <div style={{ textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{item.quant}</div>
                        <div style={{ textAlign: 'right', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{item.unit}</div>
                        <div style={{ textAlign: 'right', color: 'var(--color-text-body)', fontVariantNumeric: 'tabular-nums' }}>{item.total}</div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-8)', justifyContent: 'flex-end' }}>
                          <button className="icon-btn" aria-label="Editar item">
                            <Pencil size={15} strokeWidth={1.66} />
                          </button>
                          <button className="icon-btn icon-btn--danger" aria-label="Excluir item">
                            <Trash2 size={15} strokeWidth={1.66} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '36px var(--spacing-16)', textAlign: 'center', fontSize: 14, color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-default)' }}>
                      Adicione um contrato para visualizar seus itens
                    </div>
                  )}
                  {/* Rodapé — border-top default, texto 12/600 #212121 (Cinza P do Figma) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 40, padding: '0 var(--spacing-16)', borderTop: '1px solid var(--color-border-default)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#212121' }}>
                      Total de itens: {uploaded ? '10' : '-'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: '#212121', fontVariantNumeric: 'tabular-nums' }}>
                      Valor total dos itens: {uploaded ? 'R$ 17.706,12' : 'R$ 0,00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Setores beneficiados */}
              <div style={sectionDivider}>
                <div style={{ ...sectionTitle, marginBottom: 'var(--spacing-4)' }}>Setor(es) beneficiado(s)</div>
                <p style={{ margin: '0 0 var(--spacing-12)', fontSize: 12, lineHeight: '16px', color: 'var(--color-text-secondary)' }}>
                  Informe os setores da empresa que serão atendidos por este contrato
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-16)' }}>
                  {setores.map((setor, i) => (
                    <button
                      key={setor.nome}
                      onClick={() => toggle(i)}
                      disabled={!uploaded}
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
                        cursor: uploaded ? 'pointer' : 'not-allowed',
                        fontSize: 14,
                        color: uploaded ? 'var(--color-text-body)' : 'var(--color-text-disabled)',
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          flex: 'none',
                          borderRadius: 'var(--radius-4)',
                          border: `1.5px solid ${!uploaded ? 'var(--color-icon-disabled)' : setor.checked ? 'var(--color-brand-default)' : 'var(--color-border-default)'}`,
                          background: setor.checked ? 'var(--color-brand-default)' : 'var(--color-bg-card)',
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
              </div>
            </div>
            )}
          </section>
        </main>
      </div>
    </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-16)' }}>
          {labeled('100%')}
          {labeled('100%')}
          {labeled('100%')}
        </div>
      </div>

      {/* Dados do contratado */}
      <div style={sectionDivider}>
        <div style={sectionTitle}>Dados do contratado</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-16)' }}>
          {labeled('100%')}
          {labeled('100%')}
          {labeled('100%')}
          {labeled('100%')}
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

      {/* Setor(es) beneficiado(s) */}
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
    </div>
  );
}

/* Campo editável — desabilitado antes do upload, liberado depois */
function Field({
  disabled,
  value,
  onChange,
  placeholder,
  icon,
}: {
  disabled: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        ...field,
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
