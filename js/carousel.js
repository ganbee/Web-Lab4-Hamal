let currentSlide = 0;

function renderHotDeals() {
    const track = document.getElementById('hot-deals-track');
    if (!track) return;
    track.innerHTML = hotDealsData.map(deal => `
        <div class="hot-deal-slide">
            <img src="${deal.img}" alt="${deal.title}">
            <div class="hot-deal-info">
                <h3>${deal.title}</h3>
                <p class="hot-deal-price">від $${deal.price}</p>
            </div>
        </div>
    `).join('');
}

function moveSlide(direction) {
    const track = document.getElementById('hot-deals-track');
    if (!track) return;
    currentSlide = (currentSlide + direction + hotDealsData.length) % hotDealsData.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function initCarouselEvents() {
    const nextBtn = document.getElementById('next-deal');
    const prevBtn = document.getElementById('prev-deal');
    if (nextBtn) nextBtn.onclick = () => moveSlide(1);
    if (prevBtn) prevBtn.onclick = () => moveSlide(-1);
}