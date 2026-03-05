/* ============================================================
   SOLUÇÃO DEFINITIVA PARA TAINTED CANVAS
   
   O problema: imagens carregadas via URL (mesmo locais) podem
   contaminar o canvas se o servidor não enviar CORS headers.
   
   A solução: converter TUDO para base64 via fetch() antes de
   qualquer coisa. fetch() + blob + FileReader nunca causa tainted.
   ============================================================ */

/* --- MAPA DOS CAMPOS --- */
const CAMPOS = [
  {input: 'nomeInput',               output: 'nome',               prefix: 'NOME COMPLETO: '},
  {input: 'nascimentoInput',         output: 'nascimento',         prefix: 'DATA DE NASCIMENTO: '},
  {input: 'naturalidadeInput',       output: 'naturalidade',       prefix: 'NATURAL DE: '},
  {input: 'rgInput',                 output: 'rg',                 prefix: 'RG / CPF: '},
  {input: 'localInput',              output: 'local',              prefix: 'ENDEREÇO DOS FATOS: '},
  {input: 'enderecoInput',           output: 'endereco',           prefix: 'ENDEREÇO DO PRESO: '},
  {input: 'distritoInput',           output: 'distrito',           prefix: 'DISTRITO: '},
  {input: 'equipeInput',             output: 'equipe',             prefix: 'EQUIPE: '},
  {input: 'bopmInput',               output: 'bopm',               prefix: 'BOPM Nº: '},
  {input: 'bopcInput',               output: 'bopc',               prefix: 'BOPC Nº: '},
  {input: 'codigodeocorrenciaInput', output: 'codigodeocorrencia', prefix: 'TIPO DE OCORRENCIA: '},
  {input: 'vulgoInput',              output: 'vulgo',              prefix: 'VULGO: '},
  {input: 'datafatoInput',           output: 'datafato',           prefix: 'DATA DO FATO: '},
  {input: 'flagranteInput',          output: 'flagrante',          prefix: 'FLAGRANTE / ABORDAGEM: '}
];

/* --- Detecta dispositivo UMA vez --- */
const DEVICE = (() => {
  const ua  = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const canShareFiles = !!(
    navigator.canShare &&
    navigator.share &&
    navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] })
  );
  return { isIOS, canShareFiles };
})();

/* ============================================================
   UTILITÁRIO: Converte URL para base64 usando fetch()
   fetch() baixa o arquivo como blob sem acionar restrições
   de tainted canvas, independente de CORS headers.
   ============================================================ */
async function urlParaBase64(url) {
  if (!url || url.startsWith('data:')) return url;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader  = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('FileReader falhou'));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Não foi possível converter imagem para base64:', url, err.message);
    return url;
  }
}

/* ============================================================
   CAMPOS: Atualização ao vivo
   ============================================================ */
function atualizarSaidaDoCampo({input, output, prefix}) {
  const elIn  = document.getElementById(input);
  const elOut = document.getElementById(output);
  if (!elIn || !elOut) return;
  const valor = (elIn.value || '').trim();
  elOut.textContent = prefix + (valor || '');
}

function ligarPreenchimentoAoVivo() {
  CAMPOS.forEach(cfg => {
    const elIn = document.getElementById(cfg.input);
    if (!elIn) return;
    atualizarSaidaDoCampo(cfg);
    elIn.addEventListener('input',  () => atualizarSaidaDoCampo(cfg));
    elIn.addEventListener('change', () => atualizarSaidaDoCampo(cfg));
    elIn.addEventListener('blur',   () => atualizarSaidaDoCampo(cfg));
  });
}

/* ============================================================
   FOTO: Preview imediato
   FileReader já gera base64 — nunca causa tainted canvas
   ============================================================ */
function ligarPreviewFoto() {
  const fotoInput = document.getElementById('fotoInput');
  const foto      = document.getElementById('foto');
  if (!fotoInput || !foto) return;

  fotoInput.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 10MB.');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      foto.src = ev.target.result;
      foto.alt = file.name || 'Foto selecionada';
      console.log('Foto carregada:', file.name);
    };
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   LOGO / BRASÃO
   Usa fetch() para converter para base64 — sem depender de CORS
   ============================================================ */
function ligarSelecaoLogo() {
  const brasaoImg = document.getElementById('brasao');
  const botoes    = document.querySelectorAll('.logos button');
  if (!brasaoImg || botoes.length === 0) return;

  const srcInicial = localStorage.getItem('logoSelecionada') || 'imagens/brasao-pmesp.png';
  urlParaBase64(srcInicial).then(base64 => {
    brasaoImg.src = base64;
    console.log('Brasão inicial carregado.');
  });

  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      const caminho = btn.dataset.logo;
      if (!caminho) return;

      urlParaBase64(caminho).then(base64 => {
        brasaoImg.src = base64;
        localStorage.setItem('logoSelecionada', caminho);
        console.log('Logo trocado para:', caminho);
      });
    });
  });
}

/* ============================================================
   DOWNLOAD / COMPARTILHAR
   ============================================================ */

/** Converte canvas em Blob com fallback para Safari antigo */
function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('toBlob retornou nulo')),
        'image/png', 1.0
      );
    } else {
      try {
        const dataURL = canvas.toDataURL('image/png');
        const arr     = dataURL.split(',');
        const mime    = arr[0].match(/:(.*?);/)[1];
        const bstr    = atob(arr[1]);
        let n         = bstr.length;
        const u8arr   = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        resolve(new Blob([u8arr], { type: mime }));
      } catch (err) {
        reject(err);
      }
    }
  });
}

/** Download tradicional — Android / Desktop */
function downloadBlob(blob, nomeArquivo) {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = nomeArquivo + '.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Compartilhar via Share API — iOS 15+ e Android modernos */
async function compartilharBlob(blob, nomeArquivo) {
  const file = new File([blob], nomeArquivo + '.png', { type: 'image/png' });
  await navigator.share({ files: [file], title: 'Ficha de Qualificação' });
}

/** Fallback iOS sem Share API: abre em nova aba para salvar manualmente */
function abrirImagemNoIOS(canvas) {
  const dataURL = canvas.toDataURL('image/png');
  const win = window.open('');
  if (win) {
    win.document.write(
      '<p style="font-family:sans-serif;text-align:center;padding:12px">' +
      'Pressione e segure a imagem para salvar.</p>' +
      '<img src="' + dataURL + '" style="max-width:100%;display:block;margin:auto"/>'
    );
    win.document.close();
  } else {
    const aviso = document.createElement('p');
    aviso.textContent = 'Pressione e segure a imagem abaixo para salvar.';
    aviso.style.cssText = 'text-align:center;font-family:sans-serif;padding:8px';
    const img = document.createElement('img');
    img.src = dataURL;
    img.style.cssText = 'max-width:100%;display:block;margin:auto';
    document.body.prepend(img);
    document.body.prepend(aviso);
  }
}

/** Função principal */
async function baixarFicha() {
  const ficha     = document.getElementById('ficha');
  const loading   = document.getElementById('loading');
  const btnBaixar = document.getElementById('btnBaixar');
  const nomeArq   = getNomeArquivo();

  loading.style.display = 'block';
  btnBaixar.disabled    = true;
  btnBaixar.textContent = 'Gerando...';

  try {
    // Garante que TODAS as imagens da ficha estejam em base64
    // antes de passar para o html2canvas
    const todasImagens = ficha.querySelectorAll('img');
    await Promise.all([...todasImagens].map(async (img) => {
      if (!img.src || img.src === window.location.href) return;
      if (img.src.startsWith('data:')) return;
      img.src = await urlParaBase64(img.src);
    }));

    const canvas = await html2canvas(ficha, {
      useCORS:         true,
      allowTaint:      false,
      backgroundColor: '#ffffff',
      scale:           3,
      logging:         false,
      imageTimeout:    15000
    });

    console.log('Canvas gerado:', canvas.width + 'x' + canvas.height);

    const blob = await canvasToBlob(canvas);

    if (DEVICE.canShareFiles) {
      await compartilharBlob(blob, nomeArq);
    } else if (DEVICE.isIOS) {
      abrirImagemNoIOS(canvas);
    } else {
      downloadBlob(blob, nomeArq);
      console.log('Download iniciado!');
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Compartilhamento cancelado pelo usuário.');
    } else {
      console.error('Erro ao gerar ficha:', err);
      alert('Erro ao gerar a ficha: ' + err.message);
    }
  } finally {
    loading.style.display = 'none';
    btnBaixar.disabled    = false;
    btnBaixar.textContent = DEVICE.canShareFiles ? 'Compartilhar Ficha' : 'Baixar Ficha';
  }
}

/* ============================================================
   NOME DO ARQUIVO
   ============================================================ */
function getNomeArquivo() {
  const nome  = document.getElementById('nomeInput')?.value.trim();
  const data  = new Date();
  const stamp = String(data.getDate()).padStart(2, '0') +
                String(data.getMonth() + 1).padStart(2, '0') +
                data.getFullYear();
  return nome
    ? 'ficha_' + nome.replace(/\s+/g, '_').toLowerCase() + '_' + stamp
    : 'ficha_qualificacao_' + stamp;
}

/* ============================================================
   LIMPAR FORMULÁRIO
   ============================================================ */
function limparFormulario() {
  if (!confirm('Tem certeza que deseja limpar todos os campos?')) return;

  document.querySelectorAll('input[type="text"]').forEach(i => i.value = '');

  const fotoInput = document.getElementById('fotoInput');
  const foto      = document.getElementById('foto');
  if (fotoInput) fotoInput.value = '';
  if (foto)      foto.src = '';

  CAMPOS.forEach(({output, prefix}) => {
    const elOut = document.getElementById(output);
    if (elOut) elOut.textContent = prefix;
  });

  urlParaBase64('imagens/brasao-pmesp.png').then(base64 => {
    const brasao = document.getElementById('brasao');
    if (brasao) brasao.src = base64;
  });
  localStorage.removeItem('logoSelecionada');

  console.log('Formulário limpo!');
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const btnBaixar = document.getElementById('btnBaixar');
  if (btnBaixar) {
    btnBaixar.textContent = DEVICE.canShareFiles ? 'Compartilhar Ficha' : 'Baixar Ficha';
    console.log('Dispositivo:', DEVICE.isIOS ? 'iOS' : 'Outro', '| Share API:', DEVICE.canShareFiles);
  }

  ligarPreviewFoto();
  ligarPreenchimentoAoVivo();
  ligarSelecaoLogo();
});