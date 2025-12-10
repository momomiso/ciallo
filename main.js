(function () {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");
    const instructions = document.getElementById("instructions");

    let fireworks = [];
    let particles = [];
    let animationFrameId = null;
    let gameActive = false;

    const targetText = "Ciallo～(∠・ω< )⌒☆";

    /* 性能优化参数 */
    const MAX_PARTICLES = 180;
    const MAX_FIREWORKS = 3;
    const PARTICLES_PER_FIREWORK = 12;
    const CLICK_COOLDOWN = 200;

    let lastClick = 0;
    let w, h;

    /* ---------- Canvas 适配 ---------- */
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.scale(dpr, dpr);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
    }

    window.addEventListener("resize", resizeCanvas);

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /* ---------- Firework ---------- */
    class Firework {
        constructor(sx, sy, tx, ty) {
            this.x = sx;
            this.y = sy;
            this.tx = tx;
            this.ty = ty;

            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 2;
            this.acc = 1.03;

            this.hue = random(0, 360);
            this.distance = Math.hypot(tx - sx, ty - sy);
        }

        update(i) {
            this.speed *= this.acc;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            if (Math.hypot(this.tx - this.x, this.ty - this.y) < 20) {
                createParticles(this.tx, this.ty, this.hue);
                fireworks.splice(i, 1);
            }
        }

        draw() {
            ctx.fillStyle = `hsl(${this.hue},100%,60%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ---------- 粒子 ---------- */
    class Particle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            this.hue = hue;

            this.angle = random(0, Math.PI * 2);
            this.speed = random(2, 8);
            this.friction = 0.93;
            this.gravity = 0.35;

            this.alpha = 1;
            this.decay = random(0.01, 0.02);
        }

        update(i) {
            this.speed *= this.friction;

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;

            this.alpha -= this.decay;
            if (this.alpha <= 0) particles.splice(i, 1);
        }

        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = `hsl(${this.hue},100%,60%)`;
            ctx.fillText(targetText, this.x, this.y);
            ctx.globalAlpha = 1;
        }
    }

    function createParticles(x, y, hue) {
        for (let i = 0; i < PARTICLES_PER_FIREWORK; i++) {
            particles.push(new Particle(x, y, hue));
        }
    }

    /* ---------- 主循环 ---------- */
    function loop() {
        if (!gameActive) return;

        animationFrameId = requestAnimationFrame(loop);

        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, 0, w, h);

        fireworks.forEach((fw, i) => { fw.update(i); fw.draw(); });
        particles.forEach((p, i) => { p.update(i); p.draw(); });

        if (particles.length > MAX_PARTICLES) {
            particles.splice(0, particles.length - MAX_PARTICLES);
        }
    }

    /* ---------- 点击触发烟花 ---------- */
    function spawnFirework(x, y) {
        const now = Date.now();
        if (now - lastClick < CLICK_COOLDOWN) return;
        lastClick = now;

        if (fireworks.length < MAX_FIREWORKS) {
            fireworks.push(new Firework(w / 2, h, x, y));
        }

        instructions.style.opacity = "0";
    }

    canvas.addEventListener("mousedown", e => spawnFirework(e.offsetX, e.offsetY));
    canvas.addEventListener("touchstart", e => {
        e.preventDefault();
        let t = e.touches[0];
        spawnFirework(t.clientX, t.clientY);
    }, { passive: false });

    /* ---------- 游戏启动函数 ---------- */
    window.startFireworkGame = function () {
        resizeCanvas();
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        fireworks = [];
        particles = [];
        gameActive = true;

        loop();
    };

    /* ---------- 页面切换 ---------- */
    document.getElementById("start-btn").onclick = () => {
        homeScreen.style.opacity = "0";
        setTimeout(() => homeScreen.classList.add("hidden"), 800);

        gameScreen.classList.remove("hidden");
        void gameScreen.offsetWidth;
        gameScreen.style.opacity = "1";
        gameScreen.style.pointerEvents = "auto";

        startFireworkGame();
    };

    document.getElementById("back-btn").onclick = () => {
        gameActive = false;
        cancelAnimationFrame(animationFrameId);

        gameScreen.style.opacity = "0";
        gameScreen.style.pointerEvents = "none";

        homeScreen.classList.remove("hidden");
        void homeScreen.offsetWidth;
        homeScreen.style.opacity = "1";

        setTimeout(() => {
            gameScreen.classList.add("hidden");
            fireworks = [];
            particles = [];
        }, 1000);
    };

})();
