function gerarFicha() {
  const fotoInput = document.getElementById('fotoInput');
  const foto = document.getElementById('foto');
  const reader = new FileReader();

  reader.onload = function(e) {
    foto.src = e.target.result;
  };

  if (fotoInput.files[0]) {
    reader.readAsDataURL(fotoInput.files[0]);
  }

  document.getElementById('nome').textContent = 'NOME COMPLETO: ' + document.getElementById('nomeInput').value;
  document.getElementById('mae').textContent = 'NOME DA MÃE: ' + document.getElementById('maeInput').value;
  document.getElementById('pai').textContent = 'NOME DO PAI: ' + document.getElementById('paiInput').value;
  document.getElementById('nascimento').textContent = 'DATA DE NASCIMENTO: ' + document.getElementById('nascimentoInput').value;
  document.getElementById('rg').textContent = 'RG: ' + document.getElementById('rgInput').value;
  document.getElementById('cpf').textContent = 'CPF: ' + document.getElementById('cpfInput').value;
  document.getElementById('naturalidade').textContent = 'NATURALIDADE: ' + document.getElementById('naturalidadeInput').value;
  document.getElementById('nacionalidade').textContent = 'NACIONALIDADE: ' + document.getElementById('nacionalidadeInput').value;
  document.getElementById('endereco').textContent = 'ENDEREÇO: ' + document.getElementById('enderecoInput').value;
  document.getElementById('bairro').textContent = 'BAIRRO: ' + document.getElementById('bairroInput').value;
  document.getElementById('cidade').textContent = 'CIDADE: ' + document.getElementById('cidadeInput').value;
  document.getElementById('estado').textContent = 'ESTADO: ' + document.getElementById('estadoInput').value;
}

function baixarFicha() {
  const ficha = document.getElementById('ficha');
  const botoes = document.querySelectorAll('button');

  botoes.forEach(btn => btn.style.display = 'none');

  html2canvas(ficha).then(canvas => {
    const link = document.createElement('a');
    link.download = 'ficha-qualificacao.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    botoes.forEach(btn => btn.style.display = 'inline-block');
  });
}
