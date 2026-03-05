/* --- MAPA DOS CAMPOS --- */
const CAMPOS = [
  {input: 'nomeInput',                 output: 'nome',                 prefix: 'NOME COMPLETO: '},
  {input: 'nascimentoInput',           output: 'nascimento',           prefix: 'DATA DE NASCIMENTO: '},
  {input: 'naturalidadeInput',         output: 'naturalidade',         prefix: 'NATURAL DE: '},
  {input: 'rgInput',                   output: 'rg',                   prefix: 'RG / CPF: '},
  {input: 'localInput',                output: 'local',                prefix: 'ENDEREÇO DOS FATOS: '},
  {input: 'enderecoInput',             output: 'endereco',             prefix: 'ENDEREÇO DO PRESO: '},
  {input: 'distritoInput',             output: 'distrito',             prefix: 'DISTRITO: '},
  {input: 'equipeInput',               output: 'equipe',               prefix: 'EQUIPE: '},
  {input: 'bopmInput',                 output: 'bopm',                 prefix: 'BOPM Nº: '},
  {input: 'bopcInput',                 output: 'bopc',                 prefix: 'BOPC Nº: '},
  {input: 'codigodeocorrenciaInput',   output: 'codigodeocorrencia',   prefix: 'TIPO DE OCORRÊNCIA: '},
  {input: 'vulgoInput',                output: 'vulgo',                prefix: 'VULGO: '},
  {input: 'datafatoInput',             output: 'datafato',             prefix: 'DATA DO FATO: '},
  {input: 'flagranteInput',            output: 'flagrante',            prefix: 'FLAGRANTE / ABORDAGEM: '}
];

function $(id){ return document.getElementById(id); }

/* --- Campos ao vivo --- */
function atualizarSaidaDoCampo({input, output, prefix}) {
  const elIn = $(input);
  const elOut = $(output);
  if (!elIn || !elOut) return;
  const valor = (elIn.value || '').trim();
  elOut.textContent = prefix + (valor || '');
}

function ligarPreenchimentoAoVivo() {
  CAMPOS.forEach(cfg => {
    const elIn = $(cfg.input);
    if (!elIn) return;
    atualizarSaidaDoCampo(cfg);
    elIn.addEventListener('input',  () => atualizarSaidaDoCampo(cfg));
    elIn.addEventListener('change', () => atualizarSaidaDoCampo(cfg));
    elIn.addEventListener('blur',   () => atualizarSaidaDoCampo(cfg));
  });
}

/* --- Foto preview (base64) --- */
function ligarPreviewFoto() {
  const fotoInput = $('fotoInput');
  const foto = $('foto');
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
      alert('Selecione um arquivo de imagem.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => { foto.src = ev.target.result; };
    reader.readAsDataURL(file);
  });
}

/* --- Brasão por botões (data-logo) --- */
function ligarSelecaoLogo() {
  const brasao = $('brasao');
  const botoes = document.querySelectorAll('.logos button');
  if (!brasao || botoes.length === 0) return;

  const salvo = localStorage.getItem('logoSelecionada') || 'imagens/brasao-pmesp.png';
  brasao.src = salvo;

  botoes.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.logo;
      if (!src) return;
      brasao.src = src;
      localStorage.setItem('logoSelecionada', src);
    });
  });
}

/* --- Download helpers --- */
function getNomeArquivo() {
  const nome = $('nomeInput')?.value?.trim();
  const d = new Date();
  const ts =
    String(d.getDate()).padStart(2,'0') +
    String(d.getMonth()+1).padStart(2,'0') +
    d.getFullYear();

  return nome
    ? `ficha_${nome.replace(/\s+/g,'_').toLowerCase()}_${ts}.png`
    : `ficha_qualificacao_${ts}.png`;
}

function downloadDataUrl(dataUrl, filename){
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function esperarImagem(img){
  if(!img) return;
  if(img.complete && img.naturalWidth > 0) return;
  await new Promise((resolve) => {
    img.addEventListener("load", resolve, {once:true});
    img.addEventListener("error", resolve, {once:true});
  });
}

/* --- Baixar ficha (clone estável) --- */
async function baixarFicha(){
  const ficha = $("ficha");
  const exportArea = $("exportArea");
  const loading = $("loading");
  const btn = $("btnBaixar");

  if(!window.html2canvas) return alert("html2canvas não carregou.");
  if(!ficha) return alert("#ficha não encontrado.");
  if(!exportArea) return alert("#exportArea não encontrado.");

  loading && (loading.style.display = "block");
  if(btn){ btn.disabled = true; btn.textContent = "Gerando..."; }

  try{
    exportArea.innerHTML = "";
    const clone = ficha.cloneNode(true);
    clone.removeAttribute("id");
    exportArea.appendChild(clone);

    // força src no clone
    const brasaoClone = clone.querySelector("#brasao") || clone.querySelector(".brasao");
    const fotoClone = clone.querySelector("#foto");

    if(brasaoClone && $("brasao")?.src) brasaoClone.src = $("brasao").src;
    if(fotoClone && $("foto")?.src) fotoClone.src = $("foto").src;

    await esperarImagem(brasaoClone);
    if(fotoClone?.src) await esperarImagem(fotoClone);

    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 3,
      useCORS: true,
      allowTaint: false,
      logging: false
    });

    downloadDataUrl(canvas.toDataURL("image/png"), getNomeArquivo());

  } catch (e){
    console.error(e);
    alert("Erro ao gerar ficha: " + e.message);
  } finally {
    exportArea.innerHTML = "";
    loading && (loading.style.display = "none");
    if(btn){ btn.disabled = false; btn.textContent = "Baixar Ficha"; }
  }
}

/* --- Limpar --- */
function limparFormulario() {
  if (!confirm('Tem certeza que deseja limpar todos os campos?')) return;

  document.querySelectorAll('input[type="text"]').forEach(i => i.value = '');

  const fotoInput = $('fotoInput');
  const foto = $('foto');
  if (fotoInput) fotoInput.value = '';
  if (foto) foto.src = '';

  CAMPOS.forEach(({output, prefix}) => {
    const elOut = $(output);
    if (elOut) elOut.textContent = prefix;
  });

  const brasao = $('brasao');
  if (brasao) brasao.src = 'imagens/brasao-pmesp.png';
  localStorage.removeItem('logoSelecionada');
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  ligarPreviewFoto();
  ligarPreenchimentoAoVivo();
  ligarSelecaoLogo();
});

/* ✅ deixa acessível pro onclick */
window.baixarFicha = baixarFicha;
window.limparFormulario = limparFormulario;