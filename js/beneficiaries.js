document.addEventListener('DOMContentLoaded', () => {
  const beneficiaryGrid = document.getElementById('beneficiaryGrid');
  const addBtn = document.querySelector('header button');
  const token = localStorage.getItem('finance_token');
  const workspaceId = localStorage.getItem('finance_workspace');

  if (!token || !workspaceId) return;

  async function loadBeneficiarios() {
    const { status, data } = await apiGetBeneficiarios(token);
    if (status === 200) {
      renderBeneficiarios(data.data || []);
    } else {
      showToast('Error al cargar beneficiarios', 'error');
    }
  }

  function renderBeneficiarios(beneficiaries) {
    beneficiaryGrid.innerHTML = '';

    const filtered = beneficiaries.filter(b => b.workspaceId == workspaceId);

    if (filtered.length === 0) {
      beneficiaryGrid.innerHTML = '<p class="text-slate-500 text-sm p-4 col-span-full text-center italic">Sin beneficiarios registrados</p>';
    }

    filtered.forEach(b => {
      const card = document.createElement('div');
      card.className = 'bg-bg-card p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all group';
      
      // Generic icon
      const icon = b.nombre.toLowerCase().includes('empresa') || b.nombre.toLowerCase().includes('banco') ? '🏢' : '👤';

      card.innerHTML = `
        <div class="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto group-hover:bg-indigo-600 group-hover:scale-110 transition-all">${icon}</div>
        <div class="text-center mb-4">
          <h3 class="font-bold text-white text-lg leading-tight">${b.nombre}</h3>
          <p class="text-xs text-slate-500">ID: ${b.id}</p>
        </div>
        <div class="flex items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <button class="p-2 hover:bg-indigo-500/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-all" title="Editar">✏️</button>
          <button class="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all" title="Eliminar">🗑️</button>
        </div>
      `;
      beneficiaryGrid.appendChild(card);
    });

    // Add back the "Nuevo Registro" button
    const addNew = document.createElement('div');
    addNew.className = 'border-2 border-dashed border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all cursor-pointer min-h-[200px]';
    addNew.innerHTML = `
      <span class="text-4xl mb-2">+</span>
      <p class="font-bold text-sm">Nuevo Registro</p>
    `;
    addNew.addEventListener('click', handleCreateBeneficiary);
    beneficiaryGrid.appendChild(addNew);
  }

  async function handleCreateBeneficiary() {
    const nombre = prompt('Nombre del beneficiario:');
    if (!nombre) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/beneficiarios`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workspaceId: parseInt(workspaceId), nombre })
      });
      const data = await response.json();
      if (response.status === 200 || response.status === 201) {
        showToast('Beneficiario creado', 'success');
        loadBeneficiarios();
      } else {
        showToast(data.mensaje || 'Error al crear', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  }

  addBtn.addEventListener('click', handleCreateBeneficiary);

  loadBeneficiarios();
});
