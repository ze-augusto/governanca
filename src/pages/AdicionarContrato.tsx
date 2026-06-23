import { useState, type CSSProperties, type ReactNode } from 'react';
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

export default function AdicionarContrato({ onBack }: { onBack?: () => void }) {
  const [uploaded, setUploaded] = useState(false);
  const [setores, setSetores] = useState(SETORES_INICIAIS);

  const toggle = (i: number) =>
    setSetores((s) => s.map((x, j) => (j === i ? { ...x, checked: !x.checked } : x)));

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
              style={{
                height: 36,
                padding: '0 var(--spacing-16)',
                borderRadius: 'var(--radius-8)',
                border: '1px solid var(--color-brand-default)',
                background: 'var(--color-brand-default)',
                color: 'var(--color-text-inverse)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
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
            {/* Cabeçalho — Figma: altura 48, padding 16, nome do arquivo + paginação */}
            <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--spacing-16)', borderBottom: '1px solid var(--cinza-200)' }}>
              <span style={{ fontSize: 14, color: uploaded ? 'var(--color-text-body)' : 'var(--color-text-secondary)' }}>
                {uploaded ? 'contrato.pdf' : 'Sem arquivos adicionados'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 24, border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-8)', color: 'var(--color-text-body)' }}>
                  {uploaded ? '1' : '-'}
                </span>
                <span>{uploaded ? '/ 16' : '/ -'}</span>
              </div>
            </div>
            {/* Corpo — pré-upload: dropzone; pós-upload: página do documento */}
            {uploaded ? (
              <div style={{ padding: 'var(--spacing-16)', background: 'var(--cinza-300)' }}>
                <img
                  src={contratoPreview}
                  alt="Pré-visualização do contrato — página 1 de 16"
                  style={{ display: 'block', width: '100%', height: 'auto', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-8)' }}
                />
              </div>
            ) : (
              <div style={{ padding: 'var(--spacing-16)' }}>
                <button
                  onClick={() => setUploaded(true)}
                  style={{
                    width: '100%',
                    minHeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-8)',
                    padding: 'var(--spacing-24)',
                    border: '1.5px dashed var(--color-border-strong)',
                    borderRadius: 'var(--radius-8)',
                    background: 'var(--color-bg-card)',
                    cursor: 'pointer',
                  }}
                >
                  <UploadIcon />
                  <span style={{ fontSize: 14, color: 'var(--color-text-body)' }}>
                    <span style={{ color: 'var(--color-brand-default)', fontWeight: 600 }}>Clique aqui</span> ou arraste e solte o arquivo
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Arquivo em PDF e tamanho máximo de 50MB</span>
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

            {/* Corpo — padding 16 (Figma) */}
            <div style={{ padding: 'var(--spacing-16)' }}>
              {/* Dados gerais */}
              <div>
                <div style={sectionTitle}>Dados gerais</div>
                <div style={{ marginBottom: 'var(--spacing-16)' }}>
                  <label style={fieldLabel}>Objeto do contrato</label>
                  <FieldValue filled={uploaded} value={CONTRATO.objeto} placeholder={PLACEHOLDERS.objeto} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-16)' }}>
                  <div>
                    <label style={fieldLabel}>Valor do contrato</label>
                    <FieldValue filled={uploaded} value={CONTRATO.valor} placeholder={PLACEHOLDERS.valor} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Data de início do contrato</label>
                    <FieldValue filled={uploaded} value={CONTRATO.dataInicio} placeholder={PLACEHOLDERS.data} icon={<CalendarIcon />} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Data de fim de contrato</label>
                    <FieldValue filled={uploaded} value={CONTRATO.dataFim} placeholder={PLACEHOLDERS.data} icon={<CalendarIcon />} />
                  </div>
                </div>
              </div>

              {/* Dados do contratado — Figma: colunas 2:1 (nome largo / doc estreito) */}
              <div style={sectionDivider}>
                <div style={sectionTitle}>Dados do contratado</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-16)' }}>
                  <div>
                    <label style={fieldLabel}>Nome da empresa contratada</label>
                    <FieldValue filled={uploaded} value={CONTRATO.empresa} placeholder={PLACEHOLDERS.empresa} />
                  </div>
                  <div>
                    <label style={fieldLabel}>CNPJ</label>
                    <FieldValue filled={uploaded} value={CONTRATO.cnpj} placeholder={PLACEHOLDERS.cnpj} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Representante da empresa contratada</label>
                    <FieldValue filled={uploaded} value={CONTRATO.representante} placeholder={PLACEHOLDERS.representante} />
                  </div>
                  <div>
                    <label style={fieldLabel}>CPF</label>
                    <FieldValue filled={uploaded} value={CONTRATO.cpf} placeholder={PLACEHOLDERS.cpf} />
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-8)',
                        textAlign: 'left',
                        height: 44,
                        padding: '0 var(--spacing-16)',
                        borderRadius: 'var(--radius-8)',
                        border: `1px solid ${setor.checked ? 'var(--color-brand-default)' : 'var(--color-border-default)'}`,
                        background: setor.checked ? 'var(--color-brand-muted)' : 'var(--color-bg-card)',
                        cursor: 'pointer',
                        fontSize: 14,
                        color: 'var(--color-text-body)',
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          flex: 'none',
                          borderRadius: 'var(--radius-4)',
                          border: `1.5px solid ${setor.checked ? 'var(--color-brand-default)' : 'var(--color-border-default)'}`,
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
          </section>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponentes                                                              */
/* -------------------------------------------------------------------------- */

/* Valor de campo — mostra o valor (pós-upload) ou placeholder esmaecido */
function FieldValue({
  filled,
  value,
  placeholder,
  icon,
}: {
  filled: boolean;
  value: string;
  placeholder: string;
  icon?: ReactNode;
}) {
  return (
    <div style={{ ...field, gap: icon ? 'var(--spacing-8)' : 0 }}>
      {icon}
      <span
        style={{
          color: filled ? 'var(--color-text-body)' : 'var(--cinza-700)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {filled ? value : placeholder}
      </span>
    </div>
  );
}

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-default)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 'var(--spacing-8)' }}>
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
