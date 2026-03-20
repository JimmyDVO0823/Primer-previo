document.addEventListener('DOMContentLoaded', () => {
  const transactionBody = document.getElementById('transactionBody');
  const paginationInfo = document.getElementById('paginationInfo');
  const addBtn = document.querySelector('header button');
  const token = localStorage.getItem('finance_token');
  const workspaceId = localStorage.getItem('finance_workspace');

  if (!token || !workspaceId) return;

  async function loadTransactions() {
    const { status, data } = await apiGetTransactions(token);
    if (status === 200) {
      renderTransactions(data.data || []);
    } else {
      showToast('Error al cargar movimientos', 'error');
    }
  }

  function renderTransactions(transactions) {
    transactionBody.innerHTML = '';
    
    if (transactions.length === 0) {
      transactionBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-12 text-center text-slate-500 italic">No hay movimientos registrados</td>
        </tr>
      `;
      paginationInfo.innerHTML = '<p>Sin movimientos</p>';
      return;
    }

    transactions.forEach(t => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-white/5 transition-all group';
      
      const isIngreso = t.tipo === 'INGRESO';
      const colorClass = isIngreso ? 'text-emerald-400' : 'text-slate-200';
      const sign = isIngreso ? '+' : '-';
      
      // Formatting date (Assuming "fecha" is YYYY-MM-DD)
      const date = new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

      row.innerHTML = `
        <td class="px-6 py-4 text-sm text-slate-400">${date}</td>
        <td class="px-6 py-4 font-bold text-white">${t.descripcion || 'Sin descripción'}</td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 ${isIngreso ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} rounded-lg text-[10px] font-bold uppercase">
            ${t.categoriaNombre || 'General'}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-slate-300">${t.beneficiarioNombre || 'N/A'}</td>
        <td class="px-6 py-4 text-right font-black ${colorClass}">${sign}$${parseFloat(t.monto).toLocaleString()}</td>
      `;
      transactionBody.appendChild(row);
    });

    paginationInfo.innerHTML = `
      <p>Mostrando ${transactions.length} movimientos</p>
      <div class="flex gap-2">
        <button class="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all opacity-50 cursor-not-allowed">Anterior</button>
        <button class="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all opacity-50 cursor-not-allowed">Siguiente</button>
      </div>
    `;
  }

  async function handleCreateTransaction() {
    // 1. Get Categories for the popup
    const { data: catData } = await apiGetCategorias(token);
    const cats = (catData.data || []).filter(c => c.workspaceId == workspaceId);
    
    if (cats.length === 0) {
      showToast('Primero debes crear una categoría', 'warning');
      return;
    }

    const desc = prompt('Descripción del movimiento:');
    if (!desc) return;
    
    const monto = prompt('Monto ($):');
    if (!monto || isNaN(monto)) return;

    const tipo = confirm('¿Es un INGRESO? (OK para Ingreso, Cancelar para Gasto)') ? 'INGRESO' : 'GASTO';

    // Show categories list in prompt is hard, so we just take the first one or ask for ID for now
    // Ideally we'd have a modal, but for speed let's just use the first available cat for this test
    // OR we can ask for the Category Name and find it.
    const catName = prompt(`Escribe el nombre de la categoría:\n(${cats.map(c => c.nombre).join(', ')})`);
    const foundCat = cats.find(c => c.nombre.toLowerCase().includes(catName.toLowerCase()));
    
    if (!foundCat) {
      showToast('Categoría no encontrada', 'error');
      return;
    }

    const body = {
      workspaceId: parseInt(workspaceId),
      tipo: tipo,
      categoriaId: foundCat.id,
      monto: parseFloat(monto),
      descripcion: desc,
      fecha: new Date().toISOString().split('T')[0] // Today
    };

    const { status, data } = await apiCreateTransaction(token, body);
    if (status === 200 || status === 201) {
      showToast('Movimiento registrado', 'success');
      loadTransactions();
    } else {
      showToast(data.mensaje || 'Error al registrar', 'error');
    }
  }

  addBtn.addEventListener('click', handleCreateTransaction);

  loadTransactions();
});
