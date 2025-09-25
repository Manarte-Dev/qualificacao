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

  document.getElementById('nome').textContent = document.getElementById('nomeInput').value;
  document.getElementById('rg').textContent = document.getElementById('rgInput').value;
  document.getElementById('endereco').textContent = document.getElementById('enderecoInput').value;
  document.getElementById('ocorrencia').textContent = document.getElementById('ocorrenciaInput').value;
  document.getElementById('data').textContent = document.getElementById('dataInput').value;
  document.getElementById('localOcorrencia').textContent = document.getElementById('localOcorrenciaInput').value;
  document.getElementById('distrito').textContent = document.getElementById('distritoInput').value;
  document.getElementById('equipe').textContent = document.getElementById('equipeInput').value;
  document.getElementById('bopm').textContent = document.getElementById('bopmInput').value;
  document.getElementById('bopc').textContent = document.getElementById('bopcInput').value;
  document.getElementById('abordagem').textContent = document.getElementById('abordagemInput').value;
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
