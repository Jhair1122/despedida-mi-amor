// ============ CURSOR PC ============
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
const hoverElements = document.querySelectorAll('a, button, .letter-envelope, .gallery-item, .magic-button, .promises-list li, .capsule-card');
if (!('ontouchstart' in window)) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (Math.random() < 0.4) createDustParticle(e.clientX, e.clientY);
    });
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursorGlow.style.left = cursorX + 'px';
        cursorGlow.style.top = cursorY + 'px';
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
} else {
    cursorGlow.style.display = 'none';
    cursorDot.style.display = 'none';
}

function createDustParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'dust-particle';
    const size = 2 + Math.random() * 3;
    particle.style.width = size + 'px'; particle.style.height = size + 'px';
    particle.style.left = x + 'px'; particle.style.top = y + 'px';
    particle.style.setProperty('--dx', (Math.random() - 0.5) * 40 + 'px');
    particle.style.setProperty('--dy', (Math.random() - 0.5) * 40 + 'px');
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1500);
}

// ============ CANVAS ESTRELLAS + AURORA ============
const starCanvas = document.getElementById('starCanvas');
const ctx = starCanvas.getContext('2d');
let stars = [];
let shootingStars = [];
let auroraActive = false, auroraIntensity = 0, auroraPhase = 0;
let deviceTiltX = 0, deviceTiltY = 0; // para efecto 3D

function resizeCanvases() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    const constCanvas = document.getElementById('constellationCanvas');
    constCanvas.width = window.innerWidth;
    constCanvas.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', () => { resizeCanvases(); initStars(); });

function initStars() {
    stars = [];
    const count = Math.floor((starCanvas.width * starCanvas.height) / 3000);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * starCanvas.width,
            y: Math.random() * starCanvas.height,
            radius: Math.random() * 2.2 + 0.5,
            alpha: Math.random(),
            alphaChange: (Math.random() - 0.5) * 0.015,
            hue: Math.random() < 0.15 ? 40 + Math.random() * 30 : 0,
        });
    }
}
initStars();

function drawAurora() {
    if (!auroraActive && auroraIntensity <= 0.01) return;
    auroraIntensity += auroraActive ? 0.008 : -0.004;
    auroraIntensity = Math.min(1, Math.max(0, auroraIntensity));
    if (auroraIntensity <= 0.001) return;
    auroraPhase += 0.008;
    const grad = ctx.createLinearGradient(0, 0, starCanvas.width, starCanvas.height * 0.5);
    const a1 = Math.sin(auroraPhase) * 0.4 + 0.5;
    const a2 = Math.sin(auroraPhase + 2) * 0.4 + 0.5;
    const a3 = Math.sin(auroraPhase + 4) * 0.3 + 0.3;
    grad.addColorStop(0, `rgba(80,200,160,${0.08 * auroraIntensity * a1})`);
    grad.addColorStop(0.3, `rgba(140,180,220,${0.05 * auroraIntensity * a2})`);
    grad.addColorStop(0.6, `rgba(180,120,200,${0.04 * auroraIntensity * a3})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, starCanvas.width, starCanvas.height * 0.5);
}

class ShootingStar {
    constructor(x, y, angle, speed, length) {
        this.x = x; this.y = y; this.angle = angle; this.speed = speed;
        this.length = length; this.life = 1; this.trail = [];
        this.maxTrail = 30;
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
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255,255,240,${alpha})`;
            ctx.lineWidth = 1.8 * alpha + 0.5;
            ctx.stroke();
        }
        // cabeza brillante
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,200,${this.life})`;
        ctx.fill();
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function spawnShootingStar(x, y, angle, speed, length) {
    const sx = x !== undefined ? x : Math.random() * starCanvas.width * 0.9;
    const sy = y !== undefined ? y : Math.random() * starCanvas.height * 0.4;
    const ang = angle !== undefined ? angle : Math.PI / 4 + (Math.random() - 0.5) * 0.8;
    const spd = speed || 3 + Math.random() * 5;
    const len = length || 40 + Math.random() * 80;
    shootingStars.push(new ShootingStar(sx, sy, ang, spd, len));
}

function drawStars() {
    ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    const gradient = ctx.createRadialGradient(starCanvas.width*0.3, starCanvas.height*0.4, 0, starCanvas.width*0.3, starCanvas.height*0.4, starCanvas.width*0.6);
    gradient.addColorStop(0, 'rgba(40,20,60,0.06)');
    gradient.addColorStop(0.5, 'rgba(20,10,40,0.03)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, starCanvas.width, starCanvas.height);
    drawAurora();
    // estrellas con parallax 3D
    stars.forEach(star => {
        star.alpha += star.alphaChange;
        if (star.alpha > 1) { star.alpha = 1; star.alphaChange *= -1; }
        if (star.alpha < 0.15) { star.alpha = 0.15; star.alphaChange *= -1; }
        const drawX = star.x + deviceTiltX * 0.3;
        const drawY = star.y + deviceTiltY * 0.3;
        const color = star.hue > 0 ? `hsla(${star.hue},70%,80%,${star.alpha})` : `rgba(255,255,250,${star.alpha})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.radius, 0, Math.PI*2);
        ctx.fillStyle = color;
        if (star.radius > 1.5 && star.alpha > 0.7) {
            ctx.shadowColor = star.hue > 0 ? `hsla(${star.hue},80%,70%,0.6)` : 'rgba(255,240,220,0.5)';
            ctx.shadowBlur = star.radius * 6;
        } else { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; }
        ctx.fill();
    });
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
    shootingStars.forEach((ss, i) => {
        ss.update();
        ss.draw(ctx);
        if (ss.life <= 0) shootingStars.splice(i, 1);
    });
    requestAnimationFrame(drawStars);
}
drawStars();

// estrellas fugaces aleatorias normales
setInterval(() => { if (Math.random() < 0.4) spawnShootingStar(); }, 4000);
spawnShootingStar();

// ============ CONSTELACIÓN INTERACTIVA (canvas táctil) ============
const constCanvas = document.getElementById('constellationCanvas');
const constCtx = constCanvas.getContext('2d');
let constellationPoints = [];
let constellationLines = [];
const MAX_POINTS = 8;

function drawConstellation() {
    constCtx.clearRect(0, 0, constCanvas.width, constCanvas.height);
    constellationLines.forEach(line => {
        constCtx.beginPath();
        constCtx.moveTo(line.x1, line.y1);
        constCtx.lineTo(line.x2, line.y2);
        constCtx.strokeStyle = 'rgba(255,215,180,0.5)';
        constCtx.lineWidth = 1.5;
        constCtx.stroke();
    });
    constellationPoints.forEach((p, i) => {
        constCtx.beginPath();
        constCtx.arc(p.x, p.y, 4, 0, Math.PI*2);
        constCtx.fillStyle = '#f0d6b8';
        constCtx.fill();
        constCtx.shadowColor = '#f0d6b8';
        constCtx.shadowBlur = 10;
        constCtx.fill();
        constCtx.shadowBlur = 0;
    });
}

// Añadir punto al tocar (solo si no es botón/enlace)
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('.capsule-card') || target.closest('.letter-envelope') || target.closest('.gallery-item'))) {
        // no añadir punto, pero sí efecto visual
        spawnHeart(touch.clientX, touch.clientY);
        createSparks(touch.clientX, touch.clientY, 5);
        return;
    }
    e.preventDefault();
    constellationPoints.push({x: touch.clientX, y: touch.clientY});
    if (constellationPoints.length > 1) {
        const last = constellationPoints[constellationPoints.length - 2];
        const curr = constellationPoints[constellationPoints.length - 1];
        constellationLines.push({x1: last.x, y1: last.y, x2: curr.x, y2: curr.y});
    }
    if (constellationPoints.length >= MAX_POINTS) {
        // limpiar después de formar constelación
        setTimeout(() => {
            constellationPoints = [];
            constellationLines = [];
            constCtx.clearRect(0, 0, constCanvas.width, constCanvas.height);
            document.getElementById('constellationHint').classList.remove('visible');
        }, 4000);
        document.getElementById('constellationHint').classList.add('visible');
    }
    spawnHeart(touch.clientX, touch.clientY);
    createSparks(touch.clientX, touch.clientY, 3);
    drawConstellation();
}, {passive: false});

// Efecto 3D con giroscopio
window.addEventListener('deviceorientation', (e) => {
    if (e.gamma !== null && e.beta !== null) {
        deviceTiltX = e.gamma * 0.8; // izquierda/derecha
        deviceTiltY = e.beta * 0.8;  // adelante/atrás
    }
});

// ============ TYPEWRITER ============
const typewriterText = document.getElementById('typewriterText');
const phrases = ['Porque cada despedida...', 'es solo el preludio...', 'de un reencuentro más hermoso.', 'Te llevo conmigo, siempre. 💫'];
let phraseIndex = 0, charIndex = 0, isDeleting = false;
function typeWriter() {
    const current = phrases[phraseIndex];
    if (!isDeleting) {
        typewriterText.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) { setTimeout(() => { isDeleting = true; typeWriter(); }, 2500); return; }
    } else {
        typewriterText.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
    }
    setTimeout(typeWriter, isDeleting ? 30 : 70);
}
setTimeout(typeWriter, 1800);

// ============ CARTA ============
const letterEnvelope = document.getElementById('letterEnvelope');
let letterRevealed = false;
letterEnvelope.addEventListener('click', () => {
    if (!letterRevealed) {
        letterEnvelope.classList.add('revealed');
        letterRevealed = true;
        const rect = letterEnvelope.getBoundingClientRect();
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
const magicButton = document.getElementById('magicButton');
const magicMessage = document.getElementById('magicMessage');
let magicCooldown = false, shootingStarInterval = null;

magicButton.addEventListener('click', () => {
    if (magicCooldown) return;
    magicCooldown = true;
    magicButton.classList.add('in-cooldown');
    const rect = magicButton.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    createSparks(cx, cy, 100);
    auroraActive = true;
    // lluvia de corazones
    for (let i=0; i<30; i++) setTimeout(() => spawnHeart(Math.random()*window.innerWidth, window.innerHeight-20), i*60);
    // lluvia de estrellas fugaces realistas
    let starCount = 0;
    shootingStarInterval = setInterval(() => {
        for (let j=0; j<2; j++) { // varias a la vez
            const angle = -Math.PI/4 + (Math.random()-0.5)*1.2;
            spawnShootingStar(Math.random()*starCanvas.width, Math.random()*starCanvas.height*0.3, angle, 5+Math.random()*6, 60+Math.random()*100);
        }
        starCount++;
        if (starCount >= 20) { clearInterval(shootingStarInterval); shootingStarInterval = null; }
    }, 200);
    // fuegos artificiales (partículas con gravedad)
    for (let k=0; k<5; k++) {
        setTimeout(() => {
            const fx = cx + (Math.random()-0.5)*300;
            const fy = cy + (Math.random()-0.5)*200;
            for (let p=0; p<40; p++) {
                const angle = Math.random()*Math.PI*2;
                const speed = 2+Math.random()*5;
                const spark = document.createElement('div'); spark.className = 'spark';
                spark.style.left = fx+'px'; spark.style.top = fy+'px';
                spark.style.setProperty('--sx', Math.cos(angle)*speed*40+'px');
                spark.style.setProperty('--sy', Math.sin(angle)*speed*40+'px');
                spark.style.setProperty('--sr', '0deg');
                spark.style.setProperty('--duration', (1+Math.random()*2)+'s');
                spark.style.background = '#ffd700';
                spark.style.width = spark.style.height = '4px';
                document.body.appendChild(spark);
                setTimeout(() => spark.remove(), 2000);
            }
        }, k*400);
    }
    magicMessage.classList.add('active'); magicMessage.classList.remove('fading');
    setTimeout(() => { magicMessage.classList.add('fading'); magicMessage.classList.remove('active'); }, 3000);
    setTimeout(() => { auroraActive = false; }, 10000);
    setTimeout(() => { magicCooldown = false; magicButton.classList.remove('in-cooldown'); }, 6000);
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
document.querySelectorAll('.capsule-card').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        const rect = card.getBoundingClientRect();
        createSparks(rect.left+rect.width/2, rect.top+rect.height/2, 8);
    });
});

// ============ OBSERVERS ============
const promisesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('li').forEach((item, i) => setTimeout(() => item.classList.add('visible'), i*120));
            promisesObserver.unobserve(entry.target);
        }
    });
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
    if (moon && window.scrollY < window.innerHeight) {
        moon.style.transform = `translateY(${window.scrollY*0.4}px) translateX(${-window.scrollY*0.2}px)`;
    }
});

// Doble toque en luna (móvil)
const heroMoon = document.getElementById('heroMoon');
heroMoon.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    const rect = heroMoon.getBoundingClientRect();
    createSparks(rect.left+rect.width/2, rect.top+rect.height/2, 40);
    for (let i=0; i<15; i++) setTimeout(() => spawnHeart(rect.left+rect.width/2+(Math.random()-0.5)*200, rect.top+rect.height/2-Math.random()*200), i*50);
});

console.log('%c✨ Para ti, con todo mi amor ✨', 'font-size:1.5rem; color:#e8a0b4;');
console.log('%cCada estrella fugaz es un deseo que pido por ti 💕', 'color:#f0d6b8;');
setTimeout(() => spawnHeart(window.innerWidth/2, window.innerHeight/2), 2000);