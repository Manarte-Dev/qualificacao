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
}
