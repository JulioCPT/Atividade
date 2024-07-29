// Variável das APIs
const apiPedidosUrl = 'https://sistemalift1.com/lift_ps/api/Pedidos/';
const apiClientesUrl = 'https://sistemalift1.com/lift_ps/api/Clientes/';
const apiItensPedidoUrl = 'https://sistemalift1.com/lift_ps/api/ItensPedido/';
const apiProdutosUrl = 'https://sistemalift1.com/lift_ps/api/Produtos/';

// Função para formatar valores pro Real (R$)
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para buscar e armazenar a lista de pedidos e dos clientes
async function carregarPedidos() {
    try {
        const responsePedidos = await fetch(apiPedidosUrl);
        const pedidos = await responsePedidos.json();

        const responseClientes = await fetch(apiClientesUrl);
        const clientes = await responseClientes.json();

        // Associar o IDs dos clientes aos seus nomes
        const clientePorId = {};
        clientes.forEach(cliente => {
            clientePorId[cliente.id] = cliente.nome;
        });

        const responseItens = await fetch(apiItensPedidoUrl);
        const todosItens = await responseItens.json();

        const responseProdutos = await fetch(apiProdutosUrl);
        const todosProdutos = await responseProdutos.json();
        // Armazena o ID do produto no objeto
        const produtoPorId = {};
        todosProdutos.forEach(produto => {
            produtoPorId[produto.id] = produto;
        });
        
        // Limpa a lista de pedidos
        const pedidosLista = document.getElementById('pedidos-lista');
        pedidosLista.innerHTML = ''; 

        pedidos.forEach(pedido => {
            // Filtra a lista para encontrar os itens que pertencem ao pedido selecionado
            const itensPedido = todosItens.filter(item => item.pedido === pedido.id);

            // Calcula o valor total do pedido
            let valorTotalPedido = 0;
            for (const item of itensPedido) {
                const produto = produtoPorId[item.produto];
                if (produto) {
                    const valorItem = item.quantidade * produto.valor;
                    valorTotalPedido += valorItem;
                }
            }
            
            // Preenche os dados no HTML ("Lista de Pedidos")
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="#" data-id="${pedido.id}">${pedido.id}</a></td>
                <td>${clientePorId[pedido.cliente] || 'Desconhecido'}</td> <!-- Nome do Cliente -->
                <td>${pedido.data}</td>
                <td>${formatarMoeda(valorTotalPedido)}</td> <!-- Valor total do pedido -->
            `;
            pedidosLista.appendChild(row);
        });

        // Clique do pedido
        pedidosLista.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const pedidoId = link.dataset.id;

                // Classe para destacar o pedido selecionado no CSS

                // Remove a classe 'active' de todos os itens
                pedidosLista.querySelectorAll('tr').forEach(tr => {
                    tr.classList.remove('active');
                });

                // Adiciona a classe 'active' ao item selecionado
                link.closest('tr').classList.add('active');

                carregarInformacoesDoPedido(pedidoId);
            });
        });

    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

// Função para buscar e preencher as informações do pedido selecionado
async function carregarInformacoesDoPedido(pedidoId) {
    try {
        // Busca o pedido selecionado
        const responsePedido = await fetch(`${apiPedidosUrl}${pedidoId}/`);
        const pedido = await responsePedido.json();

        // Busca as informações do cliente 
        const responseCliente = await fetch(`${apiClientesUrl}${pedido.cliente}/`);
        const cliente = await responseCliente.json();

        // Preenche os dados no HTML do ("Dados do Cliente")
        document.getElementById('id_pedido').textContent = pedido.id;
        document.getElementById('nome_cliente').textContent = cliente.nome;
        document.getElementById('cpf_cliente').textContent = cliente.cpf;
        document.getElementById('email_cliente').textContent = cliente.email;
        document.getElementById('data_pedido').textContent = pedido.data;

        // Busca os itens do pedido
        const responseItens = await fetch(apiItensPedidoUrl);
        const itens = await responseItens.json();

        // Filtra os itens para o pedido que foi selecionado
        const itensPedido = itens.filter(item => item.pedido === pedido.id);

        // Limpa a lista de itens do pedido
        const itensPedidoLista = document.getElementById('itens-pedido-lista');
        itensPedidoLista.innerHTML = '';

        // Variável para somar o valor total 
        let valorTotal = 0; 

        // Preenche a lista de itens do pedido
        for (const item of itensPedido) {
            const responseProduto = await fetch(`${apiProdutosUrl}${item.produto}/`);
            const produto = await responseProduto.json();

            // Calcula o valor do item 
            const valorItem = item.quantidade * produto.valor;

            // Atualiza o valor total 
            valorTotal += valorItem;

            // Preenche os dados no HTML ("Itens do Pedido")
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.produto}</td> <!-- Código do produto -->
                <td>${produto.nome}</td> <!-- Nome do produto -->
                <td>${item.quantidade}</td> <!-- Quantidade do item -->
                <td>${formatarMoeda(valorItem)}</td> <!-- Valor do item -->
            `;
            itensPedidoLista.appendChild(row);
        }

        // Atualiza o valor total na interface
        document.getElementById('valor_total_pedido').textContent = formatarMoeda(valorTotal);

    } catch (error) {
        console.error('Erro ao carregar informações do pedido:', error);
    }
}

// Carrega a lista de pedidos quando abre a página
document.addEventListener('DOMContentLoaded', carregarPedidos);