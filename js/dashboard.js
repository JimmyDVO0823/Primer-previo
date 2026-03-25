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
    // 1. Get Me to refresh name
    const { data: userData } = await apiGetMe(token);
    if (userData && userData.data) {
      userNameHeader.innerText = userData.data.nombre;
    }

    // 2. Get Workspaces to find the name of the active one
    const { data: wsData } = await apiGetWorkspaces(token);
    const activeWs = (wsData.data || []).find(w => w.id == workspaceId);
    if (activeWs) {
      activeWorkspaceName.innerText = `Workspace: ${activeWs.nombre}`;
    }

    // 3. Get Summary (Stats)
    const { status: sStat, data: dStat } = await apiGetDashboardResumen(token);
    if (sStat === 200) {
      const summary = dStat.data || { totalIngresos: 0, totalGastos: 0, balance: 0 };
      balanceVal.innerText = `$${parseFloat(summary.balance).toLocaleString()}`;
      incomeVal.innerText = `$${parseFloat(summary.totalIngresos).toLocaleString()}`;
      expenseVal.innerText = `$${parseFloat(summary.totalGastos).toLocaleString()}`;
    }

    // 4. Get Recent Activity (from Transactions)
    const { status: sTrans, data: dTrans } = await apiGetTransactions(token);
    if (sTrans === 200) {
      const recent = (dTrans.data || []).slice(0, 5); // Take last 5
      renderRecentActivity(recent);
    }
  }

  function renderRecentActivity(transactions) {
    recentActivityList.innerHTML = '';

    if (transactions.length === 0) {
      recentActivityList.innerHTML = '<p class="text-slate-500 text-xs text-center italic py-4">Sin actividad reciente</p>';
      return;
    }

    transactions.forEach(t => {
      const isIngreso = t.tipo === 'INGRESO';
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all';

      const date = new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

      let emoji = isIngreso ? '💰' : '💸';
      if (t.categoriaNombre && t.categoriaNombre.toLowerCase().includes('comida')) emoji = '🍔';

      div.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="p-2 bg-${isIngreso ? 'emerald' : 'indigo'}-500/10 rounded-xl">${emoji}</div>
          <div>
            <p class="text-sm font-bold text-white">${t.descripcion || 'Sin descripción'}</p>
            <p class="text-[10px] text-slate-500">${date} • ${t.categoriaNombre || 'General'}</p>
          </div>
        </div>
        <p class="${isIngreso ? 'text-emerald-400' : 'text-slate-200'} font-bold">
          ${isIngreso ? '+' : '-'}$${parseFloat(t.monto).toLocaleString()}
        </p>
      `;
      recentActivityList.appendChild(div);
    });
  }

  loadDashboardData();
});
