(function () {

    /* ========== DOM ========== */
    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");
    const startBtn = document.getElementById("start-btn");
    const backBtn = document.getElementById("back-btn");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const instructions = document.getElementById("instructions");

    /* ========== 变量 ========== */
    let gameActive = false;
    let animationFrameId = null;
    let fireworks = [];
    let particles = [];
    const targetText = "Ciallo～(∠・ω< )⌒☆";

    let timerTick = 0;
    const timerTotal = 90;
    let mousedown = false;

    let w, h;

    /* ========== 页面切换 ========== */
    startBtn.addEventListener("click", () => {
        homeScreen.style.opacity = "0";
        setTimeout(() => homeScreen.classList.add("hidden"), 800);

        gameScreen.classList.remove("hidden");
        void gameScreen.offsetWidth;
        gameScreen.style.opacity = "1";
        gameScreen.style.pointerEvents = "auto";

        initGame();
    });

    backBtn.addEventListener("click", () => {
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
            ctx.clearRect(0, 0, w, h);
        }, 1000);
    });

    /* ========== 初始化游戏 ========== */
    function initGame() {
        resizeCanvasForDevice();
        gameActive = true;
        loop();
    }

    /* ========== Canvas 适配手机设备 ========== */
    function resizeCanvasForDevice() {
        const dpr = window.devicePixelRatio || 1;

        w = canvas.clientWidth * dpr;
        h = canvas.clientHeight * dpr;

        canvas.width = w;
        canvas.height = h;

        ctx.scale(dpr, dpr);
    }

    window.addEventListener("resize", () => gameActive && resizeCanvasForDevice());

    /* ========== 工具函数 ========== */
    const random = (min, max) => Math.random() * (max - min) + min;

    /* -----------------------------
       Firework（烟花）
    ------------------------------ */
    class Firework {
        constructor(sx, sy, tx, ty) {
            this.x = sx;
            this.y = sy;
            this.tx = tx;
            this.ty = ty;

            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 2;
            this.acceleration = 1.02;

            this.hue = random(0, 360);
            this.brightness = random(50, 70);

            this.distanceToTarget = Math.hypot(tx - sx, ty - sy);
        }

        update(index) {
            this.speed *= this.acceleration;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            const remaining = Math.hypot(this.tx - this.x, this.ty - this.y);
            if (remaining < this.distanceToTarget * 0.05) {
                createParticles(this.tx, this.ty, this.hue);
                fireworks.splice(index, 1);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.fillStyle = `hsl(${this.hue},100%,${this.brightness}%)`;
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* -----------------------------
       Particle（爆炸文字粒子）
    ------------------------------ */
    class Particle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            this.hue = random(hue - 40, hue + 40);

            this.angle = random(0, Math.PI * 2);
            this.speed = random(2, 10);
            this.friction = 0.95;
            this.gravity = 0.4;

            this.alpha = 1;
            this.decay = random(0.008, 0.015);

            this.fontSize = random(12, 22);
        }

        update(i) {
            this.speed *= this.friction;

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;

            this.alpha -= this.decay;
            if (this.alpha <= 0) particles.splice(i, 1);
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = `hsl(${this.hue},100%,60%)`;
            ctx.font = `bold ${this.fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(targetText, this.x, this.y);
            ctx.restore();
        }
    }

    function createParticles(x, y, hue) {
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(x, y, hue));
        }
    }

    /* ========== 主循环 ========== */
    function loop() {
        if (!gameActive) return;

        animationFrameId = requestAnimationFrame(loop);

        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.globalCompositeOperation = "source-over";
        ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        ctx.globalCompositeOperation = "lighter";

        fireworks.forEach((f, i) => { f.update(i); f.draw(); });
        particles.forEach((p, i) => { p.update(i); p.draw(); });

        if (timerTick++ >= timerTotal) {
            fireworks.push(new Firework(
                canvas.clientWidth / 2,
                canvas.clientHeight,
                random(0, canvas.clientWidth),
                random(0, canvas.clientHeight / 2)
            ));
            timerTick = 0;
        }
    }

    /* ========== 触摸 + 鼠标事件（双端兼容） ========== */
    function spawnFirework(x, y) {
        fireworks.push(new Firework(canvas.clientWidth / 2, canvas.clientHeight, x, y));
        instructions.style.opacity = "0";
    }

    canvas.addEventListener("mousedown", e => {
        mousedown = true;
        spawnFirework(e.offsetX, e.offsetY);
    });

    canvas.addEventListener("mouseup", () => mousedown = false);

    canvas.addEventListener("touchstart", e => {
        e.preventDefault();
        mousedown = true;
        for (const t of e.touches) spawnFirework(t.clientX, t.clientY);
    }, { passive: false });

    canvas.addEventListener("touchend", () => mousedown = false);

})();
