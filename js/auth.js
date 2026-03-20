document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('finance_token');
  const path = window.location.pathname;
  const isAuthPage = path.includes('login.html') || path.includes('register.html');

  // === SESSION CHECK (GLOBAL) ===
  async function checkSession() {
    if (!token) {
      if (!isAuthPage) window.location.href = 'login.html';
      return null;
    }

    const { status, data } = await apiGetMe(token);
    if (status !== 200) {
      localStorage.removeItem('finance_token');
      localStorage.removeItem('finance_workspace');
      if (!isAuthPage) window.location.href = 'login.html';
      return null;
    }

    // Update UI with user info if welcomeMsg exists
    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) {
      const name = data.data && data.data.nombre ? data.data.nombre : 'Usuario';
      welcomeMsg.innerHTML = `Hola, <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">${name}</span>`;
    }
    
    return data.data;
  }

  const user = await checkSession();

  // === WORKSPACE CONTEXT CHECK ===
  const activeWorkspace = localStorage.getItem('finance_workspace');
  if (user && !activeWorkspace && !path.includes('workspaces.html') && !isAuthPage) {
    // If authenticated but no workspace selected, force selection
    showToast('Por favor, selecciona un espacio de trabajo', 'info');
    setTimeout(() => {
      window.location.href = 'workspaces.html';
    }, 1000);
  }

  // === REGISTER FORM ===
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerBtn');
      const originalText = btn.innerHTML;
      btn.innerText = 'Cargando...';
      btn.disabled = true;

      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const { status, data } = await apiRegister(nombre, email, password);
      if (status === 200 || status === 201) {
        showToast('¡Registro exitoso!', 'success');
        if (data.data && data.data.token) {
          localStorage.setItem('finance_token', data.data.token);
          setTimeout(() => window.location.href = 'workspaces.html', 1500);
        } else {
          setTimeout(() => window.location.href = 'login.html', 1500);
        }
      } else {
        showToast(data.mensaje || 'Error en el registro', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }

  // === LOGIN FORM ===
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const originalText = btn.innerHTML;
      btn.innerText = 'Autenticando...';
      btn.disabled = true;

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const { status, data } = await apiLogin(email, password);
      if (status === 200) {
        showToast('Sesión iniciada', 'success');
        if (data.data && data.data.token) {
          localStorage.setItem('finance_token', data.data.token);
          setTimeout(() => window.location.href = 'workspaces.html', 1000);
        }
      } else {
        showToast(data.mensaje || 'Credenciales inválidas', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }

  // === LOGOUT LOGIC ===
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('finance_token');
      localStorage.removeItem('finance_workspace');
      window.location.href = 'login.html';
    });
  }
});

