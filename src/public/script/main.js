var svgElements = {};
var cache = {
	usr : "test",
	openedWindows : []
};

var day2text = new Map([]);

window.onload = function() {
	svgElements.calendarContent = document.querySelector('#calendar_obj').contentDocument;
	svgElements.openedWindow = svgElements.calendarContent.querySelector('#Opened_Window');
	svgElements.windowsSvgRoot = svgElements.calendarContent.querySelector('#All_Windows');
	svgElements.cat = svgElements.calendarContent.querySelector('#Cat');
	svgElements.catVerb = svgElements.calendarContent.querySelector('#Cat_Verb');
	
	svgElements.windows = svgElements.calendarContent.querySelectorAll('[id^="Window"]');
	svgElements.windows.forEach(function(currentValue, currentIndex, listObj) {
		currentValue.addEventListener("click", OnWindowClicked, false);
		currentValue.addEventListener("mouseenter", OnWindowEnter, false);
		currentValue.addEventListener("mouseleave", OnWindowLeave, false);
	});
	
	svgElements.cat.addEventListener("click", OnCatClicked, false);
	
	RestoreCache();
	cache.usr = "test";
	LoadData();
}

function LoadData() {
	// if( cache.usr == "" )
		// return;
	
	// var jsonData = data.get(cache.usr);
	// //var dataObj = JSON.parse(jsonData);
	
}

function OnWindowEnter(e) {
	var light = e.currentTarget.getElementsByClassName("st26");
	if (light.length == 0)
		return;
		
	light[0].classList.replace("st26", "st39");
}

function OnWindowLeave(e) {
	var light = e.currentTarget.getElementsByClassName("st39");
	if (light.length == 0 || light[0].parentElement.parentElement.id.startsWith("Opened"))
		return;
		
	light[0].classList.replace("st39", "st26");
}


function OnCatClicked(e){
	svgElements.catVerb.classList.remove("st0");
}


function OnWindowClicked(e){
	OpenWindow(e.currentTarget);
}

function OpenWindow(wnd) {
	if (!wnd)
		return;
		
	var openedCloneId = "Opened_" + wnd.id;
	if (svgElements.windowsSvgRoot.querySelector("[id=" + openedCloneId + "]"))
		return;
		
	var openedClone = svgElements.openedWindow.cloneNode(true);
	openedClone.id = openedCloneId;
	
	svgElements.windowsSvgRoot.appendChild(openedClone);
	openedClone.classList.remove("st0");
	openedClone.addEventListener("mouseenter", OnWindowEnter, false);
	openedClone.addEventListener("mouseleave", OnWindowLeave, false);
		
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
	if (wnd == undefined)
		return;
		
	if (cache.openedWindows.find(el => (el == wnd.id).length > 0))
		return;
		
	cache.openedWindows.push(wnd.id);
	
	var json = JSON.stringify(cache);
	document.cookie = json + ";max-age="+(3600 * 24 * 7) + ";SameSite=None";
}

function RestoreCache() {
	if (document.cookie == "")
		return;
	cache = JSON.parse(document.cookie);
	
	if (cache.openedWindows.length == 0)
		return;
	
	cache.openedWindows.forEach(wnd => OpenWindow(svgElements.calendarContent.getElementById(wnd)));
}