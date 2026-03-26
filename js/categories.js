document.addEventListener('DOMContentLoaded', () => {
  const incomeGrid = document.getElementById('incomeGrid');
  const expenseGrid = document.getElementById('expenseGrid');
  const addBtn = document.querySelector('header button');
  const token = localStorage.getItem('finance_token');
  const workspaceId = localStorage.getItem('finance_workspace');

  if (!token || !workspaceId) return;

  async function loadCategorias() {
    const { status, data } = await apiGetCategorias(token, workspaceId);
    if (status === 200) {
      // The API already filters by workspaceId via query parameter.
      // Since the API response doesn't include workspaceId field in the list,
      // we display all items returned by the server for this context.
      renderCategorias(data.data || []);
    } else {
      showToast('Error al cargar categorías', 'error');
    }
  }

  function renderCategorias(categories) {
    incomeGrid.innerHTML = '';
    expenseGrid.innerHTML = '';

    const incomes = categories.filter(c => (c.tipo || c.type) === 'INGRESO');
    const expenses = categories.filter(c => (c.tipo || c.type) === 'GASTO');

    if (incomes.length === 0) {
      incomeGrid.innerHTML = '<div class="col-span-full bg-slate-800/20 border border-dashed border-slate-700 p-8 rounded-3xl text-center"><p class="text-slate-500 italic">No hay categorías de ingresos configuradas</p></div>';
    }
    if (expenses.length === 0) {
      expenseGrid.innerHTML = '<div class="col-span-full bg-slate-800/20 border border-dashed border-slate-700 p-8 rounded-3xl text-center"><p class="text-slate-500 italic">No hay categorías de gastos configuradas</p></div>';
    }

    incomes.forEach(c => incomeGrid.appendChild(createCategoryCard(c, 'emerald')));
    expenses.forEach(c => expenseGrid.appendChild(createCategoryCard(c, 'red')));
  }

  function createCategoryCard(cat, color) {
    const div = document.createElement('div');
    const name = cat.nombre || cat.name || 'Sin nombre';
    div.className = `bg-bg-card p-5 rounded-3xl border-2 border-slate-800/50 flex items-center gap-4 hover:border-${color}-500/30 transition-all cursor-pointer group`;
    
    let emoji = '📁';
    const n = name.toLowerCase();
    if (n.includes('sueldo') || n.includes('salario') || n.includes('venta')) emoji = '💰';
    if (n.includes('comida') || n.includes('alimento') || n.includes('restaurante')) emoji = '🍔';
    if (n.includes('transporte') || n.includes('gasolina') || n.includes('uber')) emoji = '🚌';
    if (n.includes('ocio') || n.includes('entrete') || n.includes('cine')) emoji = '🎮';
    if (n.includes('casa') || n.includes('hogar') || n.includes('renta')) emoji = '🏠';
    if (n.includes('salud') || n.includes('farmacia')) emoji = '💊';

    div.innerHTML = `
      <div class="h-12 w-12 bg-slate-800 group-hover:bg-${color}-500 transition-all rounded-2xl flex items-center justify-center text-2xl">${emoji}</div>
      <div class="flex-1">
        <h4 class="font-bold text-white group-hover:text-${color}-400 transition-colors">${name}</h4>
        <span class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">ID: ${cat.id}</span>
      </div>
    `;
    return div;
  }

  async function handleCreateCategory() {
    const nombre = prompt('Nombre de la nueva categoría:');
    if (!nombre) return;
    const tipo = confirm('¿Es de INGRESO?\n\nOK = INGRESO\nCancelar = GASTO') ? 'INGRESO' : 'GASTO';

    const { status, data } = await apiCreateCategoria(token, workspaceId, nombre, tipo);
    if (status === 200 || status === 201) {
      showToast('Categoría creada con éxito', 'success');
      loadCategorias();
    } else {
      showToast(data.mensaje || 'Error al crear categoría', 'error');
    }
  }

  addBtn.addEventListener('click', handleCreateCategory);

  loadCategorias();
});
