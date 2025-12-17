console.log("SNOWFALL VERSION: HUGE FIREWORKS v3");
// snowfall.js
(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const fwCanvas = document.createElement("canvas");
    const fwCtx = fwCanvas.getContext("2d");

    let w = 0, h = 0;

    function resize() {
        w = canvas.width = fwCanvas.width = window.innerWidth;
        h = canvas.height = fwCanvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    Object.assign(canvas.style, {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999
    });

    document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(canvas);
        resize();
    });

    /* ================= ❄️ SNOW ================= */

    function makeSnowImg(size) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d");

        const r = size / 2;
        g.translate(r, r);
        g.strokeStyle = "rgba(180,200,230,0.9)";
        g.lineWidth = Math.max(1, size * 0.08);
        g.lineCap = "round";

        for (let i = 0; i < 6; i++) {
            g.rotate(Math.PI / 3);
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(0, -r);
            g.stroke();
        }
        return c;
    }

    const snowImgs = [makeSnowImg(12), makeSnowImg(16)];
    const snow = [];

    function initSnow() {
        snow.length = 0;
        const count = Math.min(60, Math.floor(w / 20));
        for (let i = 0; i < count; i++) {
            const img = snowImgs[Math.random() * snowImgs.length | 0];
            snow.push({
                x: Math.random() * w,
                y: Math.random() * h,
                img,
                s: img.width * (0.5 + Math.random() * 0.6),
                vy: 0.35 + Math.random() * 0.35,
                vx: Math.random() * 0.15 - 0.075,
                a: Math.random() * Math.PI,
                va: Math.random() * 0.0015 - 0.00075,
                o: 0.4 + Math.random() * 0.4
            });
        }
    }

    /* ================= 🎆 HUGE FIREWORKS ================= */

    const COLORS = [
        "255, 90, 90",
        "255, 200, 80",
        "120, 200, 255",
        "180, 255, 140",
        "255, 140, 220",
        "200, 160, 255"
    ];

    const particles = [];
    let fireworksEnabled = false;
    let fwTimer = 0;

    function spawnFirework(x, y) {
        const color = COLORS[Math.random() * COLORS.length | 0];

        const COUNT = 160;   // МНОГО
        const POWER = 2.4;   // БОЛЬШОЙ РАДИУС
        const LIFE = 320;   // ДОЛГО

        for (let i = 0; i < COUNT; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = POWER * (0.6 + Math.random() * 0.4);

            const burst = 12; // <<< ВОТ ЭТО КЛЮЧ
            particles.push({
                x: x + Math.cos(a) * burst,
                y: y + Math.sin(a) * burst,
                px: x,
                py: y,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                life: LIFE,
                color
            });

        }
    }

    /* ================= 🎮 API ================= */

    window.SnowFX = {
        startFireworks() { fireworksEnabled = true; },
        stopFireworks() { fireworksEnabled = false; },
        firework(x, y) { spawnFirework(x, y); }
    };

    /* ================= 🎬 LOOP ================= */

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // ❄️ снег
        for (const f of snow) {
            ctx.save();
            ctx.globalAlpha = f.o;
            ctx.translate(f.x, f.y);
            ctx.rotate(f.a);
            ctx.drawImage(f.img, -f.s / 2, -f.s / 2, f.s, f.s);
            ctx.restore();

            f.y += f.vy;
            f.x += f.vx;
            f.a += f.va;

            if (f.y > h) {
                f.y = -20;
                f.x = Math.random() * w;
            }
        }

        // 🎆 offscreen trail (ДЛИННЫЙ)
        if (fireworksEnabled || particles.length) {
            fwCtx.globalCompositeOperation = "destination-out";
            fwCtx.fillStyle = "rgba(0,0,0,0.03)";
            fwCtx.fillRect(0, 0, w, h);
            fwCtx.globalCompositeOperation = "source-over";

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                fwCtx.beginPath();
                fwCtx.moveTo(p.px, p.py);
                fwCtx.lineTo(p.x, p.y);
                fwCtx.strokeStyle = `rgba(${p.color},${p.life / 320})`;
                fwCtx.lineWidth = 3.6;
                fwCtx.stroke();

                p.px = p.x;
                p.py = p.y;

                p.x += p.vx;
                p.y += p.vy;

                p.vx *= 0.996;
                p.vy = p.vy * 0.996 + 0.004;

                if (--p.life <= 0) particles.splice(i, 1);
            }

            ctx.drawImage(fwCanvas, 0, 0);
        }

        if (fireworksEnabled && ++fwTimer > 160) {
            fwTimer = 0;
            spawnFirework(
                w * (0.15 + Math.random() * 0.7),
                h * (0.12 + Math.random() * 0.35)
            );
        }

        requestAnimationFrame(draw);
    }

    initSnow();
    draw();
})();
