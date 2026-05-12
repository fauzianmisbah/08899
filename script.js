const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false }); // Performance boost: opaque background

let width, height, dpr;
let particles = [];
const particleCount = 2000;
const heartPoints = [];
const mouse = { x: undefined, y: undefined, radius: 150 };

// UI Elements
const settingsBtn = document.getElementById('settingsBtn');
const menu = document.getElementById('menu');
const saveBtn = document.getElementById('saveBtn');
const nameInput = document.getElementById('nameInput');
const displayName = document.getElementById('displayName');

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('touchstart', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

settingsBtn.addEventListener('click', () => {
    menu.classList.add('active');
});

saveBtn.addEventListener('click', () => {
    const newName = nameInput.value.trim();
    if (newName) {
        displayName.textContent = newName;
    }
    menu.classList.remove('active');
});

menu.addEventListener('click', (e) => {
    if (e.target === menu) menu.classList.remove('active');
});

function init() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    // Adjust canvas for High DPI
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(dpr, dpr);
    
    // Scale heart based on screen size
    const scale = Math.min(width, height) / 25;
    
    heartPoints.length = 0;
    // Pre-calculate heart shape points
    for (let i = 0; i < Math.PI * 2; i += 0.01) {
        const x = 16 * Math.pow(Math.sin(i), 3);
        const y = -(13 * Math.cos(i) - 5 * Math.cos(2 * i) - 2 * Math.cos(3 * i) - Math.cos(4 * i));
        heartPoints.push({ x: x * scale, y: y * scale });
    }

    particles = [];
    for (let i = 0; i < particleCount; i++) {
        const target = heartPoints[Math.floor(Math.random() * heartPoints.length)];
        particles.push(new Particle(target));
    }
}

class Particle {
    constructor(target) {
        this.reset(target);
    }

    reset(target) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.targetX = target.x + width / 2;
        this.targetY = target.y + height / 2;
        this.size = Math.random() * 2 + 1; // Slightly larger particles
        this.baseX = this.targetX;
        this.baseY = this.targetY;
        this.density = (Math.random() * 30) + 1;
        this.color = `rgba(255, 45, 85, ${Math.random() * 0.6 + 0.4})`;
    }

    update() {
        // Distance from mouse
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function animate() {
    // Fill background instead of clearRect for alpha:false optimization
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

window.addEventListener('resize', init);

init();
animate();
