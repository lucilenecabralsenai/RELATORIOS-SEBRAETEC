import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';

const app = express();
app.use(cors());
app.use(express.json({ limit: '30mb' }));

const TEMPLATE_PATH = path.resolve(process.cwd(), 'RELATÓRIO - JM CONFECÇÕES.docx');

app.post('/api/gerar-relatorio', (req, res) => {
  try {
    if (!fs.existsSync(TEMPLATE_PATH)) {
      return res.status(404).json({ error: 'Modelo RELATÓRIO - JM CONFECÇÕES.docx não encontrado na raiz do projeto.' });
    }

    const content = fs.readFileSync(TEMPLATE_PATH, 'binary');
    const zip = new PizZip(content);

    const imageOptions = {
      centered: false,
      getImage: (tagValue) => Buffer.from(tagValue.base64, 'base64'),
      getSize: () => [480, 270],
    };

    const doc = new Docxtemplater(zip, {
      modules: [new ImageModule(imageOptions)],
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      ...req.body,
      data_geracao: new Date().toLocaleDateString('pt-BR'),
    });

    const output = doc.getZip().generate({ type: 'nodebuffer' });
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio-gerado.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    return res.send(output);
  } catch (error) {
    return res.status(500).json({ error: 'Falha ao gerar DOCX', detail: error.message });
  }
});

app.listen(3001, () => {
  console.log('API em http://localhost:3001');
});
