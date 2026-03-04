const GOLD_API_KEY = 'goldapi-s34j6smmc74s49-io'; 

async function actualizarTodo() {
    const divRes = document.getElementById('resultado');
    divRes.innerHTML = "Sincronizando mercados...";
    await Promise.all([actualizarPrecioOro(), actualizarTasaDolar()]);
    divRes.innerHTML = "Listo para calcular ✅";
}

async function actualizarPrecioOro() {
    try {
        const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
            headers: { "x-access-token": GOLD_API_KEY }
        });
        const data = await res.json();
        if (data.price_gram_24k) document.getElementById('precioPuro').value = data.price_gram_24k.toFixed(2);
    } catch (e) { console.log("Error Oro"); }
}

async function actualizarTasaDolar() {
    try {
        const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
        const data = await res.json();
        if (data.promedio) document.getElementById('tasaDolar').value = data.promedio.toFixed(2);
    } catch (e) { console.log("Error Tasa"); }
}

function actualizarMargen() {
    document.getElementById('margenValor').innerText = document.getElementById('margen').value + "%";
}

function calcular() {
    const precio = parseFloat(document.getElementById('precioPuro').value);
    const tasa = parseFloat(document.getElementById('tasaDolar').value) || 0;
    const peso = parseFloat(document.getElementById('peso').value);
    const k = parseInt(document.getElementById('quilates').value);
    const margen = parseInt(document.getElementById('margen').value);
    const divRes = document.getElementById('resultado');

    if (precio > 0 && peso > 0) {
        const bruto = (peso * (k / 24)) * precio;
        const netoUSD = bruto * (1 - (margen / 100));
        const ganancia = bruto - netoUSD;
        
        let bsHTML = "";
        if (tasa > 0) {
            bsHTML = `<div style="color: #3498db; font-size: 1.3rem; font-weight: bold; margin-top: 5px;">
                Bs. ${(netoUSD * tasa).toLocaleString('es-VE', {minimumFractionDigits: 2})}
            </div>`;
        }

        divRes.innerHTML = `
            <div style="font-size: 0.8rem; color: #bdc3c7;">Valor Real: $${bruto.toFixed(2)}</div>
            <div style="margin: 10px 0;">
                <span style="color: #2ecc71;">Pagar al cliente:</span><br>
                <strong style="font-size: 1.8rem; color: #f1c40f;">$${netoUSD.toFixed(2)}</strong>
                ${bsHTML}
            </div>
            <div style="font-size: 0.9rem; color: #2ecc71; font-weight: bold; border-top: 1px solid #444; pt: 5px;">
                Ganancia: $${ganancia.toFixed(2)}
            </div>
        `;
        guardarHistorial(peso, k, netoUSD);
    }
}

function guardarHistorial(p, k, t) {
    let h = JSON.parse(localStorage.getItem('compras')) || [];
    h.unshift({ d: `${p}g de ${k}K`, m: t.toFixed(2), h: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
    localStorage.setItem('compras', JSON.stringify(h.slice(0, 5)));
    mostrarHistorial();
}

function mostrarHistorial() {
    const l = document.getElementById('listaHistorial');
    const h = JSON.parse(localStorage.getItem('compras')) || [];
    l.innerHTML = h.map(i => `<div class="history-item"><span>${i.d} (${i.h})</span><strong>$${i.m}</strong></div>`).join('');
}

function limpiarHistorial() { localStorage.removeItem('compras'); mostrarHistorial(); }

window.onload = () => { actualizarTodo(); mostrarHistorial(); };
