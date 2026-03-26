document.addEventListener('DOMContentLoaded', () => {
  const transactionBody = document.getElementById('transactionBody');
  const paginationInfo = document.getElementById('paginationInfo');
  const addBtn = document.querySelector('header button');
  const token = localStorage.getItem('finance_token');
  const workspaceId = localStorage.getItem('finance_workspace');

  if (!token || !workspaceId) return;

  async function loadTransactions() {
    const { status, data } = await apiGetTransactions(token, workspaceId);
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
          <td colspan="5" class="px-6 py-12 text-center text-slate-500 italic">No hay movimientos registrados en este workspace</td>
        </tr>
      `;
      paginationInfo.innerHTML = '<p>Sin movimientos</p>';
      return;
    }

    transactions.forEach(t => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-white/5 transition-all group border-b border-slate-800/50';
      
      const isIngreso = (t.tipo || t.type) === 'INGRESO';
      const colorClass = isIngreso ? 'text-emerald-400' : 'text-rose-400';
      const sign = isIngreso ? '+' : '-';
      
      const dateStr = t.fecha || t.date || new Date().toISOString();
      const date = new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

      row.innerHTML = `
        <td class="px-6 py-4 text-sm text-slate-500 font-mono">${date}</td>
        <td class="px-6 py-4">
          <div class="font-bold text-white group-hover:text-indigo-400 transition-colors">${t.descripcion || 'Sin descripción'}</div>
          <div class="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">ID: ${t.id}</div>
        </td>
        <td class="px-6 py-4">
          <span class="px-3 py-1 ${isIngreso ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} border rounded-full text-[9px] font-black uppercase">
            ${t.categoriaNombre || t.categoryName || 'General'}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-slate-400 font-medium italic">${t.beneficiarioNombre || t.beneficiaryName || '-'}</td>
        <td class="px-6 py-4 text-right font-black text-lg ${colorClass}">${sign}$${parseFloat(t.monto || t.amount).toLocaleString()}</td>
      `;
      transactionBody.appendChild(row);
    });

    paginationInfo.innerHTML = `<p class="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Total: ${transactions.length} movimientos encontrados</p>`;
  }

  async function handleCreateTransaction() {
    // 1. Get Categories and Beneficiaries
    const { data: catData } = await apiGetCategorias(token, workspaceId);
    const { data: benData } = await apiGetBeneficiarios(token, workspaceId);
    
    const cats = (catData.data || []).filter(c => c.workspaceId == workspaceId);
    const bens = (benData.data || []).filter(b => b.workspaceId == workspaceId);
    
    if (cats.length === 0) {
      showToast('Debes crear al menos una categoría primero', 'warning');
      return;
    }

    const desc = prompt('Descripción del movimiento:');
    if (!desc) return;
    
    const monto = prompt('Monto:');
    if (!monto || isNaN(monto)) return;

    const tipo = confirm('¿Es un INGRESO?\n\nOK = INGRESO\nCancelar = GASTO') ? 'INGRESO' : 'GASTO';

    const catPrompt = `Escribe el NOMBRE de la categoría:\n\n${cats.map(c => `• ${c.nombre || c.name}`).join('\n')}`;
    const selectedCatName = prompt(catPrompt);
    const foundCat = cats.find(c => (c.nombre || c.name).toLowerCase() === selectedCatName?.toLowerCase());

    if (!foundCat) {
      showToast('Categoría inválida', 'error');
      return;
    }

    let beneficiarioId = null;
    if (bens.length > 0) {
      const benPrompt = `Escribe el NOMBRE del beneficiario (opcional):\n\n${bens.map(b => `• ${b.nombre || b.name}`).join('\n')}`;
      const selectedBenName = prompt(benPrompt);
      const foundBen = bens.find(b => (b.nombre || b.name).toLowerCase() === selectedBenName?.toLowerCase());
      if (foundBen) beneficiarioId = foundBen.id;
    }

    const body = {
      workspaceId: parseInt(workspaceId),
      tipo: tipo,
      monto: parseFloat(monto),
      descripcion: desc,
      fecha: new Date().toISOString(),
      categoriaId: foundCat.id,
      beneficiarioId: beneficiarioId
    };

    const { status, data } = await apiCreateTransaction(token, body);
    if (status === 200 || status === 201) {
      showToast('Movimiento registrado satisfactoriamente');
      loadTransactions();
    } else {
      showToast(data.mensaje || 'Error al guardar movimiento', 'error');
    }
  }

  addBtn.addEventListener('click', handleCreateTransaction);

  loadTransactions();
});
