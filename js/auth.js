// посилання на MockAPI
const BASE_URL = 'https://69fa4145c509a40d3aa41cd3.mockapi.io';
let token = localStorage.getItem("token") || "";

function initAuthEvents() {
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModal');
    const loginTab = document.getElementById('btn-login-tab');
    const regTab = document.getElementById('btn-reg-tab');
    
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const authTitle = document.getElementById('auth-title');

    if (closeModalBtn) closeModalBtn.onclick = () => loginModal.style.display = 'none';

    // Вхід
    if (loginTab) {
        loginTab.onclick = () => {
            loginTab.classList.add('active');
            regTab.classList.remove('active');
            loginForm.style.display = 'flex';
            regForm.style.display = 'none';
            authTitle.innerText = 'Увійдіть в акаунт';
        };
    }

    // Реєстрація
    if (regTab) {
        regTab.onclick = () => {
            regTab.classList.add('active');
            loginTab.classList.remove('active');
            regForm.style.display = 'flex';
            loginForm.style.display = 'none';
            authTitle.innerText = 'Створіть акаунт';
        };
    }

    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault(); 
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            loginUser(email, password); 
        };
    }

    checkAuthStatus();
}

    // 1. ОБРОБКА РЕЄСТРАЦІЇ 
    if (regForm) {
        regForm.onsubmit = async (e) => {
            e.preventDefault();
            
            document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

            const name = regForm.querySelector('input[type="text"]').value.trim();
            const email = regForm.querySelector('input[type="email"]').value.trim();
            const password = regForm.querySelectorAll('input[type="password"]')[0].value;
            const confirmPassword = regForm.querySelectorAll('input[type="password"]')[1].value;

            let hasError = false;

            // Перевірка імені 
            if (name.length < 2) {
                showError('reg-name-error', 'Ім\'я має містити щонайменше 2 літери');
                hasError = true;
            }

            // Перевірка пароля 
            if (password.length < 6) {
                showError('reg-password-error', 'Пароль має містити не менше 6 символів');
                hasError = true;
            }

            // Перевірка на збіг паролів
            if (password !== confirmPassword) {
                showError('reg-confirm-error', 'Паролі не збігаються');
                hasError = true;
            }

            if (hasError) return; 

            await registerUser(email, password);
        };
    }

    // 2. ОБРОБКА ЛОГІНУ
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            await loginUser(email, password);
        };
    }


function showError(elementId, message) {
    const errEl = document.getElementById(elementId);
    if (errEl) {
        errEl.innerText = message;
        errEl.style.display = 'block';
    }
}

// ФУНКЦІЇ РОБОТИ З MOCKAPI

async function registerUser(email, password) {
    try {
        const checkRes = await fetch(`${BASE_URL}/users?username=${email}`);
        const existing = await checkRes.json();
        
        if (existing.length > 0) {
            alert("Цей Email вже зареєстровано!");
            return;
        }

        const response = await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password: password })
        });

        if (response.ok) {
            alert("Реєстрація успішна! Ви можете увійти.");
            document.getElementById('btn-login-tab').click(); 
        }
    } catch (error) {
        console.error("Помилка реєстрації:", error);
        alert("Помилка мережі");
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch(`${BASE_URL}/users?username=${email}&password=${password}`);
        const users = await response.json();

        if (users.length > 0) {
            const user = users[0];
            token = "mock-token-for-" + user.id;
            localStorage.setItem("token", token);
            
            // ПЕРЕВІРКА НА АДМІНА
            if (email === 'admin@jadoo.com') {
                localStorage.setItem("isAdmin", "true");
            } else {
                localStorage.removeItem("isAdmin");
            }
            
            alert("Ви успішно увійшли!");
            document.getElementById('loginModal').style.display = 'none';
            
            location.reload(); 
        } else {
            alert("Неправильний логін або пароль");
        }
    } catch (err) {
        console.error("Помилка логіну:", err);
        alert("Помилка з'єднання");
    }
}



function checkAuthStatus() {
    const openAuthBtn = document.getElementById('open-auth'); 
    
    if (!openAuthBtn) return; 

    if (token) {
        openAuthBtn.innerText = "Вийти"; 
        openAuthBtn.onclick = (e) => {
            e.preventDefault(); 
            
            token = "";
            localStorage.removeItem("token");
            localStorage.removeItem("isAdmin"); 
            
            alert("Ви успішно вийшли з системи!");
            
            location.reload(); 
        };
    } else {
        openAuthBtn.innerText = "Увійти"; 
        openAuthBtn.onclick = (e) => {
            e.preventDefault();
            document.getElementById('loginModal').style.display = 'flex';
        };
    }
}