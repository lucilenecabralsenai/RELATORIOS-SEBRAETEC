import { useState } from 'react';

const emptyEtapa = { titulo: '', descricao: '', data: '' };
const emptyAcao = { acao: '', responsavel: '', prazo: '', status: '' };
const emptyFoto = { legenda: '', arquivo: null };

export default function App() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    projeto: '', empresa: '', consultor: '', periodoInicio: '', periodoFim: '',
    textoIntroducao: '', textoConclusao: '', assinaturaConsultor: '', assinaturaEmpresa: '',
    etapas: [emptyEtapa], planoAcao: [emptyAcao], fotos: [emptyFoto],
  });

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const updateListItem = (listKey, index, field, value) => {
    const list = [...form[listKey]];
    list[index] = { ...list[index], [field]: value };
    update(listKey, list);
  };

  const addRow = (listKey, empty) => update(listKey, [...form[listKey], empty]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const body = {
      ...form,
      fotos: await Promise.all(form.fotos.filter((f) => f.arquivo).map(async (f) => ({
        legenda: f.legenda,
        nome: f.arquivo.name,
        tipo: f.arquivo.type,
        base64: await toBase64(f.arquivo),
      }))),
    };

    const response = await fetch('http://localhost:3001/api/gerar-relatorio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      alert('Erro ao gerar relatório');
      setLoading(false);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-gerado.docx';
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  return (
    <main className="container">
      <h1>Gerador de Relatórios Word</h1>
      <form onSubmit={handleSubmit}>
        <section>
          <h2>Dados gerais</h2>
          <input placeholder="Projeto" value={form.projeto} onChange={(e) => update('projeto', e.target.value)} required />
          <input placeholder="Empresa" value={form.empresa} onChange={(e) => update('empresa', e.target.value)} required />
          <input placeholder="Consultor" value={form.consultor} onChange={(e) => update('consultor', e.target.value)} required />
          <label>Início<input type="date" value={form.periodoInicio} onChange={(e) => update('periodoInicio', e.target.value)} /></label>
          <label>Fim<input type="date" value={form.periodoFim} onChange={(e) => update('periodoFim', e.target.value)} /></label>
          <textarea placeholder="Introdução" value={form.textoIntroducao} onChange={(e) => update('textoIntroducao', e.target.value)} />
          <textarea placeholder="Conclusão" value={form.textoConclusao} onChange={(e) => update('textoConclusao', e.target.value)} />
        </section>

        <section>
          <h2>Etapas</h2>
          {form.etapas.map((etapa, i) => (
            <div key={i} className="row">
              <input placeholder="Título" value={etapa.titulo} onChange={(e) => updateListItem('etapas', i, 'titulo', e.target.value)} />
              <input placeholder="Descrição" value={etapa.descricao} onChange={(e) => updateListItem('etapas', i, 'descricao', e.target.value)} />
              <input type="date" value={etapa.data} onChange={(e) => updateListItem('etapas', i, 'data', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={() => addRow('etapas', emptyEtapa)}>+ Etapa</button>
        </section>

        <section>
          <h2>Plano de ação</h2>
          {form.planoAcao.map((acao, i) => (
            <div key={i} className="row">
              <input placeholder="Ação" value={acao.acao} onChange={(e) => updateListItem('planoAcao', i, 'acao', e.target.value)} />
              <input placeholder="Responsável" value={acao.responsavel} onChange={(e) => updateListItem('planoAcao', i, 'responsavel', e.target.value)} />
              <input type="date" value={acao.prazo} onChange={(e) => updateListItem('planoAcao', i, 'prazo', e.target.value)} />
              <input placeholder="Status" value={acao.status} onChange={(e) => updateListItem('planoAcao', i, 'status', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={() => addRow('planoAcao', emptyAcao)}>+ Ação</button>
        </section>

        <section>
          <h2>Assinaturas</h2>
          <input placeholder="Assinatura consultor" value={form.assinaturaConsultor} onChange={(e) => update('assinaturaConsultor', e.target.value)} />
          <input placeholder="Assinatura empresa" value={form.assinaturaEmpresa} onChange={(e) => update('assinaturaEmpresa', e.target.value)} />
        </section>

        <section>
          <h2>Registro fotográfico</h2>
          {form.fotos.map((foto, i) => (
            <div key={i} className="row">
              <input placeholder="Legenda" value={foto.legenda} onChange={(e) => updateListItem('fotos', i, 'legenda', e.target.value)} />
              <input type="file" accept="image/*" onChange={(e) => updateListItem('fotos', i, 'arquivo', e.target.files?.[0] ?? null)} />
            </div>
          ))}
          <button type="button" onClick={() => addRow('fotos', emptyFoto)}>+ Foto</button>
        </section>

        <button type="submit" disabled={loading}>{loading ? 'Gerando...' : 'Gerar .docx'}</button>
      </form>
    </main>
  );
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
