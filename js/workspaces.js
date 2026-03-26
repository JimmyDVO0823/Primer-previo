document.addEventListener('DOMContentLoaded', () => {
  const workspaceGrid = document.querySelector('.grid');
  const token = localStorage.getItem('finance_token');
  const activeWsId = localStorage.getItem('finance_workspace');

  if (!token) return;

  async function loadWorkspaces() {
    const { data: meData } = await apiGetMe(token);
    // Safety check: if meData.data is an object with an id, use it. Otherwise, fallback or allow undefined.
    const usuarioId = (meData.data && typeof meData.data === 'object') ? meData.data.id : 1; 

    const { status, data } = await apiGetWorkspaces(token, usuarioId);
    if (status === 200) {
      renderWorkspaces(data.data || []);
    } else {
      showToast('Error al cargar workspaces', 'error');
    }
  }

  function renderWorkspaces(workspaces) {
    // Clear the grid first
    workspaceGrid.innerHTML = '';

    workspaces.forEach(ws => {
      const isActive = activeWsId == ws.id;
      const card = document.createElement('div');
      card.className = `bg-bg-card border-2 ${isActive ? 'border-indigo-500/50' : 'border-slate-700/50'} p-6 rounded-3xl relative hover:border-indigo-500/30 transition-all cursor-pointer group`;

      card.innerHTML = `
        ${isActive ? '<div class="absolute top-4 right-4 text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full uppercase">Activo</div>' : ''}
        <div class="h-12 w-12 ${isActive ? 'bg-indigo-500/20' : 'bg-slate-800'} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-indigo-500 transition-all">
          ${ws.nombre.toLowerCase().includes('personal') ? '🏠' : '💼'}
        </div>
        <h3 class="text-xl font-bold mb-1">${ws.nombre}</h3>
        <p class="text-slate-500 text-sm mb-6">Gestiona tus finanzas en ${ws.nombre}.</p>
        <div class="flex justify-between items-center text-xs pt-4 border-t border-slate-700">
          <span class="text-slate-400">ID: ${ws.id}</span>
          <button class="select-ws-btn text-indigo-400 font-bold hover:underline" data-id="${ws.id}">
            ${isActive ? 'Seleccionado' : 'Seleccionar'}
          </button>
        </div>
      `;

      card.addEventListener('click', () => selectWorkspace(ws.id));
      workspaceGrid.appendChild(card);
    });
  }

  async function selectWorkspace(id) {
    const { status, data } = await apiSelectWorkspace(token, id);
    if (status === 200 || status === 201) {
      localStorage.setItem('finance_workspace', id);
      showToast('Workspace seleccionado', 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
    } else {
      showToast(data.mensaje || 'Error al seleccionar', 'error');
    }
  }

  loadWorkspaces();
});
