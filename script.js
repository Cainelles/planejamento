let entradas = [];
let saidas = [];
let acumuladoGuardar = 0;    // Acumulado de guardar/investir
let acumuladoLuaDeMel = 0;   // Acumulado de lua de mel

fetch('finan.xlsx')
    .then(res => res.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        entradas = XLSX.utils.sheet_to_json(workbook.Sheets['ENTRADAS'], { defval: "" });
        saidas = XLSX.utils.sheet_to_json(workbook.Sheets['SAIDAS'], { defval: "" });
        carregarMeses();
    });

// ===== Carrega botões de meses =====
function carregarMeses() {
    const container = document.getElementById('botoesMeses');
    container.innerHTML = '';

    const meses = [...new Set([...entradas.map(e => e['MÊS']), ...saidas.map(s => s['MÊS'])])];
    const ordemMeses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    meses.sort((a,b) => ordemMeses.indexOf(a) - ordemMeses.indexOf(b));

    meses.forEach(mes => {
        if (!mes) return;
        const btn = document.createElement('button');
        btn.textContent = mes;
        btn.addEventListener('click', function () {
            document.querySelectorAll('#botoesMeses button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            filtrarEntradas(mes);
            filtrarSaidas(mes);
            calcularDistribuicaoMes(mes);
        });
        container.appendChild(btn);
    });
}

// ===== Filtra entradas =====
function filtrarEntradas(mes) {
    const body = document.getElementById('entradasBody');
    body.innerHTML = '';
    let total = 0;

    entradas.filter(e => e['MÊS'] === mes).forEach(e => {
        total += Number(e['VALOR']) || 0;
        body.innerHTML += `
            <tr>
                <td>${e['DESCRIÇÃO']}</td>
                <td>R$ ${Number(e['VALOR']).toFixed(2)}</td>
            </tr>
        `;
    });

    document.getElementById('totalEntradas').textContent = total.toFixed(2);
}

// ===== Filtra saídas =====
function filtrarSaidas(mes) {
    const body = document.getElementById('saidasBody');
    body.innerHTML = '';
    let total = 0;

    saidas.filter(s => s['MÊS'] === mes).forEach(s => {
        total += Number(s['VALOR']) || 0;
        body.innerHTML += `
            <tr>
                <td>${s['CATEGORIAS']}</td>
                <td>${s['DESCRIÇÃO']}</td>
                <td>R$ ${Number(s['VALOR']).toFixed(2)}</td>
                <td>${s['PARCELAS']}</td>
            </tr>
        `;
    });

    document.getElementById('totalSaidas').textContent = total.toFixed(2);
}

// ===== Calcula distribuição do mês e acumulado =====
function calcularDistribuicaoMes(mes) {
    const entradasVal = entradas.filter(e => e['MÊS'] === mes).reduce((acc,e) => acc + Number(e['VALOR'] || 0), 0);
    const saidasVal = saidas.filter(s => s['MÊS'] === mes).reduce((acc,s) => acc + Number(s['VALOR'] || 0), 0);
    const saldoMes = entradasVal - saidasVal;

    document.getElementById('resultado').textContent = saldoMes.toFixed(2);

    // Distribuição do mês
    const guardarMes = saldoMes * 0.5;
    const luaDeMelMes = saldoMes * 0.25;
    const lazerMes = saldoMes * 0.25;

    // Atualiza acumulados
    acumuladoGuardar += guardarMes;
    acumuladoLuaDeMel += luaDeMelMes;

    // Tabela do mês
    gerarTabela("Distribuição do Mês", [
        ["Guardar / Investir", guardarMes],
        ["Lua de Mel", luaDeMelMes],
        ["Lazer", lazerMes]
    ], "distribuicaoMes");

    // Tabela acumulada
    gerarTabela("Acumulado até o mês", [
        ["Guardar / Investir", acumuladoGuardar],
        ["Lua de Mel", acumuladoLuaDeMel]
    ], "distribuicaoAcumulada");
}

// ===== Função para gerar tabela =====
function gerarTabela(titulo, dados, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<h3 style="text-align:center;">${titulo}</h3>`;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Categoria</th><th>Valor (R$)</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    dados.forEach(([cat, val]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${cat}</td><td>R$ ${val.toFixed(2)}</td>`;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}
