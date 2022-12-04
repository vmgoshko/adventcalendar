$.getScript("https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.1.2/svg.min.js");

var svgElements = {};
var cache = {
	name : "",
	openedWindows : []
};

var day2text = new Map([]);

window.onload = function() {
	svgElements.calendarContent = document.querySelector('#calendar_obj').contentDocument;
	svgElements.message = svgElements.calendarContent.querySelector('#Message');
	svgElements.openedWindow = svgElements.calendarContent.querySelector('#Opened_Window');
	svgElements.windowsSvgRoot = svgElements.calendarContent.querySelector('#All_Windows');
	svgElements.cat = svgElements.calendarContent.querySelector('#Cat');
	svgElements.catVerb = svgElements.calendarContent.querySelector('#Cat_Verb');
	
	svgElements.message.classList.add("hidden");
	svgElements.windows = svgElements.calendarContent.querySelectorAll('[id^="Window"]');
	svgElements.windows.forEach(function(currentValue, currentIndex, listObj) {
		currentValue.addEventListener("click", OnWindowClicked, true);
		currentValue.addEventListener("mouseenter", OnWindowEnter, false);
		currentValue.addEventListener("mouseleave", OnWindowLeave, false);
	});
	
	svgElements.cat.addEventListener("click", OnCatClicked, false);
	svgElements.calendarContent.addEventListener("click", OnSvgClicked, false);
	RestoreCache();
	LoadData();
}

function LoadData() {
	$.get('getdata', {name : cache.name}, 
		function (data){
			dataObj = JSON.parse(data);
			if(!dataObj)
				return;
			
			dataObj.forEach(item => {day2text.set(item.day, { title : item.title, text : item.text })});
		});
	}

function OnWindowEnter(e) {
	var light = e.currentTarget.getElementsByClassName("st26");
	if (light.length == 0)
		return;
		
	light[0].classList.replace("st26", "st38");
}

function OnWindowLeave(e) {
	var light = e.currentTarget.getElementsByClassName("st38");
	if (light.length == 0 || light[0].parentElement.parentElement.id.startsWith("Opened"))
		return;
		
	light[0].classList.replace("st38", "st26");
}

function OnCatClicked(e){
	svgElements.catVerb.classList.remove("hidden");
}

function ShowMessage(day) {
	var dayData = day2text.get(day);
	
	var title = svgElements.message.querySelector("#Title");
	var textRect = svgElements.message.querySelector("#TextRect")
	var text = svgElements.message.querySelector("#Text");

	title.innerHTML = dayData.title;
	text.innerHTML = dayData.text;
	
	svgElements.message.classList.remove("hidden");
}

function OnOpenedWindowClicked(e) {
	e.stopPropagation();
	var wnd = e.currentTarget;
	var dayStr = wnd.id.substr("opened_window".length);
	var day = parseInt(dayStr);
	if (!day2text.has(day))
		return;

	ShowMessage(day);
}

function OnSvgClicked(e) {
	if(!svgElements.message.classList.contains("hidden"))
		svgElements.message.classList.add("hidden");
}

function OnWindowClicked(e){
	if (!svgElements.message.classList.contains("hidden"))
		return;

	e.stopPropagation();
	var wnd = e.currentTarget;
	OpenWindow(wnd);
	var day = parseInt(wnd.id.substr("window".length));
	if (!day2text.has(day))
		return;

	ShowMessage(day);
}

function OpenWindow(wnd, firstTime) {
	if (!wnd)
		return;
		
	var openedCloneId = "Opened_" + wnd.id;
	if (svgElements.windowsSvgRoot.querySelector("#" + openedCloneId))
		return;
		
	var openedClone = svgElements.openedWindow.cloneNode(true);
	openedClone.id = openedCloneId;
	
	svgElements.windowsSvgRoot.appendChild(openedClone);
	openedClone.classList.remove("hidden");
	openedClone.addEventListener("mouseenter", OnWindowEnter, false);
	openedClone.addEventListener("mouseleave", OnWindowLeave, false);
	openedClone.addEventListener("click", OnOpenedWindowClicked, false);
		
	StoreCache(wnd);
	
	var clickedCenter = GetElementCenter(wnd);
	var openedCenter = GetElementCenter(openedClone);
	
	var deltaX = clickedCenter.x - openedCenter.x;
	var deltaY = clickedCenter.y - openedCenter.y;
	
	var transformValue = "translate(" + deltaX + "," + deltaY + ")";
	openedClone.setAttribute('transform', transformValue);
	
	svgElements.windowsSvgRoot.removeChild(wnd);
}

function GetElementCenter(el) {
	var bbox = el.getBBox();
	var pt = {
		x : bbox.x + bbox.width / 2,
		y : bbox.y + bbox.height / 2
	};
	
	return pt;
}

function StoreCache(wnd) {
	if (wnd && cache.openedWindows.indexOf(wnd.id) < 0)
		cache.openedWindows.push(wnd.id);
	
	const json = JSON.stringify(cache);
	document.cookie = json + ";max-age=" + (3600 * 24 * 7) + ";SameSite=None; Secure";
}

function RestoreCache() {
	if (document.cookie) { 
		cache = JSON.parse(document.cookie);
		if (cache.openedWindows.length > 0)
			cache.openedWindows.forEach(wnd => OpenWindow(svgElements.calendarContent.getElementById(wnd)));
	}
	else {
		const urlParams = new URLSearchParams(window.location.search); 
		cache.name = urlParams?.get("name");
		if (cache.name)
			StoreCache(undefined);
	}
}