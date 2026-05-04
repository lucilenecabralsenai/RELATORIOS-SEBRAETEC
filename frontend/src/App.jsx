import { useMemo, useState } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';

const TEMPLATE_FILE = '/RELATÓRIO - JM CONFECÇÕES.docx';

const emptyEtapa = { periodo: '', ch: '', acao: '', estrategias: '' };
const emptyFoto = { legenda: '', arquivo: null, preview: '' };

const initialForm = {
  projetoNome: '',
  projetoNumero: '',
  razaoSocial: '',
  contatoEmpresa: '',
  entidadeExecutora: 'SENAI – CET Aluísio Bezerra',
  consultorResponsavel: '',
  objetivoPlanoAcao: '',
  diagnostico: '',
  relatorioFinal: '',
  termoEncerramento: '',
  localData: '',
  assinaturaConsultor: '',
  assinaturaEmpresa: '',
  assinaturaResponsavelSebrae: '',
  etapas: [emptyEtapa],
  fotos: [emptyFoto],
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  const fotosValidas = useMemo(
    () => form.fotos.filter((f) => f.arquivo && f.preview).map((f) => ({ legenda: f.legenda, imagem: f.preview })),
    [form.fotos],
  );

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const updateListItem = (listKey, index, field, value) => {
    const list = [...form[listKey]];
    list[index] = { ...list[index], [field]: value };
    update(listKey, list);
  };

  const addRow = (listKey, empty) => update(listKey, [...form[listKey], { ...empty }]);

  const handleFile = async (index, file) => {
    const preview = file ? await toDataUrl(file) : '';
    const list = [...form.fotos];
    list[index] = { ...list[index], arquivo: file, preview };
    update('fotos', list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(TEMPLATE_FILE);
      if (!response.ok) throw new Error('Não foi possível carregar o modelo DOCX em /public.');

      const template = await response.arrayBuffer();
      const zip = new PizZip(template);

      const imageModule = new ImageModule({
        centered: false,
        getImage: (tagValue) => dataUrlToBinaryString(tagValue),
        getSize: () => [480, 270],
      });

      const doc = new Docxtemplater(zip, {
        modules: [imageModule],
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        ...form,
        data_geracao: new Date().toLocaleDateString('pt-BR'),
        etapas: form.etapas,
        fotos: fotosValidas,
      });

      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(output);
      link.download = `RELATORIO-${(form.projetoNome || 'SEBRAETEC').replace(/\s+/g, '-').toUpperCase()}.docx`;
      link.click();
      URL.revokeObjectURL(link.href);
      setMessage('Relatório gerado com sucesso.');
    } catch (error) {
      setMessage(`Erro ao gerar DOCX: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Gerador de Relatórios SEBRAETEC (.docx)</h1>
      <p>Processamento 100% no navegador. Compatível com GitHub Pages.</p>
      <form onSubmit={handleSubmit}>
        <section>
          <h2>Dados do projeto e empresa</h2>
          {renderInput('Nome do projeto', form.projetoNome, (v) => update('projetoNome', v), true)}
          {renderInput('Número do projeto', form.projetoNumero, (v) => update('projetoNumero', v), true)}
          {renderInput('Razão social da empresa', form.razaoSocial, (v) => update('razaoSocial', v), true)}
          {renderInput('Contato na empresa', form.contatoEmpresa, (v) => update('contatoEmpresa', v), true)}
          {renderInput('Entidade executora', form.entidadeExecutora, (v) => update('entidadeExecutora', v), true)}
          {renderInput('Consultor responsável', form.consultorResponsavel, (v) => update('consultorResponsavel', v), true)}
        </section>

        <section>
          <h2>Plano de ação / etapas</h2>
          {renderTextarea('Objetivo', form.objetivoPlanoAcao, (v) => update('objetivoPlanoAcao', v), true)}
          {form.etapas.map((etapa, i) => (
            <div key={i} className="row">
              <input placeholder="Período" value={etapa.periodo} onChange={(e) => updateListItem('etapas', i, 'periodo', e.target.value)} required />
              <input placeholder="CH" value={etapa.ch} onChange={(e) => updateListItem('etapas', i, 'ch', e.target.value)} required />
              <input placeholder="Ação a ser realizada" value={etapa.acao} onChange={(e) => updateListItem('etapas', i, 'acao', e.target.value)} required />
              <input placeholder="Estratégias" value={etapa.estrategias} onChange={(e) => updateListItem('etapas', i, 'estrategias', e.target.value)} required />
            </div>
          ))}
          <button type="button" onClick={() => addRow('etapas', emptyEtapa)}>+ Adicionar etapa</button>
        </section>

        <section>
          <h2>Diagnóstico, relatório final e encerramento</h2>
          {renderTextarea('Diagnóstico', form.diagnostico, (v) => update('diagnostico', v), true)}
          {renderTextarea('Relatório final', form.relatorioFinal, (v) => update('relatorioFinal', v), true)}
          {renderTextarea('Termo de encerramento', form.termoEncerramento, (v) => update('termoEncerramento', v), true)}
          {renderInput('Local e data', form.localData, (v) => update('localData', v), true)}
        </section>

        <section>
          <h2>Assinaturas</h2>
          {renderInput('Consultor(a)', form.assinaturaConsultor, (v) => update('assinaturaConsultor', v), true)}
          {renderInput('Empresa demandante', form.assinaturaEmpresa, (v) => update('assinaturaEmpresa', v), true)}
          {renderInput('Responsável SEBRAETEC', form.assinaturaResponsavelSebrae, (v) => update('assinaturaResponsavelSebrae', v), true)}
        </section>

        <section>
          <h2>Fotos e legendas</h2>
          {form.fotos.map((foto, i) => (
            <div key={i} className="row">
              <input placeholder="Legenda da foto" value={foto.legenda} onChange={(e) => updateListItem('fotos', i, 'legenda', e.target.value)} />
              <input type="file" accept="image/*" onChange={(e) => handleFile(i, e.target.files?.[0] ?? null)} />
            </div>
          ))}
          <button type="button" onClick={() => addRow('fotos', emptyFoto)}>+ Adicionar foto</button>
        </section>

        <button type="submit" disabled={loading}>{loading ? 'Gerando...' : 'Gerar relatório .docx'}</button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
}

function renderInput(label, value, onChange, required = false) {
  return <input placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} required={required} />;
}

function renderTextarea(label, value, onChange, required = false) {
  return <textarea rows={4} placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} required={required} />;
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function dataUrlToBinaryString(dataUrl) {
  const base64 = dataUrl.split(',')[1] ?? '';
  return atob(base64);
}
