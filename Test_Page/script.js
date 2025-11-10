var selected = localStorage.getItem("theme");
selected = selected ?? "light";
if (selected == "dark") {
  document.body.className = "dark-mode";
} else if (selected == "light") {
  document.body.className = "";
} else {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.className = "dark-mode";
  } else {
    document.body.className = "";
  }
}
document.getElementById("data").innerHTML = /*html*/ `
Type of test: ${sessionStorage.getItem("type")}<br>
Include listening: ${sessionStorage.getItem("listening")}<br>
Include writing: ${sessionStorage.getItem("writing")}<br>
Include reading: ${sessionStorage.getItem("reading")}<br>
Target: ${sessionStorage.getItem("target") ?? "none"}<br>
`;
let t = 0;
let id = 0;
const TimerElement = document.getElementById("timer");
function StartTimer(time) {
  //time is in seconds
  t = Date.now() + 1000 * time;
  id = setInterval(UpdateTimer, 100);
}
function UpdateTimer() {
  let et = Math.ceil((t - Date.now()) / 1000);
  if (et <= 0) {
    clearInterval(id);
    TimerElement.innerHTML = "0:00";
    TimerElement.style = /*css*/ "color:var(--accent-color)";
    return;
  } else {
    TimerElement.style = "";
  }
  let s = (et % 60).toString();
  let m = (Math.floor(et / 60) % 60).toString();
  let h = Math.floor(et / 3600).toString();
  if (h == 0) {
    TimerElement.innerHTML = `${m}:${s.padStart(2, "0")}`;
  } else {
    TimerElement.innerHTML = `${h}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
  }
}
