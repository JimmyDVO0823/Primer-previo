// Configurable API Base URL
const API_BASE_URL = 'https://finanzas-api.ubunifusoft.digital/api';

/**
 * Registra un nuevo usuario consumiendo POST /api/auth/registro
 */
async function apiRegister(nombre, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Error in apiRegister:', error);
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

/**
 * Inicia sesión consumiendo POST /api/auth/login
 */
async function apiLogin(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Error in apiLogin:', error);
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

/**
 * Obtiene la información del usuario logueado GET /api/auth/me
 */
async function apiGetMe(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Error in apiGetMe:', error);
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

// === WORKSPACES ===

async function apiGetWorkspaces(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

async function apiSelectWorkspace(token, workspaceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/seleccionar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

// === CATEGORIAS ===

async function apiGetCategorias(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

async function apiCreateCategoria(token, workspaceId, nombre, tipo) {
  try {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workspaceId: parseInt(workspaceId), name: nombre, type: tipo })
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

// === TRANSACCIONES ===

async function apiGetTransactions(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

async function apiCreateTransaction(token, body) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

// === BENEFICIARIOS ===

async function apiGetBeneficiarios(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/beneficiarios`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

// === DASHBOARD ===

async function apiGetDashboardResumen(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/resumen-mensual`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { mensaje: 'Error de red' } };
  }
}

// Global utility for showing modern toasts
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
}

