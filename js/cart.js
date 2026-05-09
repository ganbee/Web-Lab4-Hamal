window.finalCart = JSON.parse(localStorage.getItem('mySavedCart')) || [];

function initCartLogic() {
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('cart-dropdown')?.classList.toggle('active');
        };
    }

    // ЛОГІКА ДЛЯ КНОПКИ ОФОРМЛЕННЯ
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (window.finalCart.length === 0) return; 

            // Перевірка на авторизованого користувач 
            const token = localStorage.getItem("token");
            if (!token) {
                alert('Увага! Оформлювати замовлення можуть лише авторизовані користувачі. Будь ласка, увійдіть в акаунт або зареєструйтесь.');
                
                document.getElementById('cart-dropdown')?.classList.remove('active');
                
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'flex';
                }
                return; 
            }

            alert('Дякуємо за замовлення! Наш менеджер зв\'яжеться з вами найближчим часом.');
            
            window.finalCart = [];
            localStorage.removeItem('mySavedCart');
            
            refreshCartView();
            document.getElementById('cart-dropdown')?.classList.remove('active');
        };
    }

    refreshCartView();
}

window.forceAddToCart = function(id, title, price, image) {

    const existingIndex = window.finalCart.findIndex(i => String(i.id) === String(id));

    if (existingIndex !== -1) {
        window.finalCart[existingIndex].quantity += 1;
    } else {
        window.finalCart.push({
            id: String(id),
            title: String(title),
            price: Number(price),
            image: String(image),
            quantity: 1
        });
    }

    localStorage.setItem('mySavedCart', JSON.stringify(window.finalCart));
    
    refreshCartView();
}

function refreshCartView() {
    const list = document.getElementById('cart-items-list');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total-price');
    const emptyMsg = document.getElementById('empty-cart-msg'); 
    const cartFooter = document.getElementById('cart-footer'); 

    const totalItems = window.finalCart.reduce((s, i) => s + i.quantity, 0);
    if (count) count.innerText = totalItems;
    
    const totalPrice = window.finalCart.reduce((s, i) => s + (i.price * i.quantity), 0);
    if (total) total.innerText = totalPrice;

    if (!list) return;
    list.innerHTML = "";

    if (window.finalCart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    } else {
        if (emptyMsg) emptyMsg.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';
    }

    window.finalCart.forEach(item => {
        const li = document.createElement('li');
        li.style.cssText = "display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #eee; list-style:none;";
        
        li.innerHTML = `
            <img src="${item.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
            <div style="flex-grow:1;">
                <div style="font-weight:bold; font-size:14px;">${item.title}</div>
                <div style="font-size:12px; color:#555;">$${item.price}</div>
            </div>
            
            <div style="display:flex; align-items:center; gap:5px; background:#f1f1f1; border-radius:4px; padding:2px;">
                <button onclick="event.stopPropagation(); changeQty('${item.id}', -1)" style="border:none; background:none; cursor:pointer; width:20px;">-</button>
                <span style="font-size:13px; min-width:15px; text-align:center;">${item.quantity}</span>
                <button onclick="event.stopPropagation(); changeQty('${item.id}', 1)" style="border:none; background:none; cursor:pointer; width:20px;">+</button>
            </div>

            <button onclick="event.stopPropagation(); deleteFromFinalCart('${item.id}')" style="color:red; border:none; background:none; cursor:pointer; font-size:18px; margin-left:5px;">×</button>
        `;
        list.appendChild(li);
    });
}

window.changeQty = function(id, delta) {
    const item = window.finalCart.find(i => String(i.id) === String(id));
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            window.finalCart = window.finalCart.filter(i => String(i.id) !== String(id));
        }
        localStorage.setItem('mySavedCart', JSON.stringify(window.finalCart));
        refreshCartView();
    }
}

window.deleteFromFinalCart = function(id) {
    window.finalCart = window.finalCart.filter(item => String(item.id) !== String(id));
    localStorage.setItem('mySavedCart', JSON.stringify(window.finalCart));
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    } else if (typeof renderCart === 'function') {
        renderCart();
    } else {
        location.reload();
    }
};