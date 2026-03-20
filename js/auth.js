document.addEventListener('DOMContentLoaded', () => {
  // === REGISTER FORM ===
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('registerBtn');
      const originalText = btn.innerText;
      btn.innerText = 'Cargando...';
      btn.disabled = true;

      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const { status, data } = await apiRegister(nombre, email, password);

      if (status === 200 || status === 201) {
        showToast('Registro exitoso', 'success');
        // Save token and navigate
        if (data && data.data && data.data.token) {
          localStorage.setItem('finance_token', data.data.token);
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          // If no token in registration response, redirect to login
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        }
      } else {
        showToast(data.mensaje || 'Error en el registro', 'error');
        btn.innerText = originalText;
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
      const originalText = btn.innerText;
      btn.innerText = 'Autenticando...';
      btn.disabled = true;

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const { status, data } = await apiLogin(email, password);

      if (status === 200) {
        showToast('Login exitoso', 'success');
        // Structure based on swagger screenshot: data.data.token
        if (data && data.data && data.data.token) {
          localStorage.setItem('finance_token', data.data.token);
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        } else {
          showToast('No se recibió token', 'error');
          btn.innerText = originalText;
          btn.disabled = false;
        }
      } else {
        showToast(data.mensaje || 'Credenciales inválidas', 'error');
        btn.innerText = originalText;
        btn.disabled = false;
      }
    });
  }

  // === DASHBOARD (index.html) LOGIC ===
  const meContainer = document.getElementById('meContainer');
  if (meContainer) {
    const token = localStorage.getItem('finance_token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    async function loadMeData() {
      const { status, data } = await apiGetMe(token);
      if (status === 200) {
        // According to swagger, data.data is string, but probably returns user info
        const displayData = data && data.data ? JSON.stringify(data.data, null, 2) : 'Usuario autenticado correctamente';
        document.getElementById('welcomeMsg').innerText = `¡Bienvenido!`;
        document.getElementById('userData').innerText = displayData;
      } else {
        showToast('Sesión expirada', 'error');
        localStorage.removeItem('finance_token');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      }
    }

    loadMeData();

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('finance_token');
        window.location.href = 'login.html';
      });
    }
  }
});
