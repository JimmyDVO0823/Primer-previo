document.addEventListener('DOMContentLoaded', () => {
  const incomeGrid = document.getElementById('incomeGrid');
  const expenseGrid = document.getElementById('expenseGrid');
  const addBtn = document.querySelector('header button');
  const token = localStorage.getItem('finance_token');
  const workspaceId = localStorage.getItem('finance_workspace');

  if (!token || !workspaceId) return;

  async function loadCategorias() {
    const { status, data } = await apiGetCategorias(token);
    if (status === 200) {
      // API may return all, filter by current workspace if needed
      // (Assuming API does basic filtering, but let's be safe)
      const all = data.data || [];
      const workspaceCategories = all.filter(c => c.workspaceId == workspaceId);
      renderCategorias(workspaceCategories);
    } else {
      showToast('Error al cargar categorías', 'error');
    }
  }

  function renderCategorias(categories) {
    incomeGrid.innerHTML = '';
    expenseGrid.innerHTML = '';

    const incomes = categories.filter(c => c.tipo === 'INGRESO');
    const expenses = categories.filter(c => c.tipo === 'GASTO');

    if (incomes.length === 0) {
      incomeGrid.innerHTML = '<p class="text-slate-500 text-sm p-4">Sin categorías de ingresos</p>';
    }
    if (expenses.length === 0) {
      expenseGrid.innerHTML = '<p class="text-slate-500 text-sm p-4">Sin categorías de gastos</p>';
    }

    incomes.forEach(c => incomeGrid.appendChild(createCategoryCard(c, 'emerald')));
    expenses.forEach(c => expenseGrid.appendChild(createCategoryCard(c, 'red')));
  }

  function createCategoryCard(cat, color) {
    const div = document.createElement('div');
    div.className = `bg-bg-card p-4 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-${color}-500/50 transition-all cursor-pointer`;
    
    // Random emoji based on name or generic
    let emoji = '📁';
    const n = cat.nombre.toLowerCase();
    if (n.includes('sueldo') || n.includes('salario')) emoji = '💰';
    if (n.includes('comida') || n.includes('alimento')) emoji = '🍔';
    if (n.includes('transporte')) emoji = '🚌';
    if (n.includes('ocio') || n.includes('entrete')) emoji = '🎮';
    if (n.includes('casa') || n.includes('hogar')) emoji = '🏠';

    div.innerHTML = `
      <div class="h-10 w-10 bg-${color}-500/10 rounded-xl flex items-center justify-center text-lg">${emoji}</div>
      <span class="font-bold flex-1">${cat.nombre}</span>
      <span class="text-xs text-slate-500">Workspace: ${cat.workspaceId}</span>
    `;
    return div;
  }

  async function handleCreateCategory() {
    const nombre = prompt('Nombre de la categoría:');
    if (!nombre) return;
    const tipo = confirm('¿Es de INGRESO? (OK para Ingreso, Cancelar para Gasto)') ? 'INGRESO' : 'GASTO';

    const { status, data } = await apiCreateCategoria(token, workspaceId, nombre, tipo);
    if (status === 200 || status === 201) {
      showToast('Categoría creada', 'success');
      loadCategorias();
    } else {
      showToast(data.mensaje || 'Error al crear categoría', 'error');
    }
  }

  addBtn.addEventListener('click', handleCreateCategory);

  loadCategorias();
});
