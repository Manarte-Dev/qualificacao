// 📸 Gerar ficha com imagem e dados
function gerarFicha() {
  const fotoInput = document.getElementById('fotoInput');
  const foto = document.getElementById('foto');

  if (fotoInput.files && fotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      foto.src = e.target.result;
    };
    reader.readAsDataURL(fotoInput.files[0]);
  }

  const campos = [
    {input: 'nomeInput', output: 'nome', prefix: 'NOME COMPLETO: '},
    {input: 'nascimentoInput', output: 'nascimento', prefix: 'DATA DE NASCIMENTO: '},
    {input: 'naturalidadeInput', output: 'naturalidade', prefix: 'NATURAL DE: '},
    {input: 'rgInput', output: 'rg', prefix: 'RG: '},
    {input: 'localInput', output: 'local', prefix: 'ENDEREÇO DOS FATOS: '},
    {input: 'enderecoInput', output: 'endereco', prefix: 'ENDEREÇO DO PRESO: '},
    {input: 'distritoInput', output: 'distrito', prefix: 'DISTRITO: '},
    {input: 'equipeInput', output: 'equipe', prefix: 'EQUIPE: '},
    {input: 'bopmInput', output: 'bopm', prefix: 'BOPM Nº: '},
    {input: 'bopcInput', output: 'bopc', prefix: 'BOPC Nº: '},
    {input: 'flagranteInput', output: 'flagrante', prefix: 'FLAGRANTE / ABORDAGEM: '}
  ];

  campos.forEach(campo => {
    const valor = document.getElementById(campo.input).value.trim();
    document.getElementById(campo.output).textContent = campo.prefix + (valor || '');
  });

  alert('Ficha gerada! Você pode fazer o download quando quiser.');
}

// 📥 Baixar ficha como imagem
function baixarFicha() {
  const ficha = document.getElementById('ficha');
  const loading = document.getElementById('loading');
  const btnBaixar = document.getElementById('btnBaixar');

  loading.style.display = 'block';
  btnBaixar.disabled = true;
  btnBaixar.textContent = 'Gerando...';

  setTimeout(() => {
    const opcoes = {
      useCORS: true,
      allowTaint: true,
      scale: 1.5,
      logging: false,
      backgroundColor: '#ffffff'
    };

    html2canvas(ficha, opcoes)
      .then(function(canvas) {
        if (canvas.toBlob) {
          canvas.toBlob(function(blob) {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = getNomeArquivo() + '.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            } else {
              fallbackDownload(canvas);
            }
          }, 'image/png');
        } else {
          fallbackDownload(canvas);
        }
      })
      .catch(function(error) {
        console.error('Erro ao gerar imagem:', error);
        alert('Erro ao gerar a imagem: ' + error.message);
      })
      .finally(function() {
        loading.style.display = 'none';
        btnBaixar.disabled = false;
        btnBaixar.textContent = 'Baixar Ficha';
      });
  }, 300);
}

// 🧯 Fallback para download
function fallbackDownload(canvas) {
  try {
    const link = document.createElement('a');
    link.download = getNomeArquivo() + '.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro no fallback:', error);
    alert('Erro ao fazer download. Seu navegador pode não suportar esta funcionalidade.');
  }
}

// 🗂️ Gerar nome do arquivo
function getNomeArquivo() {
  const nome = document.getElementById('nomeInput').value.trim();
  const data = new Date();
  const timestamp = data.getDate().toString().padStart(2, '0') +
                    (data.getMonth() + 1).toString().padStart(2, '0') +
                    data.getFullYear();
  if (nome) {
    return 'ficha_' + nome.replace(/\s+/g, '_').toLowerCase() + '_' + timestamp;
  }
  return 'ficha_qualificacao_' + timestamp;
}

// 🧹 Limpar formulário e ficha
function limparFormulario() {
  if (confirm('Tem certeza que deseja limpar todos os campos?')) {
    document.querySelectorAll('input[type="text"]').forEach(input => {
      input.value = '';
    });
    document.getElementById('fotoInput').value = '';
    document.getElementById('foto').src = '';
    document.querySelectorAll('.campo').forEach(campo => {
      const prefix = campo.textContent.split(':')[0] + ': ';
      campo.textContent = prefix;
    });
    alert('Formulário limpo!');
  }
}

// ⌨️ Atalho com Enter
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    gerarFicha();
  }
});

// 🧪 Validação de imagem
document.getElementById('fotoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.');
      this.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      this.value = '';
      return;
    }
  }
});
