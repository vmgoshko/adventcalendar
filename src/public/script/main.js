$.getScript("https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.1.2/svg.min.js");

const svgElements = {};
let cache = {
    name: "",
    openedWindows: []
};

const day2text = new Map();

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

    OpenDay(dayEl);

    if (day2text.has(day)) {
        ShowMessage(day);
    }
}

function OpenDay(dayEl) {
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
    }

    cache.openedWindows.forEach(id => {
        const dayEl = svgElements.calendarContent.getElementById(id);
        if (dayEl) {
            OpenDay(dayEl);
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
