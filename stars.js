// === stars.js : نجوم متحركة على canvas ===
(function () {
    const canvas = document.getElementById('starfield');
    if (!canvas) return; // حماية

    const ctx = canvas.getContext('2d');
    let stars = [];

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Star {
        constructor() {
            this.reset(true);
        }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
            this.size    = Math.random() * 1.8 + 0.3;
            this.speed   = Math.random() * 0.35 + 0.08;
            this.opacity = Math.random() * 0.7 + 0.2;
            this.twinkle = Math.random() * 0.02 + 0.005;
        }
        update() {
            this.y -= this.speed;
            this.opacity += (Math.random() - 0.5) * 0.03;
            if (this.opacity > 0.95) this.opacity = 0.95;
            if (this.opacity < 0.15) this.opacity = 0.15;
            if (this.y < -5) this.reset();
        }
        draw() {
            const goldTint = Math.random() > 0.85;
            ctx.fillStyle = goldTint
                ? `rgba(212, 175, 55, ${this.opacity})`
                : `rgba(255, 255, 255, ${this.opacity * 0.85})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initStars() {
        stars = [];
        const count = Math.min(180, Math.floor(window.innerWidth / 8));
        for (let i = 0; i < count; i++) stars.push(new Star());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => { s.update(); s.draw(); });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); initStars(); });
    resize();
    initStars();
    animate();
})();