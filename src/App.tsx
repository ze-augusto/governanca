import { useRef, useState } from 'react';
import ListaContratos, { type Contrato } from './pages/ListaContratos';
import AdicionarContrato from './pages/AdicionarContrato';

type Page = 'lista' | 'adicionar' | 'visualizar';

export default function App() {
  const [page, setPage] = useState<Page>('lista');
  /* contrato selecionado na lista — alimenta a tela de visualização */
  const [contrato, setContrato] = useState<Contrato | null>(null);
  /* toast de sucesso — id incremental garante novo disparo a cada save */
  const [toast, setToast] = useState<{ id: number; nome: string } | null>(null);
  const toastId = useRef(0);

  if (page === 'adicionar') {
    return (
      <AdicionarContrato
        onBack={() => setPage('lista')}
        onSaved={(nome) => {
          toastId.current += 1;
          setToast({ id: toastId.current, nome });
          setPage('lista');
        }}
      />
    );
  }
  if (page === 'visualizar' && contrato) {
    return <AdicionarContrato onBack={() => setPage('lista')} contrato={contrato} />;
  }
  return (
    <ListaContratos
      onAdd={() => setPage('adicionar')}
      onView={(c) => { setContrato(c); setPage('visualizar'); }}
      toast={toast}
    />
  );
}
