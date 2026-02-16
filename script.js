/* --- MAPA DOS CAMPOS  --- */
const CAMPOS = [
  {input: 'nomeInput',           output: 'nome',           prefix: 'NOME COMPLETO: '},
  {input: 'nascimentoInput',     output: 'nascimento',     prefix: 'DATA DE NASCIMENTO: '},
  {input: 'naturalidadeInput',   output: 'naturalidade',   prefix: 'NATURAL DE: '},
  {input: 'rgInput',             output: 'rg',             prefix: 'RG / CPF: '},
  {input: 'localInput',          output: 'local',          prefix: 'ENDEREÇO DOS FATOS: '},
  {input: 'enderecoInput',       output: 'endereco',       prefix: 'ENDEREÇO DO PRESO: '},
  {input: 'distritoInput',       output: 'distrito',       prefix: 'DISTRITO: '},
  {input: 'equipeInput',         output: 'equipe',         prefix: 'EQUIPE: '},
  {input: 'bopmInput',           output: 'bopm',           prefix: 'BOPM Nº: '},
  {input: 'bopcInput',           output: 'bopc',           prefix: 'BOPC Nº: '},
  {input: 'codigodeocorrenciaInput', output: 'codigodeocorrencia', prefix: 'TIPO DE OCORRENCIA: '},
  {input: 'vulgoInput',          output: 'vulgo',          prefix: 'VULGO: '},
  {input: 'flagranteInput',      output: 'flagrante',      prefix: 'FLAGRANTE / ABORDAGEM: '}
];

/** --- Atualiza UM campo de saída com base no input --- */
function atualizarSaidaDoCampo({input, output, prefix}) {
  const elIn = document.getElementById(input);
  const elOut = document.getElementById(output);
  if (!elIn || !elOut) return;
  const valor = (elIn.value || '').trim();
  elOut.textContent = prefix + (valor || '');
}

/** --- Enquanto digita, já aparece na ficha --- */
function ligarPreenchimentoAoVivo() {
  CAMPOS.forEach(cfg => {
    const elIn = document.getElementById(cfg.input);
    if (!elIn) return;

    // Estado inicial (útil ao recarregar a página com dados)
    atualizarSaidaDoCampo(cfg);

    // Reagir a digitação/alteração/saída de foco
    elIn.addEventListener('input', () => atualizarSaidaDoCampo(cfg));
    elIn.addEventListener('change', () => atualizarSaidaDoCampo(cfg));
    elIn.addEventListener('blur', () => atualizarSaidaDoCampo(cfg));
  });
}


/** --- Foto: pré-visualização imediata ao escolher arquivo --- */
function ligarPreviewFoto() {
  const fotoInput = document.getElementById('fotoInput');
  const foto = document.getElementById('foto');
  if (!fotoInput || !foto) return;

  fotoInput.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
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

    // Preview imediato
    const reader = new FileReader();
    reader.onload = ev => {
      foto.src = ev.target.result;
      foto.alt = file.name || 'Foto selecionada';
      console.log('Pré-visualização carregada:', file.name);
    };
    reader.readAsDataURL(file);
  });
}

/** --- Baixar/Compartilhar a ficha (sem alterações funcionais) --- */
function baixarFicha() {
  const ficha = document.getElementById('ficha');
  const loading = document.getElementById('loading');
  const btnBaixar = document.getElementById('btnBaixar');

  console.log('Iniciando download...');
  loading.style.display = 'block';
  btnBaixar.disabled = true;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  btnBaixar.textContent = isIOS ? 'Gerando...' : 'Gerando...';

  setTimeout(() => {
    const opcoes = { useCORS: true, backgroundColor: '#ffffff', scale: 3 };
    console.log('Configurações html2canvas:', opcoes);

    html2canvas(ficha, opcoes)
      .then(canvas => {
        console.log('Canvas gerado:', canvas.width + 'x' + canvas.height);
        canvas.toBlob(blob => {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

          if (isIOS && navigator.share) {
            console.log('Usando Share API para iOS');
            const file = new File([blob], getNomeArquivo() + '.png', { type: 'image/png' });
            navigator.share({
              files: [file],
              title: 'Ficha de Qualificação',
              text: 'Ficha gerada pelo sistema'
            }).then(() => {
              console.log('Compartilhado com sucesso no iOS!');
            }).catch(err => {
              if (err.name !== 'AbortError') {
                console.error('Erro ao compartilhar:', err);
                alert('Erro ao compartilhar: ' + err.message);
              } else {
                console.log('Compartilhamento cancelado pelo usuário');
              }
            });
          } else {
            console.log('Usando download tradicional');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = getNomeArquivo() + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('Download iniciado com sucesso!');
          }
        }, 'image/png', 1.0);
      })
      .catch(error => {
        console.error('Erro html2canvas:', error);
        alert('Erro ao capturar imagem: ' + error.message);
      })
      .finally(() => {
        loading.style.display = 'none';
        btnBaixar.disabled = false;
        const isIOS2 = /iPad|iPhone|iPod/.test(navigator.userAgent);
        btnBaixar.textContent = isIOS2 && navigator.share ? 'Compartilhar Ficha' : 'Baixar Ficha';
      });
  }, 500);
}

/** --- Nome do arquivo --- */
function getNomeArquivo() {
  const nome = document.getElementById('nomeInput')?.value.trim();
  const data = new Date();
  const timestamp = String(data.getDate()).padStart(2, '0') +
                    String(data.getMonth() + 1).padStart(2, '0') +
                    data.getFullYear();
  return nome
    ? 'ficha_' + nome.replace(/\s+/g, '_').toLowerCase() + '_' + timestamp
    : 'ficha_qualificacao_' + timestamp;
}

/** --- Limpar tudo --- */
function limparFormulario() {
  if (!confirm('Tem certeza que deseja limpar todos os campos?')) return;

  document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
  const fotoInput = document.getElementById('fotoInput');
  const foto = document.getElementById('foto');
  if (fotoInput) fotoInput.value = '';
  if (foto) foto.src = '';

  // restaura cada saída para apenas o prefixo
  CAMPOS.forEach(({output, prefix}) => {
    const elOut = document.getElementById(output);
    if (elOut) elOut.textContent = prefix;
  });

  console.log('Formulário limpo!');
}

/** --- Inicialização --- */
document.addEventListener('DOMContentLoaded', () => {
  // Ajusta texto do botão conforme dispositivo
  const btnBaixar = document.getElementById('btnBaixar');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (btnBaixar && isIOS && navigator.share) {
    btnBaixar.textContent = 'Compartilhar';
    console.log('Dispositivo iOS detectado - usando Share API');
  }

  // Liga validação + preview imediato da foto
  ligarPreviewFoto();

  // Liga preenchimento "ao vivo" dos campos
  ligarPreenchimentoAoVivo();
});
