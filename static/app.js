/* ═══════════════════════════════════════════════════
   SHOESYNC — FRONTEND ENGINE v3
   Mouse Parallax + Cinematic Interactions
   ═══════════════════════════════════════════════════ */

// ── Cursor Glow ──
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

// ── Particle System (magenta/purple/orange) ──
const cvs = document.getElementById('particle-canvas');
const ctx = cvs.getContext('2d');
let pts = [];
function resize() { cvs.width = innerWidth; cvs.height = innerHeight; }
resize();
addEventListener('resize', resize);

const COLORS = ['rgba(232,64,160,', 'rgba(147,51,234,', 'rgba(249,115,22,'];
class P {
    constructor() { this.init(); }
    init() {
        this.x = Math.random() * cvs.width;
        this.y = Math.random() * cvs.height;
        this.r = Math.random() * 1.2 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.o = Math.random() * 0.3 + 0.05;
        this.c = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > cvs.width || this.y < 0 || this.y > cvs.height) this.init();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + this.o + ')';
        ctx.fill();
    }
}
for (let i = 0; i < 40; i++) pts.push(new P());
(function loop() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    pts.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
})();

// ── Mouse Parallax for Floating Sneakers ──
let mouseX = 0, mouseY = 0;
let smoothX = 0, smoothY = 0;
const shoes = document.querySelectorAll('.scene-shoe');

document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function updateParallax() {
    smoothX += (mouseX - smoothX) * 0.04;
    smoothY += (mouseY - smoothY) * 0.04;

    shoes.forEach(shoe => {
        const speed = parseFloat(shoe.dataset.speed) || 0.03;
        shoe.style.translate = `${smoothX * speed * 800}px ${smoothY * speed * 400}px`;
    });

    requestAnimationFrame(updateParallax);
}
updateParallax();

// ── 3D Card Tilt (event delegation — only on hovered card) ──
document.getElementById('results').addEventListener('mousemove', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / r.width;
    const dy = (e.clientY - r.top - r.height / 2) / r.height;
    card.style.transform = `translateY(-6px) scale(1.01) perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
}, { passive: true });

document.getElementById('results').addEventListener('mouseleave', e => {
    const card = e.target.closest('.card');
    if (card) card.style.transform = '';
}, { passive: true });



let activeTimeouts = [];

function activateNodes() {
    activeTimeouts.push(setTimeout(() => document.getElementById('node-center').classList.add('active'), 200));
    activeTimeouts.push(setTimeout(() => { const n = document.getElementById('node-bata'); n.classList.add('active'); n.querySelector('.node-status').textContent = 'scraping'; }, 500));
    activeTimeouts.push(setTimeout(() => { const n = document.getElementById('node-ndure'); n.classList.add('active'); n.querySelector('.node-status').textContent = 'scraping'; }, 700));
    activeTimeouts.push(setTimeout(() => { const n = document.getElementById('node-servis'); n.classList.add('active'); n.querySelector('.node-status').textContent = 'scraping'; }, 900));
    activeTimeouts.push(setTimeout(() => ['line-bata','line-ndure','line-servis'].forEach(id => document.getElementById(id).classList.add('active')), 400));
    animatePulses();
}

function animatePulses() {
    [
        { id:'pulse-bata',  x1:400,y1:150,x2:130,y2:150 },
        { id:'pulse-ndure', x1:400,y1:150,x2:400,y2:40 },
        { id:'pulse-servis',x1:400,y1:150,x2:670,y2:150 },
    ].forEach(p => {
        const el = document.getElementById(p.id);
        el.classList.add('active');
        let t = 0;
        el._iv = setInterval(() => {
            t += 0.02; if (t > 1) t = 0;
            el.setAttribute('cx', p.x1 + (p.x2 - p.x1) * t);
            el.setAttribute('cy', p.y1 + (p.y2 - p.y1) * t);
        }, 30);
    });
}

function deactivateNodes() {
    activeTimeouts.forEach(t => clearTimeout(t));
    activeTimeouts = [];
    
    ['node-center','node-bata','node-ndure','node-servis'].forEach(id => {
        const el = document.getElementById(id); 
        el.classList.remove('active');
        const s = el.querySelector('.node-status'); 
        if (s) {
            s.textContent = 'done';
            s.style.color = '#22c55e'; // Keep it green when done for visibility
        }
    });
    ['line-bata','line-ndure','line-servis'].forEach(id => document.getElementById(id).classList.remove('active'));
    ['pulse-bata','pulse-ndure','pulse-servis'].forEach(id => {
        const el = document.getElementById(id); el.classList.remove('active');
        if (el._iv) clearInterval(el._iv);
    });
}

// ── Stats ──
function showStats(data, time) {
    document.getElementById('stats-section').classList.remove('hidden');
    countUp('stat-products', data.length, 800);
    document.getElementById('stat-threads').textContent = '3';
    document.getElementById('stat-requests').textContent = '3';
    if (data.length) document.getElementById('stat-cheapest').textContent = 'Rs. ' + Math.min(...data.map(d => d.price)).toLocaleString();
    document.getElementById('stat-time').textContent = time + 's';
}

function countUp(id, to, dur) {
    const el = document.getElementById(id);
    const t0 = performance.now();
    (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
    })(t0);
}

function bc(s) { s = s.toLowerCase(); return s.includes('bata') ? 'badge-bata' : s.includes('ndure') ? 'badge-ndure' : 'badge-servis'; }

// ── Search ──
async function initSearch() {
    const q = document.getElementById('query').value.trim();
    if (!q) return;
    const btn = document.getElementById('search-btn');
    const grid = document.getElementById('results');
    const hdr = document.getElementById('results-header');

    btn.disabled = true;
    grid.innerHTML = '';
    hdr.classList.add('hidden');
    document.getElementById('stats-section').classList.add('hidden');

    activateNodes();

    const t0 = performance.now();
    try {
        const res = await fetch(`/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);

        deactivateNodes();
        btn.disabled = false;
        if (!data.length) {
            hdr.classList.remove('hidden');
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-satellite-dish"></i><p>No products found.</p></div>';
            return;
        }
        showStats(data, elapsed);
        hdr.classList.remove('hidden');

        data.forEach((item, i) => {
            const link = document.createElement('a');
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'card';
            link.style.animationDelay = `${i * 0.08}s`;
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.style.cursor = 'pointer';
            const img = item.image
                ? `<img class="card-img" src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='<div style=\\'height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted)\\'>No Image</div>'">`
                : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted)">No Image</div>';
            link.innerHTML = `
                <div class="card-img-wrap">${img}<span class="card-badge ${bc(item.site)}">${item.site}</span></div>
                <div class="card-body">
                    <h3 class="card-title">${item.name}</h3>
                    <div class="card-footer">
                        <span class="card-price">Rs. ${item.price.toLocaleString()}</span>
                        <span class="card-link"><i class="fas fa-external-link-alt"></i></span>
                    </div>
                </div>`;
            grid.appendChild(link);
        });
    } catch (e) {
        console.error(e); btn.disabled = false; deactivateNodes();
        hdr.classList.remove('hidden');
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p style="color:var(--magenta)">Connection failed.</p></div>';
    }
}