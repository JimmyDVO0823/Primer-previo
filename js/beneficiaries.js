document.addEventListener('DOMContentLoaded', () => {
  const beneficiaryGrid = document.getElementById('beneficiaryGrid');
  const addBtn = document.querySelector('header button');
  const token = localStorage.getItem('finance_token');
  const workspaceId = localStorage.getItem('finance_workspace');

  if (!token || !workspaceId) return;

  async function loadBeneficiarios() {
    const { status, data } = await apiGetBeneficiarios(token, workspaceId);
    if (status === 200) {
      // The API already filters by workspaceId via query parameter.
      renderBeneficiarios(data.data || []);
    } else {
      showToast('Error al cargar beneficiarios', 'error');
    }
  }

  function renderBeneficiarios(beneficiaries) {
    beneficiaryGrid.innerHTML = '';

    if (beneficiaries.length === 0) {
      beneficiaryGrid.innerHTML = '<div class="col-span-full border-2 border-dashed border-slate-800 p-12 rounded-3xl text-center"><p class="text-slate-500 italic">No hay beneficiarios en este workspace</p></div>';
    }

    beneficiaries.forEach(b => {
      const card = document.createElement('div');
      const name = b.nombre || b.name || 'Sin nombre';
      card.className = 'bg-bg-card p-6 rounded-3xl border-2 border-slate-800/50 hover:border-indigo-500/30 transition-all group relative';
      
      const icon = name.toLowerCase().includes('empresa') || name.toLowerCase().includes('banco') ? '🏢' : '👤';

      card.innerHTML = `
        <div class="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto group-hover:bg-indigo-600 transition-all group-hover:scale-105 shadow-lg">${icon}</div>
        <div class="text-center mb-6">
          <h3 class="font-bold text-white text-lg tracking-tight">${name}</h3>
          <p class="text-[10px] text-slate-500 font-bold uppercase mt-1">ID: ${b.id}</p>
        </div>
        <div class="flex items-center justify-center gap-2 pt-4 border-t border-slate-800/50">
          <button class="flex-1 py-2 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-400 transition-all font-bold text-xs flex items-center justify-center gap-2 delete-btn">
            <span>🗑️</span> Eliminar
          </button>
        </div>
      `;

      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteBeneficiary(b.id);
      });

      beneficiaryGrid.appendChild(card);
    });

    const addNew = document.createElement('div');
    addNew.className = 'border-2 border-dashed border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all cursor-pointer min-h-[200px] group';
    addNew.innerHTML = `
      <div class="h-12 w-12 bg-slate-800/50 rounded-xl flex items-center justify-center text-2xl mb-2 group-hover:bg-indigo-500/20 transition-all">+</div>
      <p class="font-bold text-sm tracking-wide">Nuevo Beneficiario</p>
    `;
    addNew.addEventListener('click', handleCreateBeneficiary);
    beneficiaryGrid.appendChild(addNew);
  }

  async function handleDeleteBeneficiary(id) {
    if (!confirm('¿Seguro que deseas eliminar este beneficiario?')) return;
    const { status, data } = await apiDeleteBeneficiario(token, id);
    if (status === 200 || status === 204) {
      showToast('Beneficiario eliminado');
      loadBeneficiarios();
    } else {
      showToast(data.mensaje || 'Error al eliminar', 'error');
    }
  }

  async function handleCreateBeneficiary() {
    const nombre = prompt('Nombre del nuevo beneficiario:');
    if (!nombre) return;
    
    const { status, data } = await apiCreateBeneficiario(token, workspaceId, nombre);
    if (status === 200 || status === 201) {
      showToast('Beneficiario guardado con éxito', 'success');
      loadBeneficiarios();
    } else {
      showToast(data.mensaje || 'Error al crear', 'error');
    }
  }

  addBtn.addEventListener('click', handleCreateBeneficiary);

  loadBeneficiarios();
});
