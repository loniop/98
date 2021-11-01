
var player_counts = [1, 2, 3, 4];
var current_player_count = 1;
// var sounds_enabled = true;
// var music_enabled = true;
var audio_enabled = true;

var freezing_display = false;
var menus_open = false;
var triggering_menus = false;

var canvas = document.getElementById("canvas");
var overlay_canvas = document.getElementById("overlay-canvas");
var overlay_context = overlay_canvas.getContext("2d");

function start_freeze_frame() {
	if (freezing_display) {
		return; // don't update the frame
	}
	freezing_display = true;
	overlay_context.fillStyle = "black";
	overlay_context.fillRect(0, 0, canvas.width, canvas.height);
	overlay_context.drawImage(canvas, 0, 0);
}

function stop_freeze_frame() {
	freezing_display = false;
	overlay_context.clearRect(0, 0, canvas.width, canvas.height);
}

function click(canvas_x, canvas_y) {
	const rect = canvas.getBoundingClientRect();
	const client_x = canvas_x + rect.left;
	const client_y = canvas_y + rect.top;
	const params = {
		clientX: client_x,
		clientY: client_y,
		pageX: client_x,
		pageY: client_y,
		offsetX: canvas_x,
		offsetY: canvas_y,
		screenX: client_x,
		screenY: client_y,
		movementX: 0,
		movementY: 0,
		which: 1,
		button: 0,
		buttons: 1,
		altKey: false,
		ctrlKey: false,
		shiftKey: false,
		metaKey: false,
		bubbles: true,
		cancelable: true,
		view: window,
		target: canvas,
	};
	// canvas.dispatchEvent(new MouseEvent("mousemove", params));
	canvas.dispatchEvent(new MouseEvent("mouseenter", params));
	canvas.dispatchEvent(new MouseEvent("mousedown", params));
	canvas.dispatchEvent(new MouseEvent("mouseup", params));
	// canvas.dispatchEvent(new MouseEvent("click", params));
	// canvas.dispatchEvent(new MouseEvent("mouseleave", params));

	// const click_effect_el = document.createElement("div");
	// click_effect_el.style.position = "absolute";
	// click_effect_el.style.left = client_x + "px";
	// click_effect_el.style.top = client_y + "px";
	// click_effect_el.style.zIndex = "1000";
	// click_effect_el.style.backgroundColor = "red";
	// click_effect_el.style.color = "white";
	// click_effect_el.textContent = `(${canvas_x}, ${canvas_y})`;
	// document.body.appendChild(click_effect_el);
	// setTimeout(() => {
	// 	click_effect_el.remove();
	// }, 100);
}

// let mouse_x = 0;
// let mouse_y = 0;
// addEventListener("mousemove", function (event) {
// 	const rect = canvas.getBoundingClientRect();
// 	mouse_x = event.clientX - rect.left;
// 	mouse_y = event.clientY - rect.top;
// });

// addEventListener("keydown", function (event) {
// 	if (event.key === "r") {
// 		console.log(`${mouse_x}, ${mouse_y}`);
// 		click(mouse_x, mouse_y);
// 	}
// });

// setInterval(function () {
// 	click(mouse_x, mouse_y);
// }, 100);

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function handle_menu_item(top_level_menu_index, item_index, submenu_item_index) {
	close_menus();
	triggering_menus = true;
	window.dispatchEvent(new Event("focus")); // make the game think it's focused
	canvas.style.pointerEvents = "none";
	const delay = 100;
	await sleep(delay);
	click(30 + top_level_menu_index * 50, 15);
	await sleep(delay);
	click(30 + top_level_menu_index * 50, 35 + item_index * 16);
	await sleep(delay);
	if (submenu_item_index !== undefined) {
		click(200 + top_level_menu_index * 50, 35 + item_index * 16 + submenu_item_index * 16);
		await sleep(delay);
	}
	canvas.style.pointerEvents = "auto";
	if (!menus_open) {
		stop_freeze_frame();
	}
	triggering_menus = false;
}

var menus = {
	"&Game": [
		{
			item: "&New Game",
			shortcut: "F2",
			action: function () {
				handle_menu_item(0, 0);
			},
		},
		{
			item: "&Launch Ball",
			action: function () {
				handle_menu_item(0, 1);
				// @FIXME: this menu item can be disabled if the game is not started yet
				// so clicking on it can fail and leave the ImGui menu open (ugly)
				// I could detect this by the color of the canvas at a certain point
				// but I should probably look into integrating the menus properly,
				// see how easy it is to compile the game etc. (so far I've gotten away with using the pre-built game)
			},
		},
		{
			item: "&Pause/Resume Game",
			shortcut: "F3",
			action: function () {
				handle_menu_item(0, 2);
			},
		},
		MENU_DIVIDER,
		{
			item: "&High Scores...",
			action: function () {
				// handle_menu_item(0, 3);
				// @TODO: custom window
			},
			enabled: false,
		},
		{
			item: "&Demo",
			action: function () {
				handle_menu_item(0, 4);
			},
		},
		{
			item: "E&xit",
			action: function () {
				window.close();
			},
		},
	],
	"&Options": [
		{
			item: "&Full Screen",
			action: function () {
				if (document.fullscreenElement) {
					document.exitFullscreen();
				} else {
					document.body.requestFullscreen();
				}
			},
		},
		{
			item: "Select &Players",
			submenu: player_counts.map(function (count) {
				return {
					item: `&${count} Player${count > 1 ? "s" : ""}`,
					checkbox: {
						check: function () {
							return current_player_count == count;
						},
						toggle: function () {
							// current_player_count = count;
							// handle_menu_item(1, 0, count - 1);
							// @TODO (doesn't seem to work in this Pinball port)
						},
					},
					enabled: false,
				};
			}),
		},
		MENU_DIVIDER,
		/*
		{
			item: "&Sounds",
			checkbox: {
				check: () => sounds_enabled,
				toggle: () => {
					// sounds_enabled = !sounds_enabled;
					// handle_menu_item(1, 1);
					// @TODO (doesn't seem to work in this Pinball port)
					// (although sounds/music work, to be clear)
				}
			},
			enabled: false,
		},
		{
			item: "&Music",
			checkbox: {
				check: () => music_enabled,
				toggle: () => {
					// music_enabled = !music_enabled;
					// handle_menu_item(1, 2);
					// @TODO (doesn't seem to work in this Pinball port)
					// (although sounds/music work, to be clear)
				}
			},
			enabled: false,
		},
		*/
		{
			item: "&Audio",
			checkbox: {
				check: () => audio_enabled,
				toggle: () => {
					audio_enabled = !audio_enabled;
					if (audio_enabled) {
						unmute_game_audio();
					} else {
						mute_game_audio();
					}
				},
			},
		},
		MENU_DIVIDER,
		{
			item: "P&layer Controls",
			shortcut: "F8",
			action: function () {
				// @TODO
				// handle_menu_item(1, 3.2);
			},
			enabled: false,
		},
	],
	"&Help": [
		{
			item: "&Help Topics",
			shortcut: "F1", // @TODO
			action: function () {
				/* @TODO
				var show_help = window.show_help;
				try {
					show_help = parent.show_help;
				} catch(e) {}
				if (show_help === undefined) {
					return alert("Help Topics only works when inside of the 98.js.org desktop.");
				}
				show_help({
					title: "Pinball Help",
					contentsFile: "help/pinball-help/pinball.hhc",
					root: "help/pinball-help",
				});
				*/
			},
			enabled: false,
		},
		MENU_DIVIDER,
		{
			item: "&About Pinball",
			action: function () {
				// @TODO: about dialog
				window.open("https://github.com/alula/SpaceCadetPinball");
			},
		}
	],
};

var go_outside_frame = false;
if (frameElement) {
	try {
		if (parent.MenuBar) {
			MenuBar = parent.MenuBar;
			go_outside_frame = true;
		}
	} catch (e) { }
}
var menu_bar = new MenuBar(menus);
if (go_outside_frame) {
	frameElement.parentElement.insertBefore(menu_bar.element, frameElement);
} else {
	document.body.prepend(menu_bar.element);
}

function close_menus() {
	menu_bar.closeMenus();
	canvas.focus();
}

// freeze the canvas display while menus are open,
// and as long as ImGui menus are being triggered
const observer = new MutationObserver(function (mutations) {
	menus_open = menu_bar.element.querySelectorAll(".menu-button[aria-expanded='true']").length > 0;
	if (menus_open) {
		start_freeze_frame();
		window.dispatchEvent(new Event("blur")); // make the game think it's blurred
	} else {
		if (document.hasFocus()) {
			window.dispatchEvent(new Event("focus")); // make the game think it's focused
		}
		if (!triggering_menus) {
			// wait for the next frame to unfreeze,
			// otherwise the ImGui menus could be seen for a frame
			// if you click a menu item then quickly open a menu again, and then close it
			setTimeout(() => {
				stop_freeze_frame();
			}, 100);
		}
	}
});
observer.observe(menu_bar.element, {
	attributes: true,
	attributeFilter: ["aria-expanded"],
	subtree: true,
});
