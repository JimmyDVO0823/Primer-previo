document.addEventListener('DOMContentLoaded', () => {
  const balanceVal = document.getElementById('balanceVal');
  const incomeVal = document.getElementById('incomeVal');
  const expenseVal = document.getElementById('expenseVal');
  const recentActivityList = document.getElementById('recentActivityList');
  const activeWorkspaceName = document.getElementById('activeWorkspaceName');
  const userNameHeader = document.getElementById('userNameHeader');

  const token = localStorage.getItem('finance_token');
  const workspaceId = localStorage.getItem('finance_workspace');

  if (!token || !workspaceId) return;

  async function loadDashboardData() {
    try {
      // 1. Get Me to refresh name and get usuarioId
      const { data: userData } = await apiGetMe(token);
      if (userData && (userData.data || userData.nombre)) {
        const user = userData.data || userData;
        userNameHeader.innerText = user.nombre || user.name || 'Usuario';
        document.getElementById('welcomeMsg').innerHTML = `Hola, <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">${user.nombre || user.name || 'Usuario'}</span>`;
      }

      const usuarioId = (userData.data && typeof userData.data === 'object') ? userData.data.id : 1; 
      
      // 2. Refresh active workspace name
      const { data: wsData } = await apiGetWorkspaces(token, usuarioId);
      const activeWs = (wsData.data || []).find(w => w.id == workspaceId);
      if (activeWs) {
        activeWorkspaceName.innerText = `Workspace: ${activeWs.nombre}`;
      }

      // 3. Get Summary (Stats)
      const { status: sStat, data: dStat } = await apiGetDashboardResumen(token, workspaceId);
      if (sStat === 200) {
        const summary = dStat.data || dStat;
        balanceVal.innerText = `$${parseFloat(summary.balance || 0).toLocaleString()}`;
        incomeVal.innerText = `$${parseFloat(summary.totalIngresos || summary.totalIncomes || 0).toLocaleString()}`;
        expenseVal.innerText = `$${parseFloat(summary.totalGastos || summary.totalExpenses || 0).toLocaleString()}`;
      }

      // 4. Get Recent Activity from Transactions
      const { status: sTrans, data: dTrans } = await apiGetTransactions(token, workspaceId);
      if (sTrans === 200) {
        const workspaceTrans = dTrans.data || dTrans || [];
        // Sort by date descending
        if (Array.isArray(workspaceTrans)) {
          workspaceTrans.sort((a, b) => new Date(b.fecha || b.date) - new Date(a.fecha || a.date));
          renderRecentActivity(workspaceTrans.slice(0, 5));
        }
      }
    } catch (e) {
      console.error('Error loading dashboard:', e);
      showToast('Error al actualizar el dashboard', 'error');
    }
  }

  function renderRecentActivity(transactions) {
    recentActivityList.innerHTML = '';

    if (transactions.length === 0) {
      recentActivityList.innerHTML = `
        <div class="flex flex-col items-center justify-center py-8 text-slate-600">
          <span class="text-3xl mb-2">📭</span>
          <p class="text-xs italic">Sin actividad reciente en este workspace</p>
        </div>
      `;
      return;
    }

    transactions.forEach(t => {
      const isIngreso = (t.tipo || t.type) === 'INGRESO';
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group';

      const dateStr = t.fecha || t.date || new Date().toISOString();
      const date = new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

      let emoji = isIngreso ? '💰' : '💸';
      const catName = (t.categoriaNombre || t.categoryName || '').toLowerCase();
      if (catName.includes('comida') || catName.includes('restaurante')) emoji = '🍔';
      if (catName.includes('transporte') || catName.includes('viaje')) emoji = '🚌';
      if (catName.includes('ocio') || catName.includes('juego')) emoji = '🎮';

      div.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 bg-slate-800 group-hover:bg-indigo-600 font-bold transition-all rounded-xl flex items-center justify-center text-xl">${emoji}</div>
          <div>
            <p class="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">${t.descripcion || 'Sin descripción'}</p>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">${date} • ${t.categoriaNombre || t.categoryName || 'General'}</p>
          </div>
        </div>
        <p class="${isIngreso ? 'text-emerald-400' : 'text-rose-400'} font-black text-right">
          ${isIngreso ? '+' : '-'}$${parseFloat(t.monto || t.amount || 0).toLocaleString()}
        </p>
      `;
      recentActivityList.appendChild(div);
    });
  }

  loadDashboardData();
});
