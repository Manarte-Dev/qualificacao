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
    
    {input: 'codigodeocorrenciaInput', output: 'codigodeocorrencia', prefix: 'TIPO DE OCORRENCIA: '},

    {input: 'vulgoInput', output: 'vulgo', prefix: 'VULGO: '},

    {input: 'flagranteInput', output: 'flagrante', prefix: 'FLAGRANTE / ABORDAGEM: '}
  ];

  campos.forEach(campo => {
    const valor = document.getElementById(campo.input).value.trim();
    document.getElementById(campo.output).textContent = campo.prefix + (valor || '');
  });

  console.log('Ficha gerada com sucesso!');
}

function baixarFicha() {
  const ficha = document.getElementById('ficha');
  const loading = document.getElementById('loading');
  const btnBaixar = document.getElementById('btnBaixar');

  console.log('Iniciando download...');
  
  loading.style.display = 'block';
  btnBaixar.disabled = true;
  
  // Detectar iOS para texto do botão
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  btnBaixar.textContent = isIOS ? 'Gerando...' : 'Gerando...';

  setTimeout(() => {
    const opcoes = {
      useCORS: true,
      backgroundColor: '#ffffff',
      scale: 3,
    };

    console.log('Configurações html2canvas:', opcoes);

    html2canvas(ficha, opcoes)
      .then(canvas => {
        console.log('Canvas gerado:', canvas.width + 'x' + canvas.height);
        
        // Converter canvas para blob
        canvas.toBlob(blob => {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          
          // SOLUÇÃO PARA iOS - Share API
          if (isIOS && navigator.share) {
            console.log('Usando Share API para iOS');
            const file = new File([blob], getNomeArquivo() + '.png', { 
              type: 'image/png' 
            });
            
            navigator.share({
              files: [file],
              title: 'Ficha de Qualificação',
              text: 'Ficha gerada pelo sistema'
            })
            .then(() => {
              console.log('Compartilhado com sucesso no iOS!');
            })
            .catch(err => {
              // Usuário cancelou ou erro
              if (err.name !== 'AbortError') {
                console.error('Erro ao compartilhar:', err);
                alert('Erro ao compartilhar: ' + err.message);
              } else {
                console.log('Compartilhamento cancelado pelo usuário');
              }
            });
          } 
          // MANTÉM O COMPORTAMENTO ORIGINAL PARA OUTROS DISPOSITIVOS
          else {
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
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        btnBaixar.textContent = isIOS && navigator.share ? 'Compartilhar Ficha' : 'Baixar Ficha';
      });
  }, 500);
}

function getNomeArquivo() {
  const nome = document.getElementById('nomeInput').value.trim();
  const data = new Date();
  const timestamp = data.getDate().toString().padStart(2, '0') +
                    (data.getMonth() + 1).toString().padStart(2, '0') +
                    data.getFullYear();
  return nome 
    ? 'ficha_' + nome.replace(/\s+/g, '_').toLowerCase() + '_' + timestamp
    : 'ficha_qualificacao_' + timestamp;
}

function limparFormulario() {
  if (confirm('Tem certeza que deseja limpar todos os campos?')) {
    document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    document.getElementById('fotoInput').value = '';
    document.getElementById('foto').src = '';
    document.querySelectorAll('.campo').forEach(campo => {
      const prefix = campo.textContent.split(':')[0] + ': ';
      campo.textContent = prefix;
    });
    console.log('Formulário limpo!');
  }
}

document.addEventListener('keypress', e => {
  if (e.key === 'Enter' && !e.shiftKey) gerarFicha();
});

document.addEventListener('DOMContentLoaded', () => {
  // Ajustar texto do botão conforme dispositivo
  const btnBaixar = document.getElementById('btnBaixar');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (btnBaixar && isIOS && navigator.share) {
    btnBaixar.textContent = 'Compartilhar Ficha';
    console.log('Dispositivo iOS detectado - usando Share API');
  }

  // Validação de foto
  const fotoInput = document.getElementById('fotoInput');
  if (fotoInput) {
    fotoInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Arquivo muito grande. Máximo 5MB.');
          e.target.value = '';
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione apenas arquivos de imagem.');
          e.target.value = '';
          return;
        }
        console.log('Arquivo válido selecionado:', file.name);
      }
    });
  }
});