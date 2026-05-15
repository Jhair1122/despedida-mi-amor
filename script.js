// ============ CURSOR PC ============
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
const hoverElements = document.querySelectorAll('a, button, .letter-envelope, .gallery-item, .magic-button, .promises-list li, .capsule-card');
const isTouchDevice = 'ontouchstart' in window;
if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (Math.random() < 0.4) createDustParticle(e.clientX, e.clientY);
    });
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15; cursorY += (mouseY - cursorY) * 0.15;
        cursorGlow.style.left = cursorX + 'px'; cursorGlow.style.top = cursorY + 'px';
        cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
} else { cursorGlow.style.display = 'none'; cursorDot.style.display = 'none'; }

function createDustParticle(x, y) {
    const p = document.createElement('div'); p.className = 'dust-particle';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.setProperty('--dx', (Math.random() - 0.5) * 40 + 'px');
    p.style.setProperty('--dy', (Math.random() - 0.5) * 40 + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1500);
}

// ============ ONDAS EXPANSIVAS ============
function createRipple(x, y) {
    const ripple = document.createElement('div'); ripple.className = 'ripple';
    ripple.style.left = x + 'px'; ripple.style.top = y + 'px';
    document.getElementById('rippleContainer').appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
}

// ============ TOQUE MÁGICO (sin bloquear scroll) ============
document.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('.capsule-card') || target.closest('.letter-envelope') || target.closest('.gallery-item') || target.closest('#constellationCanvas'))) return;
    createRipple(touch.clientX, touch.clientY);
    spawnHeart(touch.clientX, touch.clientY);
    createSparks(touch.clientX, touch.clientY, 5);
    if (Math.random() < 0.3) spawnShootingStar(touch.clientX, touch.clientY);
});

// ============ CANVAS ESTRELLAS + AURORA ============
const starCanvas = document.getElementById('starCanvas');
const ctx = starCanvas.getContext('2d');
let stars = [], shootingStars = [], auroraActive = false, auroraIntensity = 0, auroraPhase = 0;
let deviceTiltX = 0, deviceTiltY = 0;

function resizeStarCanvas() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
}
resizeStarCanvas();
window.addEventListener('resize', () => { resizeStarCanvas(); initStars(); });

function initStars() {
    stars = [];
    const count = Math.floor((starCanvas.width * starCanvas.height) / 3000);
    for (let i = 0; i < count; i++) stars.push({
        x: Math.random() * starCanvas.width, y: Math.random() * starCanvas.height,
        radius: Math.random() * 2.2 + 0.5, alpha: Math.random(),
        alphaChange: (Math.random() - 0.5) * 0.015, hue: Math.random() < 0.15 ? 40 + Math.random() * 30 : 0,
    });
}
initStars();

function drawAurora() {
    if (!auroraActive && auroraIntensity <= 0.01) return;
    auroraIntensity += auroraActive ? 0.008 : -0.004;
    auroraIntensity = Math.min(1, Math.max(0, auroraIntensity));
    if (auroraIntensity <= 0.001) return;
    auroraPhase += 0.008;
    const grad = ctx.createLinearGradient(0, 0, starCanvas.width, starCanvas.height * 0.5);
    grad.addColorStop(0, `rgba(80,200,160,${0.08 * auroraIntensity * (Math.sin(auroraPhase)*0.4+0.5)})`);
    grad.addColorStop(0.3, `rgba(140,180,220,${0.05 * auroraIntensity * (Math.sin(auroraPhase+2)*0.4+0.5)})`);
    grad.addColorStop(0.6, `rgba(180,120,200,${0.04 * auroraIntensity * (Math.sin(auroraPhase+4)*0.3+0.3)})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, starCanvas.width, starCanvas.height * 0.5);
}

class ShootingStar {
    constructor(x, y, angle, speed, length) {
        this.x = x; this.y = y; this.angle = angle; this.speed = speed;
        this.length = length; this.life = 1; this.trail = []; this.maxTrail = 30;
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.trail.push({x: this.x, y: this.y, alpha: 1});
        if (this.trail.length > this.maxTrail) this.trail.shift();
        this.trail.forEach(p => p.alpha -= 0.03);
        this.life -= 0.008;
    }
    draw(ctx) {
        if (this.trail.length < 2) return;
        for (let i = 0; i < this.trail.length - 1; i++) {
            const p1 = this.trail[i], p2 = this.trail[i + 1];
            const alpha = p2.alpha * this.life;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255,255,240,${alpha})`; ctx.lineWidth = 1.8 * alpha + 0.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,200,${this.life})`; ctx.fill();
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
    }
}

function spawnShootingStar(x, y, angle, speed, length) {
    shootingStars.push(new ShootingStar(
        x ?? Math.random() * starCanvas.width * 0.9,
        y ?? Math.random() * starCanvas.height * 0.4,
        angle ?? Math.PI/4 + (Math.random()-0.5)*0.8,
        speed ?? 3 + Math.random()*5,
        length ?? 40 + Math.random()*80
    ));
}

function drawStars() {
    ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    drawAurora();
    stars.forEach(star => {
        star.alpha += star.alphaChange;
        if (star.alpha > 1) { star.alpha = 1; star.alphaChange *= -1; }
        if (star.alpha < 0.15) { star.alpha = 0.15; star.alphaChange *= -1; }
        const drawX = star.x + deviceTiltX * 0.3, drawY = star.y + deviceTiltY * 0.3;
        const color = star.hue > 0 ? `hsla(${star.hue},70%,80%,${star.alpha})` : `rgba(255,255,250,${star.alpha})`;
        ctx.beginPath(); ctx.arc(drawX, drawY, star.radius, 0, Math.PI*2);
        ctx.fillStyle = color;
        if (star.radius > 1.5 && star.alpha > 0.7) {
            ctx.shadowColor = star.hue > 0 ? `hsla(${star.hue},80%,70%,0.6)` : 'rgba(255,240,220,0.5)';
            ctx.shadowBlur = star.radius * 6;
        } else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; }
        ctx.fill();
    });
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
    shootingStars.forEach((ss, i) => { ss.update(); ss.draw(ctx); if (ss.life <= 0) shootingStars.splice(i, 1); });
    requestAnimationFrame(drawStars);
}
drawStars();
setInterval(() => { if (Math.random() < 0.4) spawnShootingStar(); }, 4000);
spawnShootingStar();

window.addEventListener('deviceorientation', (e) => {
    if (e.gamma !== null && e.beta !== null) { deviceTiltX = e.gamma * 0.8; deviceTiltY = e.beta * 0.8; }
});

// ============ CONSTELACIÓN LOCAL (sin interferir scroll) ============
const constCanvas = document.getElementById('constellationCanvas');
if (constCanvas) {
    constCanvas.width = constCanvas.parentElement.clientWidth;
    constCanvas.height = 300;
    const ctxConst = constCanvas.getContext('2d');
    let points = [], lines = [];
    function draw() {
        ctxConst.clearRect(0, 0, constCanvas.width, constCanvas.height);
        lines.forEach(l => {
            ctxConst.beginPath(); ctxConst.moveTo(l.x1, l.y1); ctxConst.lineTo(l.x2, l.y2);
            ctxConst.strokeStyle = 'rgba(255,215,180,0.7)'; ctxConst.lineWidth = 2; ctxConst.stroke();
        });
        points.forEach(p => {
            ctxConst.beginPath(); ctxConst.arc(p.x, p.y, 5, 0, Math.PI*2);
            ctxConst.fillStyle = '#f0d6b8'; ctxConst.fill();
            ctxConst.shadowColor = '#f0d6b8'; ctxConst.shadowBlur = 10; ctxConst.fill(); ctxConst.shadowBlur = 0;
        });
    }
    constCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = constCanvas.getBoundingClientRect();
        const x = touch.clientX - rect.left, y = touch.clientY - rect.top;
        points.push({x, y});
        if (points.length > 1) lines.push({x1: points[points.length-2].x, y1: points[points.length-2].y, x2: x, y2: y});
        draw();
        spawnHeart(touch.clientX, touch.clientY);
    });
    document.getElementById('clearConstellation').addEventListener('click', () => {
        points = []; lines = [];
        ctxConst.clearRect(0, 0, constCanvas.width, constCanvas.height);
    });
}

// ============ TYPEWRITER ============
const typewriterText = document.getElementById('typewriterText');
const phrases = ['Porque cada despedida...', 'es solo el preludio...', 'de un reencuentro más hermoso.', 'Te llevo conmigo, siempre. 💫'];
let phraseIdx = 0, charIdx = 0, deleting = false;
function type() {
    const curr = phrases[phraseIdx];
    if (!deleting) {
        typewriterText.textContent = curr.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === curr.length) { setTimeout(() => { deleting = true; type(); }, 2500); return; }
    } else {
        typewriterText.textContent = curr.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? 30 : 70);
}
setTimeout(type, 1800);

// ============ CARTA ============
let letterRevealed = false;
document.getElementById('letterEnvelope').addEventListener('click', () => {
    if (!letterRevealed) {
        letterRevealed = true;
        document.getElementById('letterEnvelope').classList.add('revealed');
        const rect = document.getElementById('letterEnvelope').getBoundingClientRect();
        createSparks(rect.left + rect.width/2, rect.top + rect.height/2, 30);
    }
});

// ============ SPARKS ============
function createSparks(x, y, count) {
    const colors = ['#f0d6b8','#e8a0b4','#d4a574','#c9b8e0','#f5e0d0','#ffd4e0','#fff','#ffd700'];
    for (let i=0; i<count; i++) {
        const s = document.createElement('div'); s.className = 'spark';
        s.style.left = x+'px'; s.style.top = y+'px';
        s.style.setProperty('--sx', (Math.random()-0.5)*250+'px');
        s.style.setProperty('--sy', (Math.random()-0.5)*250+'px');
        s.style.setProperty('--sr', Math.random()*360+'deg');
        s.style.setProperty('--duration', (0.8+Math.random()*1.5)+'s');
        s.style.background = colors[Math.floor(Math.random()*colors.length)];
        s.style.width = s.style.height = (3+Math.random()*7)+'px';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1800);
    }
}

// ============ BOTÓN MÁGICO ============
const magicBtn = document.getElementById('magicButton');
const magicMsg = document.getElementById('magicMessage');
let magicCooldown = false, starInterval = null;
magicBtn.addEventListener('click', () => {
    if (magicCooldown) return;
    magicCooldown = true; magicBtn.classList.add('in-cooldown');
    const rect = magicBtn.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    createSparks(cx, cy, 100); auroraActive = true;
    for (let i=0; i<30; i++) setTimeout(() => spawnHeart(Math.random()*window.innerWidth, window.innerHeight-20), i*60);
    let count = 0;
    starInterval = setInterval(() => {
        for (let j=0; j<2; j++) spawnShootingStar(Math.random()*starCanvas.width, Math.random()*starCanvas.height*0.3, -Math.PI/4+(Math.random()-0.5)*1.2, 5+Math.random()*6, 60+Math.random()*100);
        count++; if (count >= 20) { clearInterval(starInterval); starInterval = null; }
    }, 200);
    // fuegos artificiales
    for (let k=0; k<5; k++) setTimeout(() => {
        const fx = cx + (Math.random()-0.5)*300, fy = cy + (Math.random()-0.5)*200;
        for (let p=0; p<40; p++) {
            const angle = Math.random()*Math.PI*2, speed = 2+Math.random()*5;
            const spark = document.createElement('div'); spark.className = 'spark';
            spark.style.left = fx+'px'; spark.style.top = fy+'px';
            spark.style.setProperty('--sx', Math.cos(angle)*speed*40+'px');
            spark.style.setProperty('--sy', Math.sin(angle)*speed*40+'px');
            spark.style.setProperty('--sr', '0deg');
            spark.style.setProperty('--duration', (1+Math.random()*2)+'s');
            spark.style.background = '#ffd700'; spark.style.width = spark.style.height = '4px';
            document.body.appendChild(spark); setTimeout(() => spark.remove(), 2000);
        }
    }, k*400);
    magicMsg.classList.add('active'); magicMsg.classList.remove('fading');
    setTimeout(() => { magicMsg.classList.add('fading'); magicMsg.classList.remove('active'); }, 3000);
    setTimeout(() => { auroraActive = false; }, 10000);
    setTimeout(() => { magicCooldown = false; magicBtn.classList.remove('in-cooldown'); }, 6000);
});

// ============ CORAZONES ============
function spawnHeart(x, y) {
    const h = document.createElement('span'); h.className = 'floating-heart';
    h.textContent = ['💕','💖','💗','💝','✨','💫','🌸','🩷','💘','💞'][Math.floor(Math.random()*10)];
    h.style.left = x+'px'; h.style.top = y+'px';
    h.style.fontSize = (1+Math.random()*2.5)+'rem';
    h.style.animationDuration = (3+Math.random()*4)+'s';
    document.getElementById('heartsContainer').appendChild(h);
    setTimeout(() => h.remove(), 5000);
}
setInterval(() => { if (Math.random()<0.5) spawnHeart(Math.random()*window.innerWidth*0.9, window.innerHeight-30); }, 3000);
document.addEventListener('dblclick', (e) => { spawnHeart(e.clientX, e.clientY); createSparks(e.clientX, e.clientY, 15); });

// ============ CÁPSULAS ============
document.querySelectorAll('.capsule-card').forEach(card => card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    const r = card.getBoundingClientRect();
    createSparks(r.left+r.width/2, r.top+r.height/2, 8);
}));

// ============ MÚSICA ============
let audioCtx = null;
function playMelody() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5]; // escala
    const melody = [0,1,2,3,4,3,2,1, 0,2,4,5,7,5,4,2];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; gain.gain.value = 0.2;
    osc.connect(gain); gain.connect(audioCtx.destination);
    let time = audioCtx.currentTime;
    melody.forEach((note, i) => {
        osc.frequency.setValueAtTime(notes[note], time + i*0.2);
        gain.gain.setValueAtTime(0.2, time + i*0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, time + i*0.2 + 0.18);
    });
    osc.start(time); osc.stop(time + melody.length*0.2 + 0.2);
    document.getElementById('musicStatus').textContent = '♪ Melodía sonando...';
    setTimeout(() => document.getElementById('musicStatus').textContent = '', melody.length*200 + 500);
}
document.getElementById('musicButton').addEventListener('click', playMelody);

// ============ BOTELLA ============
const bottleModal = document.getElementById('bottleModal');
document.getElementById('bottleButton').addEventListener('click', () => bottleModal.classList.add('active'));
document.getElementById('closeModal').addEventListener('click', () => bottleModal.classList.remove('active'));
bottleModal.addEventListener('click', (e) => { if (e.target === bottleModal) bottleModal.classList.remove('active'); });

// ============ OBSERVERS ============
const promisesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) {
        entry.target.querySelectorAll('li').forEach((item, i) => setTimeout(() => item.classList.add('visible'), i*120));
        promisesObserver.unobserve(entry.target);
    }});
}, { threshold: 0.2 });
promisesObserver.observe(document.getElementById('promisesList'));

const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); titleObserver.unobserve(entry.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.section-title').forEach(el => titleObserver.observe(el));

const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); galleryObserver.unobserve(entry.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.gallery-item').forEach(el => galleryObserver.observe(el));

// ============ PARALLAX LUNA ============
window.addEventListener('scroll', () => {
    const moon = document.getElementById('heroMoon');
    if (moon && window.scrollY < window.innerHeight) moon.style.transform = `translateY(${window.scrollY*0.4}px) translateX(${-window.scrollY*0.2}px)`;
});
document.getElementById('heroMoon').addEventListener('dblclick', (e) => {
    const r = e.target.getBoundingClientRect();
    createSparks(r.left+r.width/2, r.top+r.height/2, 40);
    for (let i=0; i<15; i++) setTimeout(() => spawnHeart(r.left+r.width/2+(Math.random()-0.5)*200, r.top+r.height/2-Math.random()*200), i*50);
});

console.log('%c✨ Para ti, con todo mi amor ✨', 'font-size:1.5rem; color:#e8a0b4;');
setTimeout(() => spawnHeart(window.innerWidth/2, window.innerHeight/2), 2000);