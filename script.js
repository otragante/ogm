// ===== EDITAR CLIENTE MODAL =====
let clienteEditando = null;

function editarClienteModal(i){
let c = clientes[i];
if(!c) return;

clienteEditando = i;

$("editClienteNome").value = c.nome || "";
$("editClienteApelido").value = c.apelido || "";
$("editClienteEndereco").value = c.endereco || "";
$("editClienteCidade").value = c.cidade || "";
$("editClienteCep").value = c.cep || "";
$("editClienteTelefone").value = c.telefone || "";

$("modalEditarCliente").style.display = "flex";
}

function fecharModalCliente(){
$("modalEditarCliente").style.display = "none";
}

const $ = id => document.getElementById(id);

let estoque = JSON.parse(localStorage.getItem("estoque"))||[];
let clientes = JSON.parse(localStorage.getItem("clientes"))||[];
let rifas = JSON.parse(localStorage.getItem("rifas"))||[];
let vendas = JSON.parse(localStorage.getItem("vendas"))||[];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];

function salvar(){
localStorage.setItem("estoque",JSON.stringify(estoque));
localStorage.setItem("clientes",JSON.stringify(clientes));
localStorage.setItem("rifas",JSON.stringify(rifas));
localStorage.setItem("vendas",JSON.stringify(vendas));
localStorage.setItem("despesas",JSON.stringify(despesas)); // 👈 aqui
}

function exportar(){
    let dados = {
        estoque,
        clientes,
        vendas,
        despesas,
        rifas
    };

    let blob = new Blob([JSON.stringify(dados)], {type:"application/json"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
}

function show(id){

document.querySelectorAll('.section').forEach(s=>{
s.classList.remove('active');
});

document.querySelectorAll('.main-nav button').forEach(btn=>{
btn.classList.toggle('is-active', btn.dataset.section === id);
});

let el = document.getElementById(id);

if(el){
el.classList.add('active');
window.scrollTo({ top: 0, behavior: 'smooth' });
}

if(id==="garagem"){
carregarClientesGaragem();
renderGaragem();
}

if(id==="rifas"){
renderCarrosRifa();
renderRifas();
renderNumeros();
}
}

// ===== ESTOQUE =====
function addCarro(){

let nome = $("nome").value;
let preco = parseFloat($("preco").value);
let custo = parseFloat($("custo").value) || 0;
let quantidade = parseInt($("quantidade").value) || 1;

if(!nome || isNaN(preco)){
alert("Preencha corretamente");
return;
}

let files = $("imagens").files;
let imgs = [];

let lucro = preco - custo; // ✅ ESSENCIAL

function finalizar(){

estoque.push({
id: Date.now(),
nome,
preco,
custo,
lucro,
quantidade,
imgs: Array.isArray(imgs) ? imgs : [],
status:"Disponível"
});

salvar();
renderEstoque();
renderCarrosRifa();

$("nome").value="";
$("preco").value="";
$("custo").value="";
$("quantidade").value="";
$("imagens").value="";
}

if(files.length === 0){
finalizar();
return;
}

let count = 0;

for(let i=0;i<files.length;i++){
let reader = new FileReader();

reader.onload = e=>{
imgs.push(e.target.result);
count++;

if(count === files.length){
finalizar();
}
};

reader.readAsDataURL(files[i]);
}

}

function renderEstoque(){

$("listaEstoque").innerHTML="";

estoque.forEach((c,i)=>{

let statusClass = c.status==="Vendido"?"status-vendido":"status-disponivel";

$("listaEstoque").innerHTML+=`
<div class="card">

${c.imgs && c.imgs.length > 0 ? `
<img src="${c.imgs[0]}" onclick="abrirGaleriaModal(${i})" style="cursor:pointer">
` : ""}

<h3>${c.nome}</h3>

<p>💰 Venda: R$${c.preco}</p>
<p>📉 Custo: R$${c.custo}</p>
<p>📈 Lucro: R$${c.preco - c.custo}</p>

<p>📦 Qtd: ${c.quantidade}</p>
<p class="${statusClass}">${c.status}</p>

<button onclick="editarItem(${i})">✏️</button>
<button onclick="vender(${i})">💰</button>
<button onclick="remover(${i})">🗑️</button>

</div>
`;
});
}

function abrirGaleria(i){
let imgs = estoque[i].imgs;
if(!imgs || imgs.length===0){
alert("Sem imagens");
return;
}
let html = imgs.map(img=>`<img src="${img}" style="width:100%">`).join("");
let win = window.open("");
if(!win){ alert("Popup bloqueado"); return; }
win.document.write(html);
}

function editarQtd(i){
let q = prompt("Nova quantidade", estoque[i].quantidade);
if(q!==null){
estoque[i].quantidade = Math.max(0, parseInt(q)||0);
salvar();
renderEstoque();
}
}



function toggleStatus(i){
abrirVenda(i);
}



function remover(i){
if(!confirm("Excluir item?")) return;

estoque.splice(i,1);

salvar();
renderEstoque();
renderCarrosRifa();

// opcional
dashboard();
}

function fecharVenda(){
console.log("clicou cancelar");
$("modalVenda").style.display = "none";
}

function vender(i){
abrirVenda(i);
return;

/* legacy direct-sale code kept below but bypassed */

let item = estoque[i];

if(item.quantidade <= 0){
alert("Sem estoque");
return;
}

item.quantidade--;

if(item.quantidade <= 0){
item.status = "Vendido";
}

vendas.push({
itemId: item.id,
valor: item.preco
});

salvar();
renderEstoque();
dashboard();
}

// ===== MODAL =====
let indexEditando = null;

function editarItem(i){
let item = estoque[i];
indexEditando = i;

$("editNome").value = item.nome;
$("editPreco").value = item.preco;
$("editCusto").value = item.custo || 0;
$("editQtd").value = item.quantidade;
$("editStatus").value = item.status || "Disponível";

$("modalEditar").style.display = "flex";
}

function fecharModal(){
$("modalEditar").style.display = "none";
}

function salvarEdicao(){

let nome = $("editNome").value;
let preco = parseFloat($("editPreco").value);
let custo = parseFloat($("editCusto").value) || 0;
let qtd = parseInt($("editQtd").value);
let status = $("editStatus").value;

if(!nome || isNaN(preco)){
alert("Dados inválidos");
return;
}

let lucro = preco - custo;

estoque[indexEditando] = {
...estoque[indexEditando],
nome,
preco,
custo,
lucro,
quantidade: Math.max(0, qtd || 0),
status
};

salvar();
renderEstoque();
renderCarrosRifa();
fecharModal();
}


// ===== GARAGEM =====

function carregarClientesGaragem(){
$("clienteGaragem").innerHTML="";

clientes.forEach((c,i)=>{
$("clienteGaragem").innerHTML+=`<option value="${i}">${c.nome}</option>`;
});
}

function renderGaragem(){
if(clientes.length === 0){
$("listaGaragem").innerHTML = "Sem clientes";
return;
}

let i = $("clienteGaragem").value || 0;
let cliente = clientes[i];

if(!cliente.garagem) cliente.garagem = [];

let total = cliente.garagem.reduce((a,b)=>a + (b.preco * (b.qtd||1)),0);

// 🔥 DADOS DO CLIENTE
$("listaGaragem").innerHTML = `
<div class="card">
<h3>👤 ${cliente.nome}</h3>
${cliente.apelido || ""}
<br><br>
📞 ${cliente.telefone || "-"}<br>
📍 ${cliente.endereco || "-"}<br>
🏙️ ${cliente.cidade || "-"}
<br><br>
💰 Total: R$ ${total}
</div>
`;
cliente.garagem.forEach((item,index)=>{

$("listaGaragem").innerHTML+=`
<div class="card">

${item.imgs?.[0]?`
<img src="${item.imgs[0]}" onclick="abrirGaleriaItem(${i},${index})" style="cursor:pointer">
`:""}

<h3>${item.nome}</h3>

<p>💰 R$${item.preco}</p>
<p>📦 Qtd: ${item.qtd || 1}</p>

<button onclick="editarQtdGaragem(${i},${index})">📦</button>
<button onclick="removerItemGaragem(${i},${index})">🗑️</button>

</div>
`;

});

// 👇 FORA DO LOOP
let dados = cliente.garagem.map(i=>i.preco);

let grafico = dados.map(v=>`
<div style="background:red;height:${v}px;width:20px;margin:2px;"></div>
`).join("");

$("listaGaragem").innerHTML += `
<br><h3>📊 Gastos</h3>
<div style="display:flex;align-items:flex-end;height:150px;">
${grafico}
</div>
`;
}

function editarQtdGaragem(c,i){

let item = clientes[c].garagem[i];

let qtd = prompt("Quantidade:", item.qtd || 1);

if(qtd !== null){
item.qtd = Math.max(1, parseInt(qtd)||1);
salvar();
renderGaragem();
}
}


function abrirGaleriaItem(clienteIndex,itemIndex){

let item = clientes[clienteIndex].garagem[itemIndex];

if(!item.imgs || item.imgs.length === 0){
alert("Sem imagens");
return;
}

galeriaImgs = item.imgs;
galeriaIndex = 0;

renderGaleria();

$("modalGaleria").style.display = "block";
}

function removerItemGaragem(c,i){

if(!confirm("Remover item?")) return;

clientes[c].garagem.splice(i,1);

salvar();
renderGaragem();
}

function carregarClientesVenda(){

$("clienteVenda").innerHTML="";

clientes.forEach((c,i)=>{
$("clienteVenda").innerHTML+=`
<option value="${i}">
${c.nome} ${c.apelido ? "- "+c.apelido : ""}
</option>`;
});

if(clientes.length > 0){
$("clienteVenda").selectedIndex = 0;
}
}

// ===== CLIENTES =====
function addCliente(){
let nome = $("nomeCliente").value;
if(!nome) return alert("Nome obrigatório");

clientes.push({
nome,
apelido:$("apelidoCliente").value,
endereco:$("enderecoCliente").value,
cidade:$("cidadeCliente").value,
cep:$("cepCliente").value,
telefone:$("telefoneCliente").value,
garagem: []
});

salvar();
renderClientes();

// limpar campos
$("nomeCliente").value="";
$("apelidoCliente").value="";
$("enderecoCliente").value="";
$("cidadeCliente").value="";
$("cepCliente").value="";
$("telefoneCliente").value="";
}

function renderClientes(){

$("listaClientes").innerHTML="";
$("clienteSelect").innerHTML="";

clientes.forEach((c,i)=>{

$("listaClientes").innerHTML+=`
<div class="card" onclick="abrirCliente(${i})" style="cursor:pointer">

<strong>👤 ${c.nome}</strong><br>
${c.apelido ? `🏷️ ${c.apelido}<br>` : ""}

<br>

📍 ${c.endereco || "-"}<br>
🏙️ ${c.cidade || "-"}<br>
📮 ${c.cep || "-"}<br>

<br>

📞 ${c.telefone || "-"}

<br><br>

<button onclick="event.stopPropagation(); editarClienteModal(${i})">✏️</button>
<button onclick="event.stopPropagation(); excluirCliente(${i})">🗑️</button>

</div>`;

$("clienteSelect").innerHTML+=`
<option value="${i}">${c.nome}</option>`;
});
}

function salvarEdicaoCliente(){

if(clienteEditando === null || !clientes[clienteEditando]) return;

let nome = $("editClienteNome").value.trim();

if(!nome){
alert("Nome obrigatório");
return;
}

clientes[clienteEditando] = {
nome,
apelido: $("editClienteApelido").value.trim(),
endereco: $("editClienteEndereco").value.trim(),
cidade: $("editClienteCidade").value.trim(),
cep: $("editClienteCep").value.trim(),
telefone: $("editClienteTelefone").value.trim(),
garagem: clientes[clienteEditando].garagem || []
};

salvar();
renderClientes();
fecharModalCliente();
}

function fecharCliente(){
$("modalCliente").style.display = "none";
}

function excluirCliente(i){
if(!confirm("Excluir?")) return;
clientes.splice(i,1);
salvar();
renderClientes();
}

function filtrarClientes(){

let busca = $("buscarCliente").value.toLowerCase();

$("clienteSelect").innerHTML = "";

clientes.forEach((c,i)=>{
if(
c.nome.toLowerCase().includes(busca) ||
(c.apelido && c.apelido.toLowerCase().includes(busca))
){
$("clienteSelect").innerHTML += `
<option value="${i}">
${c.nome} ${c.apelido ? "- " + c.apelido : ""}
</option>`;
}
});

// fallback se vazio
if($("clienteSelect").options.length === 0){
$("clienteSelect").innerHTML = `<option value="">Nenhum cliente</option>`;
}else{
$("clienteSelect").selectedIndex = 0;
}
}

// ===== RIFAS =====
function renderCarrosRifa(){
$("carroRifa").innerHTML="";
estoque.forEach((c,i)=>{
$("carroRifa").innerHTML+=`<option value="${i}">${c.nome}</option>`;
});
}

function criarRifa(){
if(estoque.length===0){
alert("Sem itens no estoque");
return;
}

rifas.push({nome:estoque[$("carroRifa").value].nome,numeros:[],valor:5});
salvar();
renderRifas();
}

function renderRifas(){
$("rifaSelect").innerHTML="";
rifas.forEach((r,i)=>{
$("rifaSelect").innerHTML+=`<option value="${i}">${r.nome}</option>`;
});
}

function carregarRifa(){
renderNumeros();
}

function excluirRifa(){
if($("rifaSelect").value==="") return alert("Selecione uma rifa");
rifas.splice($("rifaSelect").value,1);
salvar();
renderRifas();
$("numeros").innerHTML="";
}

function gerarNumeros(){
let r = rifas[$("rifaSelect").value];
if(!r) return;

let qtd = parseInt($("qtdNumeros").value);

if(qtd<=0 || qtd>10000){
alert("Quantidade inválida (1-10000)");
return;
}

r.numeros=[];

for(let i=1;i<=qtd;i++){
r.numeros.push({n:i,status:"livre",cliente:"",pago:false});
}

salvar();
renderNumeros();
}

function renderNumeros(){
let r = rifas[$("rifaSelect").value];
if(!r) return;

$("numeros").innerHTML="";
r.numeros.forEach((n,i)=>{
$("numeros").innerHTML+=`
<div class="number ${n.status}" onclick="clicarNumero(${i})">
${n.n}<br>${n.cliente||''}
</div>`;
});
}

function clicarNumero(i){

let r = rifas[$("rifaSelect").value];
if(!r) return;

let clienteIndex = $("clienteSelect").value;
let cliente = clientes[clienteIndex];

if(!cliente){
alert("Selecione um cliente");
return;
}

let n = r.numeros[i];

if(n.status === "livre"){
    n.status = "reservado";
    n.cliente = cliente.nome;
}
else if(n.status === "reservado"){
    n.status = "pago";
    n.pago = true;

    // REGISTRA VENDA (RIFA)
    vendas.push({
        cliente: cliente.nome,
        valor: r.valor || 0
    });
}
else{
    n.status = "livre";
    n.cliente = "";
    n.pago = false;
}

salvar();
renderNumeros();
dashboard();
}

// ===== RANKING =====
function rankingClientes(){

let ranking = clientes.map(c=>{
return {
nome: c.nome,
total: totalCliente(c.nome)
};
});

ranking.sort((a,b)=>b.total - a.total);

return ranking;
}

// ===== DASHBOARD =====

function dashboard(){

let totalVendas = vendas.reduce((a,b)=>a + (b.valor || 0),0);

let custoProdutos = vendas.reduce((total, v) => {
let item = estoque.find(e => e.id === v.itemId);
return total + (item?.custo || 0);
}, 0);

let totalDespesas = despesas.reduce((a,b)=>a + (b.valor || 0),0);

let lucro = totalVendas - custoProdutos - totalDespesas;

let top = rankingClientes().slice(0,5)
.map(c=>`<li>${c.nome} - R$${c.total}</li>`)
.join("");

$("painel").innerHTML = `
<h2>💰 Vendas: R$${totalVendas}</h2>
<h3>📉 Custos: R$${custoProdutos}</h3>
<h3>📉 Despesas: R$${totalDespesas}</h3>
<h2>📈 Lucro: R$${lucro}</h2>

<br><br>

<h3>🏆 Top Clientes</h3>
<ul>${top}</ul>
`;
}

function totalCliente(nome){
return vendas
.filter(v => v.cliente === nome)
.reduce((a,b)=>a + (b.valor || 0),0);
}

// ===== GALERIA MODAL =====
let galeriaIndex = 0;
let galeriaImgs = [];

function abrirGaleriaModal(i){

if(!estoque[i].imgs || estoque[i].imgs.length === 0){
alert("Sem imagens");
return;
}

galeriaImgs = estoque[i].imgs;
galeriaIndex = 0;

renderGaleria();

$("modalGaleria").style.display = "block";
}

function fecharGaleria(){
$("modalGaleria").style.display = "none";
}

function trocarGaleria(direcao){

galeriaIndex += direcao;

if(galeriaIndex < 0) galeriaIndex = galeriaImgs.length - 1;
if(galeriaIndex >= galeriaImgs.length) galeriaIndex = 0;

renderGaleria();
}

function selecionarImg(i){
galeriaIndex = i;
renderGaleria();
}

function renderGaleria(){

$("imgGaleria").src = galeriaImgs[galeriaIndex];

$("miniaturas").innerHTML = "";

galeriaImgs.forEach((img, i)=>{
$("miniaturas").innerHTML += `
<img src="${img}"
onclick="selecionarImg(${i})"
style="
width:100%;
margin-bottom:10px;
cursor:pointer;
border:${i===galeriaIndex?'2px solid red':'2px solid transparent'};
">
`;
});
}

// ===== VENDA =====
let itemVendaIndex = null;

function abrirVenda(i){

itemVendaIndex = i;

let modal = $("modalVenda");
modal.style.display = "flex";

// clique fora fecha
modal.onclick = function(e){
if(e.target.id === "modalVenda"){
fecharVenda();
}
};

carregarClientesVenda();
}

function confirmarVenda(){

let clienteIndex = $("clienteVenda").value;

if(clienteIndex === ""){
alert("Selecione um cliente");
return;
}

let item = estoque[itemVendaIndex];
let cliente = clientes[clienteIndex];

// reduz quantidade
item.quantidade = Math.max(0, (item.quantidade || 1) - 1);

// atualiza status
if(item.quantidade <= 0){
item.status = "Vendido";
}

// envia pra garagem
if(!cliente.garagem) cliente.garagem = [];

cliente.garagem.push({
nome: item.nome,
preco: item.preco,
qtd: 1,
imgs: item.imgs || []
});

// registra venda
vendas.push({
cliente: cliente.nome,
itemId: item.id,
valor: item.preco
});

salvar();
renderEstoque();

// atualizar garagem corretamente
carregarClientesGaragem();
renderGaragem();

// 🔥 atualizar dashboard
dashboard();

fecharVenda();
}

function filtrarClientesVenda(){

let busca = $("buscarClienteVenda").value.toLowerCase();

$("clienteVenda").innerHTML="";

clientes.forEach((c,i)=>{
if(
c.nome.toLowerCase().includes(busca) ||
(c.apelido && c.apelido.toLowerCase().includes(busca))
){
$("clienteVenda").innerHTML += `
<option value="${i}">
${c.nome} ${c.apelido ? "- "+c.apelido : ""}
</option>`;
}
});

// 🔥 seleciona automaticamente o primeiro
if($("clienteVenda").options.length > 0){
$("clienteVenda").selectedIndex = 0;
}
}

// INIT
renderEstoque();
renderClientes();
renderCarrosRifa();
renderRifas();
dashboard();
document.querySelector('.main-nav button[data-section="estoque"]')?.classList.add('is-active');
