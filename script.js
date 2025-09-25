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

  document.getElementById('nome').textContent = 'Nome: ' + document.getElementById('nomeInput').value;
  document.getElementById('rg').textContent = 'RG: ' + document.getElementById('rgInput').value;
  document.getElementById('endereco').textContent = 'Endereço do preso: ' + document.getElementById('enderecoInput').value;
  document.getElementById('ocorrencia').textContent = 'Tipo de Ocorrência: ' + document.getElementById('ocorrenciaInput').value;
  document.getElementById('data').textContent = 'Data: ' + document.getElementById('dataInput').value;
  document.getElementById('localOcorrencia').textContent = 'Endereço da Ocorrência: ' + document.getElementById('localOcorrenciaInput').value;
  document.getElementById('distrito').textContent = 'Distrito Policial: ' + document.getElementById('distritoInput').value;
  document.getElementById('equipe').textContent = 'Equipe: ' + document.getElementById('equipeInput').value;
  document.getElementById('bopm').textContent = 'BOPM: ' + document.getElementById('bopmInput').value;
  document.getElementById('bopc').textContent = 'BOPC: ' + document.getElementById('bopcInput').value;
  document.getElementById('abordagem').textContent = 'Abordagem ou Flagrante: ' + document.getElementById('abordagemInput').value;
}

function baixarFicha() {
  const ficha = document.getElementById('ficha');
  html2canvas(ficha).then(canvas => {
    const link = document.createElement('a');
    link.download = 'ficha-policial.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}
