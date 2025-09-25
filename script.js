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

  document.getElementById('nome').textContent = 'NOME: ' + document.getElementById('nomeInput').value;
  document.getElementById('vulgo').textContent = 'VULGO: ' + document.getElementById('vulgoInput').value;
  document.getElementById('ocorrencia').textContent = 'TIPO DA OCORRÊNCIA: ' + document.getElementById('ocorrenciaInput').value;
  document.getElementById('enderecoFlagrante').textContent = 'ENDEREÇO DO FLAGRANTE: ' + document.getElementById('enderecoFlagranteInput').value;
  document.getElementById('enderecoPreso').textContent = 'ENDEREÇO DO PRESO: ' + document.getElementById('enderecoPresoInput').value;
  document.getElementById('rg').textContent = 'RG: ' + document.getElementById('rgInput').value;
  document.getElementById('data').textContent = 'DATA DA OCORRÊNCIA: ' + document.getElementById('dataInput').value;
  document.getElementById('dp').textContent = 'DP: ' + document.getElementById('dpInput').value;
  document.getElementById('bopc').textContent = 'BOPC: ' + document.getElementById('bopcInput').value;
  document.getElementById('bopm').textContent = 'BOPM: ' + document.getElementById('bopmInput').value;
  document.getElementById('equipe').textContent = 'EQUIPE: ' + document.getElementById('equipeInput').value;
  document.getElementById('pel').textContent = 'PEL: ' + document.getElementById('pelInput').value;
  document.getElementById('abordagem').textContent = 'ABORDAGEM OU FLAGRANTE: ' + document.getElementById('abordagemInput').value;
}

function baixarFicha() {
  const ficha = document.getElementById('ficha');
  html2canvas(ficha).then(canvas => {
    const link = document.createElement('a');
    link.download = 'ficha-policial.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}
