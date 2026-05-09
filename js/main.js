// 1. РЕНДЕРИНГ (НОВИНИ ТА ТУРИ)
let newsVisibleCount = 3; 
let sortedNews = [];

function renderNews() {
    const sidebarList = document.getElementById('news-sidebar-list');
    const loadMoreBtn = document.getElementById('load-more-news');
    if (!sidebarList) return;

    // Сортування від новіших до старіших
    sortedNews = [...newsData].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}:00`);
        const dateB = new Date(`${b.date}T${b.time}:00`);
        return dateB - dateA;
    });

    updateNewsSidebar();

    // Логіка кнопки "Більше"
    if (loadMoreBtn) {
        loadMoreBtn.onclick = () => {
            newsVisibleCount += 2; 
            updateNewsSidebar();
        };
    }
}

function updateNewsSidebar() {
    const sidebarList = document.getElementById('news-sidebar-list');
    const loadMoreBtn = document.getElementById('load-more-news');
    
    sidebarList.innerHTML = ''; 
    
    const visibleNews = sortedNews.slice(0, newsVisibleCount);
    
    visibleNews.forEach((item) => {
        const li = document.createElement('li');
        li.className = `sidebar-news-item status-${item.status}`;
        // Важливі - жирним
        if(item.status === 'very-important' || item.status === 'important') {
            li.style.fontWeight = 'bold';
        }
        
        li.innerHTML = `
            <div class="news-title">${item.title}</div>
            <div class="news-datetime">${item.date} о ${item.time}</div>
        `;
        
        li.onclick = () => showNewsDetails(item, li);
        sidebarList.appendChild(li);
    });

    if (newsVisibleCount >= sortedNews.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

function showNewsDetails(item, liElement) {
    document.querySelectorAll('.sidebar-news-item').forEach(el => el.classList.remove('active-news'));

    if (liElement) liElement.classList.add('active-news');

    const display = document.getElementById('news-central-display');
    if (!display) return;

    display.innerHTML = `
        <h3>${item.title}</h3>
        <div class="news-meta" style="color: var(--orange); font-size: 14px; margin-bottom: 15px;">
            ${item.date} о ${item.time}
        </div>
        <p style="font-size: 18px; margin-bottom: 15px; color: var(--dark);"><strong>${item.content}</strong></p>
        <p>${item.fullDescription}</p>
    `;
    
    if (window.innerWidth <= 768) {
        display.scrollIntoView({ behavior: 'smooth' });
    }
}

// посилання на MockAPI 
const TOURS_URL = 'https://69fa4145c509a40d3aa41cd3.mockapi.io/tours';

let currentTours = [];
async function fetchDestinationsFromServer() {
    try {
        const response = await fetch('https://69fa4145c509a40d3aa41cd3.mockapi.io/tours');
        const data = await response.json();
        
        window.serverTours = data; 
        
        renderDestinations(data); 

        if (localStorage.getItem("isAdmin") === "true") {
            renderChart('bar');
        }
    } catch (error) {
        console.error('Помилка завантаження турів:', error);
    }
}

function renderDestinations(data) {
    const grid = document.getElementById('destinations-grid');
    if (!grid) return;
    
    // Перевірка на адміна
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    
    // Кнопка додавання (тільки для адміна)
    const addBtnHtml = isAdmin 
        ? `<div style="width: 100%; text-align: center; margin-bottom: 20px; grid-column: 1 / -1;">
             <button onclick="window.openAddTourModal()" style="background: #27ae60; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 18px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);">
               ➕ Додати новий тур
             </button>
           </div>`
        : '';

    const cardsHtml = data.map(item => {
        const realId = item.id || item._id;
        const cleanTitle = item.title.replace(/'/g, "\\'"); 
        
        
       // Кнопки редагування (тільки для адміна)
       // Кнопка видалення (тільки для адміна)
       const adminControlsHtml = isAdmin 
       ? `<div style="display: flex; gap: 10px; margin-top: 10px;">
           <button class="edit-btn" style="flex: 1; background: #f39c12; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 600;" 
               onclick="event.stopPropagation(); window.openEditTourModal('${realId}')">
               ✏️ Редагувати
           </button>
           <button class="delete-btn" style="flex: 1; background: #e74c3c; color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: 600;" 
               onclick="event.stopPropagation(); window.deleteDestination('${realId}')">
               🗑 Видалити
           </button>
          </div>` 
       : '';

        return `
        <div class="destination-card" onclick="this.classList.toggle('active')">
            <img src="${item.image}" alt="${item.title}">
            <div class="card-info">
                <h4>${item.title} <span>$${item.price}</span></h4>
                <p>${item.description}</p> 
                
                <div class="card-desc-full">
                    <hr>
                    <p>${item.details || 'Деталі туру уточнюйте у менеджера.'}</p>
                </div>

                <button class="add-to-cart" 
                    onclick="event.stopPropagation(); window.forceAddToCart('${realId}', '${cleanTitle}', ${item.price}, '${item.image}')">
                    Додати в кошик
                </button>
                
                ${adminControlsHtml}
            </div>
        </div>
    `}).join('');

    grid.innerHTML = addBtnHtml + cardsHtml;
}

// Функція для видалення туру на сервері
window.deleteDestination = async function(id) {
    if (!confirm('Ви впевнені, що хочете назавжди видалити цей тур?')) return;

    try {
        const BASE_URL = 'https://69fa4145c509a40d3aa41cd3.mockapi.io'; 
        
        // DELETE запит
        const response = await fetch(`${BASE_URL}/tours/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Тур успішно видалено!');
            
            if (typeof fetchDestinationsFromServer === 'function') {
                fetchDestinationsFromServer();
            } else {
                location.reload(); 
            }
        } else {
            alert('Помилка при видаленні. Можливо, такого туру вже немає.');
        }
    } catch (error) {
        console.error('Помилка видалення:', error);
        alert('Помилка з\'єднання з сервером');
    }
};

// 2. ФІЛЬТРАЦІЯ ТА ПОШУК
function applyFilters() {
    const query = document.getElementById('main-search').value.toLowerCase();
    const activeBtn = document.querySelector('.filter-btn.active');
    const type = activeBtn ? activeBtn.dataset.type : 'all';
    const sort = document.getElementById('sort-select').value;

    const sourceData = (window.currentTours && window.currentTours.length > 0) 
                       ? window.currentTours 
                       : destinationsData;

    let filtered = sourceData.filter(item => 
        (type === 'all' || item.type === type) && 
        item.title.toLowerCase().includes(query)
    );

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => a.title.localeCompare(b.title));

    renderDestinations(filtered);
}

function initFilterEvents() {
    const searchInput = document.getElementById('main-search');
    const sortSelect = document.getElementById('sort-select');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (searchInput) searchInput.oninput = applyFilters;
    if (sortSelect) sortSelect.onchange = applyFilters;

    filterBtns.forEach(btn => {
        btn.onclick = () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        };
    });
}

// 3. BOM ФУНКЦІЇ (ПРОМО, СКРОЛ, ПІДПИСКА)
function showPromo() {
    const m = document.getElementById('promo-modal');
    const b = document.getElementById('close-promo');
    const t = document.getElementById('promo-timer');
    if (!m) return;

    let time = 5;
    m.style.display = 'flex';
    const timer = setInterval(() => {
        t.innerText = --time;
        if (time <= 0) { 
            clearInterval(timer); 
            b.disabled = false; 
            b.innerText = "Закрити"; 
        }
    }, 1000);
    b.onclick = () => m.style.display = 'none';
}

function initBOMEvents() {
    // Підписка
    const subBanner = document.getElementById('subscribe-banner');
    if (!localStorage.getItem('sub') && subBanner) {
        setTimeout(() => subBanner.style.display = 'block', 2000);
    }

    document.getElementById('sub-accept').onclick = () => { 
        localStorage.setItem('sub', '1'); 
        subBanner.style.display = 'none'; 
    };
    document.getElementById('sub-reject').onclick = () => {
        subBanner.style.display = 'none';
    };

    // Кнопка вгору
    window.onscroll = () => {
        const s = document.documentElement;
        const btt = document.getElementById('backToTop');
        if (btt) {
            btt.style.display = (s.scrollTop > (s.scrollHeight - s.clientHeight) * 0.6) ? 'block' : 'none';
        }
    };
    document.getElementById('backToTop').onclick = () => window.scrollTo({top:0, behavior:'smooth'});
    
    // Таймер промо
    setTimeout(showPromo, 3000);
}

// ===== ГРАФІКИ =====
function initCharts() {
    const select = document.getElementById('chart-type-select');
    if (select) {
        select.addEventListener('change', (e) => {
            renderChart(e.target.value);
        });
        renderChart('pie');
    }
}

// АНАЛІТИКА (CHART.JS) - ТІЛЬКИ ДЛЯ АДМІНА
let myChart;

window.renderChart = function(type) { 
    const ctx = document.getElementById('myChart');
    if (!ctx) return;

    if (myChart) {
        myChart.destroy(); 
    }

    const dataToUse = window.serverTours || [];

    if (dataToUse.length === 0) {
        console.log("Дані для графіку ще не завантажились або порожні.");
        return; 
    }

    let chartData = {};
    let chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' }
        }
    };

    if (type === 'bar') {
        chartData = {
            labels: dataToUse.map(item => item.title.split(',')[0]), 
            datasets: [{
                label: 'Вартість туру ($)',
                data: dataToUse.map(item => item.price),
                backgroundColor: '#DF6951',
                borderRadius: 5 
            }]
        };
    } else if (type === 'line') {
        const popularityData = dataToUse.map(item => (item.price % 50) + 10);
        chartData = {
            labels: dataToUse.map(item => item.title.split(',')[0]),
            datasets: [{
                label: 'Кількість бронювань (Популярність)',
                data: popularityData,
                borderColor: '#181E4B',
                backgroundColor: 'rgba(24, 30, 75, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4 
            }]
        };
    } else if (type === 'pie') {
        // Кругова діаграма 
        chartData = {
            labels: dataToUse.map(item => item.title.split(',')[0]),
            datasets: [{
                label: 'Вартість',
                data: dataToUse.map(item => item.price),
                backgroundColor: [
                    '#DF6951', '#181E4B', '#F1A501', '#5E6282', '#008080', '#E2B887', '#FF6347'
                ],
                hoverOffset: 10 
            }]
        };
    }

    myChart = new Chart(ctx, {
        type: type,
        data: chartData,
        options: chartOptions
    });
}

// 4. ГОЛОВНИЙ ЗАПУСК 
window.onload = () => {
    renderNews();
    fetchDestinationsFromServer();
    renderHotDeals(); 

    initCarouselEvents(); 
    initCartLogic();      
    initAuthEvents();     

    // перевірка прав для аналітики
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const analyticsSection = document.getElementById('analytics');
    const analyticsNav = document.querySelector('a[href="#analytics"]');

    if (isAdmin) {
        if (analyticsSection) analyticsSection.style.display = 'block';
        if (analyticsNav) analyticsNav.parentElement.style.display = 'block';
        renderChart('bar');
    } else {
        if (analyticsSection) analyticsSection.style.display = 'none';
        if (analyticsNav) analyticsNav.parentElement.style.display = 'none';
    }
};

    window.addEventListener('click', () => {
        const dropdown = document.getElementById('cart-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    });


// ДОДАВАННЯ ТУРУ (Модальне вікно та POST запит)
window.openAddTourModal = function() {
    if (!document.getElementById('addTourModal')) {
        const modalHtml = `
        <div id="addTourModal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
            <div style="background: white; padding: 30px; border-radius: 15px; width: 400px; max-width: 90%; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('addTourModal').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 20px; cursor: pointer; color: #555;">✖</button>
                <h2 style="margin-bottom: 20px; color: #181E4B; text-align: center;">Додати новий тур</h2>
                
                <form id="add-tour-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="text" id="new-tour-title" placeholder="Назва (напр. Київ, Україна)" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Poppins', sans-serif;">
                    <input type="number" id="new-tour-price" placeholder="Ціна ($)" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Poppins', sans-serif;">
                    <input type="text" id="new-tour-image" placeholder="Посилання на фото (URL)" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Poppins', sans-serif;">
                    <textarea id="new-tour-desc" placeholder="Короткий опис" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; font-family: 'Poppins', sans-serif;"></textarea>
                    <textarea id="new-tour-details" placeholder="Деталі туру" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; font-family: 'Poppins', sans-serif; height: 100px;"></textarea>
                    
                    <button type="submit" style="padding: 14px; background: #DF6951; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 5px;">Зберегти тур на сервері</button>
                </form>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Обробка відправки форми (POST запит)
        document.getElementById('add-tour-form').onsubmit = async (e) => {
            e.preventDefault(); 
            
            const newTour = {
                title: document.getElementById('new-tour-title').value,
                price: Number(document.getElementById('new-tour-price').value),
                image: document.getElementById('new-tour-image').value,
                description: document.getElementById('new-tour-desc').value,
                details: document.getElementById('new-tour-details').value,
                type: "custom"
            };

            try {
                // Відправка даних на MockAPI
                const response = await fetch('https://69fa4145c509a40d3aa41cd3.mockapi.io/tours', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTour) 
                });

                if (response.ok) {
                    alert('Супер! Тур успішно додано!');
                    document.getElementById('addTourModal').style.display = 'none'; 
                    document.getElementById('add-tour-form').reset(); 
                    
                    if (typeof fetchDestinationsFromServer === 'function') {
                        fetchDestinationsFromServer(); 
                    } else {
                        location.reload();
                    }
                } else {
                    alert('Помилка при збереженні туру.');
                }
            } catch (err) {
                console.error(err);
                alert('Помилка з\'єднання з сервером');
            }
        };
    } else {
        document.getElementById('addTourModal').style.display = 'flex';
    }
};

// РЕДАГУВАННЯ ТУРУ 
window.openEditTourModal = async function(id) {
    try {
        const response = await fetch(`https://69fa4145c509a40d3aa41cd3.mockapi.io/tours/${id}`);
        const tour = await response.json();

        if (!document.getElementById('editTourModal')) {
            const modalHtml = `
            <div id="editTourModal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
                <div style="background: white; padding: 30px; border-radius: 15px; width: 400px; max-width: 90%; position: relative;">
                    <button onclick="document.getElementById('editTourModal').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 20px; cursor: pointer;">✖</button>
                    <h2 style="margin-bottom: 20px; color: #181E4B; text-align: center;">Редагувати тур</h2>
                    
                    <form id="edit-tour-form" style="display: flex; flex-direction: column; gap: 15px;">
                        <input type="hidden" id="edit-tour-id">
                        <input type="text" id="edit-tour-title" placeholder="Назва" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                        <input type="number" id="edit-tour-price" placeholder="Ціна" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                        <input type="text" id="edit-tour-image" placeholder="URL фото" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                        <textarea id="edit-tour-desc" placeholder="Опис" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;"></textarea>
                        <textarea id="edit-tour-details" placeholder="Деталі" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; height: 80px;"></textarea>
                        
                        <button type="submit" style="padding: 14px; background: #f39c12; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Зберегти зміни</button>
                    </form>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            document.getElementById('edit-tour-form').onsubmit = window.saveTourChanges;
        }

        document.getElementById('edit-tour-id').value = tour.id;
        document.getElementById('edit-tour-title').value = tour.title;
        document.getElementById('edit-tour-price').value = tour.price;
        document.getElementById('edit-tour-image').value = tour.image;
        document.getElementById('edit-tour-desc').value = tour.description;
        document.getElementById('edit-tour-details').value = tour.details;

        document.getElementById('editTourModal').style.display = 'flex';
    } catch (err) {
        console.error(err);
        alert("Не вдалося завантажити дані туру");
    }
};

// Відправка PUT запиту на сервер
window.saveTourChanges = async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit-tour-id').value;
    const updatedTour = {
        title: document.getElementById('edit-tour-title').value,
        price: Number(document.getElementById('edit-tour-price').value),
        image: document.getElementById('edit-tour-image').value,
        description: document.getElementById('edit-tour-desc').value,
        details: document.getElementById('edit-tour-details').value
    };

    try {
        const response = await fetch(`https://69fa4145c509a40d3aa41cd3.mockapi.io/tours/${id}`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTour)
        });

        if (response.ok) {
            alert('Зміни збережено!');
            document.getElementById('editTourModal').style.display = 'none';
            fetchDestinationsFromServer(); 
        } else {
            alert('Помилка при оновленні.');
        }
    } catch (err) {
        console.error(err);
        alert('Помилка мережі');
    }
};