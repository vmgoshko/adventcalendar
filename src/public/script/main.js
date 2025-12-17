$.getScript("https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.1.2/svg.min.js");

const svgElements = {};
let cache = {
    name: "",
    openedWindows: []
};

const day2text = new Map();
let maxOpenedDay = 0;
/* =========================
   INIT
   ========================= */

async function loadSvgs() {
    document.body.style.visibility = "hidden";

    const [calendarSvg, popupSvg] = await Promise.all([
        fetch("res/calendar.svg").then(r => r.text()),
        fetch("res/popup.svg").then(r => r.text())
    ]);

    document.getElementById("calendar_container").innerHTML = calendarSvg;
    document.getElementById("popup_container").innerHTML = popupSvg;

    initCalendarSvg();
    initPopupSvg();

    RestoreCache();
    LoadData();

    SnowFall3();
    SnowFX.startFireworks();

    document.body.style.visibility = "visible";
}

loadSvgs().catch(console.error);

/* =========================
   CALENDAR
   ========================= */

function initCalendarSvg() {
    svgElements.calendarContent = document.querySelector("svg#Calendar");
    svgElements.daysSvgRoot = svgElements.calendarContent.querySelector("#AllDays");
    svgElements.numbersSvgRoot = svgElements.calendarContent.querySelector("#Numbers");
    svgElements.happyNewYear = document.querySelector("#HappyNewYear");
    svgElements.happyNewYear.classList.add('hidden');

    svgElements.days = svgElements.calendarContent.querySelectorAll('[id^="Day_"]');
    svgElements.days.forEach(day => {
        day.classList.add("notvisited");
        day.addEventListener("click", OnDayClicked, true);
    });
}

/* =========================
   POPUP
   ========================= */

function initPopupSvg() {
    svgElements.messageContent = document.querySelector("svg#Message");

    const popupContainer = document.getElementById("popup_container");
    const popupSvg = document.getElementById("Message");

    popupContainer.addEventListener("click", closePopup);
}

function openPopup() {
    document.getElementById("popup_container").classList.add("open");
}

function closePopup() {
    document.getElementById("popup_container").classList.remove("open");
}

/* =========================
   DATA
   ========================= */

function LoadData() {
    $.get("getdata", { name: cache.name }, data => {
        let dataObj;
        try {
            dataObj = JSON.parse(data);
        } catch {
            return;
        }

        if (!Array.isArray(dataObj)) return;

        dataObj.forEach(item => {
            day2text.set(item.day, {
                title: item.title,
                text: item.text,
                movieTitle: item.movie,
                movieName: item.name
            });
        });
    });
}

/* =========================
   MESSAGE
   ========================= */

function ShowMessage(day) {
    const dayData = day2text.get(day);
    if (!dayData) return;

    const title = svgElements.messageContent.querySelector("#Title");
    const text = svgElements.messageContent.querySelector("#Text");
    const movieTitle = svgElements.messageContent.querySelector("#MovieTitle");
    const movieName = svgElements.messageContent.querySelector("#MovieName");

    title.innerHTML = dayData.title;
    text.innerHTML = dayData.text;
    movieTitle.innerHTML = dayData.movieTitle;
    movieName.innerHTML = dayData.movieName;

    fitText(title, { min: 24, max: 36 });
    fitText(text, { min: 10, max: 24 });
    fitText(movieTitle, { min: 12, max: 20 });
    fitText(movieName, { min: 20, max: 24 });

    openPopup();
}

/* =========================
   DAYS
   ========================= */

function OnDayClicked(e) {
    e.stopPropagation();

    const dayEl = e.currentTarget;
    const day = parseInt(dayEl.id.replace("Day_", ""), 10);

    if (day > maxOpenedDay + 1) return;

    if (day == 14)
        svgElements.happyNewYear.classList.remove('hidden');

    OpenDay(dayEl);

    if (day2text.has(day)) {
        ShowMessage(day);
        maxOpenedDay = day;
    }
}

function SnowFall() {
    const canvas = document.getElementById("snow-canvas");
    const ctx = canvas.getContext("2d");

    let w, h;
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    Object.assign(canvas.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999
    });

    const flakes = [];
    const MAX_FLAKES = Math.min(180, Math.floor(w / 6));

    function createFlake() {
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 3 + 0.8,
            speedY: Math.random() * 1.2 + 0.4,
            speedX: Math.random() * 0.6 - 0.3,
            opacity: Math.random() * 0.2 + 0.4
        };
    }

    for (let i = 0; i < MAX_FLAKES; i++) {
        flakes.push(createFlake());
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (const f of flakes) {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);

            // заливка
            ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(200,220,255,0.6)";
            ctx.fill();

            // обводка
            ctx.lineWidth = 0.7;
            ctx.strokeStyle = "rgba(188, 208, 238, 0.8)";
            ctx.stroke();

            // сброс
            ctx.shadowBlur = 0;


            f.y += f.speedY;
            f.x += f.speedX;

            if (f.y > h) {
                f.y = -5;
                f.x = Math.random() * w;
            }
            if (f.x > w) f.x = 0;
            if (f.x < 0) f.x = w;
        }

        requestAnimationFrame(draw);
    }

    draw();
}

function SnowFall2() {
    const canvas = document.getElementById("snow-canvas");
    const ctx = canvas.getContext("2d");

    let w, h;
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    Object.assign(canvas.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999
    });

    /* ---------- prerender снежинки ---------- */

    function createSnowflakeImage(size) {
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d");

        const r = size / 2;
        g.translate(r, r);
        g.strokeStyle = "rgba(180,200,230,0.9)";
        g.lineWidth = Math.max(1, size * 0.06);
        g.lineCap = "round";

        for (let i = 0; i < 6; i++) {
            g.rotate(Math.PI / 3);

            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(0, -r);
            g.stroke();

            g.beginPath();
            g.moveTo(0, -r * 0.6);
            g.lineTo(r * 0.25, -r * 0.8);
            g.moveTo(0, -r * 0.6);
            g.lineTo(-r * 0.25, -r * 0.8);
            g.stroke();
        }
        return c;
    }

    const snowflakeImages = [
        createSnowflakeImage(5),
        createSnowflakeImage(8),
        createSnowflakeImage(12),
        createSnowflakeImage(16),
    ];

    /* ---------- модель снежинок ---------- */

    const flakes = [];
    const COUNT = Math.min(100, Math.floor(w / 10));

    function createFlake() {
        const img = snowflakeImages[Math.floor(Math.random() * snowflakeImages.length)];
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            img,
            size: img.width,
            speedY: Math.random() * 0.8 + 0.4,
            speedX: Math.random() * 0.4 - 0.2,
            rotation: Math.random() * Math.PI,
            rotationSpeed: Math.random() * 0.002 - 0.001,
            opacity: Math.random() * 0.4 + 0.5
        };
    }

    for (let i = 0; i < COUNT; i++) {
        flakes.push(createFlake());
    }

    /* ---------- рендер ---------- */

    function draw() {
        ctx.clearRect(0, 0, w, h);

        for (const f of flakes) {
            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rotation);
            ctx.globalAlpha = f.opacity;

            ctx.drawImage(f.img, -f.size / 2, -f.size / 2);

            ctx.restore();

            f.y += f.speedY;
            f.x += f.speedX;
            f.rotation += f.rotationSpeed;

            if (f.y > h + 20) {
                f.y = -20;
                f.x = Math.random() * w;
            }
            if (f.x > w) f.x = 0;
            if (f.x < 0) f.x = w;
        }

        requestAnimationFrame(draw);
    }

    draw();
}

function SnowFall3() {
	const canvas = document.getElementById("snow-canvas");
	const ctx = canvas.getContext("2d");

	let w, h;
	function resize() {
		w = canvas.width = window.innerWidth;
		h = canvas.height = window.innerHeight;
	}
	window.addEventListener("resize", resize);
	resize();

	Object.assign(canvas.style, {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		pointerEvents: "none",
		zIndex: 9999
	});

	/* =====================================================
	   ❄️ SNOW (bitmap, fast, no trails)
	   ===================================================== */

	function createSnowflakeImage(size) {
		const c = document.createElement("canvas");
		c.width = c.height = size;
		const g = c.getContext("2d");

		const r = size / 2;
		g.translate(r, r);
		g.strokeStyle = "rgba(180,200,230,0.9)";
		g.lineWidth = Math.max(1, size * 0.06);
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

	const snowImages = [
		createSnowflakeImage(12),
		createSnowflakeImage(16)
	];

	const snow = [];
	for (let i = 0; i < 70; i++) {
		const img = snowImages[Math.floor(Math.random() * snowImages.length)];
		snow.push({
			x: Math.random() * w,
			y: Math.random() * h,
			img,
			size: img.width,
			scale: Math.random() * 0.6 + 0.4,
			speedY: Math.random() * 0.6 + 0.3,
			speedX: Math.random() * 0.3 - 0.15,
			rotation: Math.random() * Math.PI,
			rotationSpeed: Math.random() * 0.002 - 0.001,
			opacity: Math.random() * 0.4 + 0.5
		});
	}

	/* =====================================================
	   🎆 FIREWORKS (slow, trails via geometry)
	   ===================================================== */

	const COLORS = [
		"255,80,80",
		"255,180,60",
		"120,200,255",
		"180,255,120",
		"255,120,220"
	];

	const fireworks = [];
	let enabled = false;
	let timer = 0;

	function spawnFirework(x, y) {
		const color = COLORS[Math.floor(Math.random() * COLORS.length)];
		for (let i = 0; i < 60; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = Math.random() * 0.6 + 0.4;
			fireworks.push({
				x, y,
				prevX: x,
				prevY: y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s,
				life: 140,
				color
			});
		}
	}

	window.SnowFX = {
		startFireworks() { enabled = true; },
		stopFireworks() { enabled = false; },
		firework(x, y) { spawnFirework(x, y); }
	};

	/* =====================================================
	   🎬 RENDER
	   ===================================================== */

	function draw() {
		ctx.clearRect(0, 0, w, h);

		// ❄️ снег
		for (const f of snow) {
			const s = f.size * f.scale;
			ctx.save();
			ctx.translate(f.x, f.y);
			ctx.rotate(f.rotation);
			ctx.globalAlpha = f.opacity;
			ctx.drawImage(f.img, -s / 2, -s / 2, s, s);
			ctx.restore();

			f.y += f.speedY;
			f.x += f.speedX;
			f.rotation += f.rotationSpeed;

			if (f.y > h) {
				f.y = -20;
				f.x = Math.random() * w;
			}
		}

		// 🎆 салют (trail без затирания фона)
		ctx.save();
		ctx.globalCompositeOperation = "lighter";

		for (let i = fireworks.length - 1; i >= 0; i--) {
			const p = fireworks[i];

			ctx.beginPath();
			ctx.moveTo(p.prevX, p.prevY);
			ctx.lineTo(p.x, p.y);
			ctx.strokeStyle = `rgba(${p.color},${p.life / 140})`;
			ctx.lineWidth = 1.4;
			ctx.stroke();

			p.prevX = p.x;
			p.prevY = p.y;

			p.x += p.vx;
			p.y += p.vy;
			p.vx *= 0.99;
			p.vy = p.vy * 0.99 + 0.01;

			if (--p.life <= 0) fireworks.splice(i, 1);
		}

		ctx.restore();

		if (enabled && ++timer > 90) {
			timer = 0;
			spawnFirework(
				w * (0.2 + Math.random() * 0.6),
				h * (0.15 + Math.random() * 0.3)
			);
		}

		requestAnimationFrame(draw);
	}

	draw();
}

function OpenDay(dayEl, force = false) {
    if (!dayEl) return;

    dayEl.classList.remove("notvisited");
    HideNumber(dayEl);
    StoreCache(dayEl);
}

function HideNumber(dayEl) {
    const numId = "Num_" + dayEl.id.replace("Day_", "");
    const number = svgElements.calendarContent.querySelector("#" + numId);
    if (number) number.classList.add("hidden");
}

/* =========================
   CACHE
   ========================= */

function StoreCache(dayEl) {
    if (dayEl && !cache.openedWindows.includes(dayEl.id)) {
        cache.openedWindows.push(dayEl.id);
    }

    localStorage.setItem("calendarCache", JSON.stringify(cache));
}

function RestoreCache() {
    const saved = localStorage.getItem("calendarCache");
    if (!saved) {
        const params = new URLSearchParams(window.location.search);
        cache.name = params.get("name") || "";
        StoreCache();
        return;
    }

    try {
        cache = JSON.parse(saved);
    } catch {
        cache = { name: "", openedWindows: [] };
        maxOpenedDay = 0;
    }

    cache.openedWindows.forEach(id => {
        const dayEl = svgElements.calendarContent.getElementById(id);
        if (dayEl) {
            OpenDay(dayEl);
            maxOpenedDay = Math.max(maxOpenedDay, parseInt(id.replace("Day_", ""), 10));
        }
    });
}

/* =========================
   FIT TEXT (BINARY)
   ========================= */

function fitText(el, { min = 12, max = 28 } = {}) {
    let lo = min;
    let hi = max;
    let best = min;

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        el.style.fontSize = mid + "px";

        if (
            el.scrollWidth <= el.clientWidth &&
            el.scrollHeight <= el.clientHeight
        ) {
            best = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }

    el.style.fontSize = best + "px";
}
