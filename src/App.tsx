import { useState } from 'react';
import ListaContratos from './pages/ListaContratos';
import AdicionarContrato from './pages/AdicionarContrato';

type Page = 'lista' | 'adicionar';

export default function App() {
  const [page, setPage] = useState<Page>('lista');

  if (page === 'adicionar') {
    return <AdicionarContrato onBack={() => setPage('lista')} />;
  }
  return <ListaContratos onAdd={() => setPage('adicionar')} />;
}
