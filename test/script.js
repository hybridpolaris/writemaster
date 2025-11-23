import {Test} from "./test.js"

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

const translationKeys = {
  ielts_gen: "General Training IELTS",
  ielts_acad: "Academic IELTS",
  toeic: "TOEIC",
};

const params = new URLSearchParams(window.location.search);
const testType = params.get("type");
const testIncludes = params.get("include").split(" ");
document.title = `${translationKeys[testType]} practice - Writemaster`;
if (!(testType in translationKeys) || testIncludes == []) {
  window.location.href = "/";
}

let stage = 0;
Test.ActionButton.addEventListener("click", () => {
  if (stage == 0) {
    stage = 1;
    document.getElementById("readyMessage").remove();
    Test.ActionButton.innerHTML = "Submit";
    Test.TestBox.className = "";
    Test.Timer.start();
    Test.enable();
  } else {
    if (!window.confirm("Are you sure you want to submit?")) return;
	stage = 2;
	Test.submit();
  }
});

/*on start */
document.getElementById("title").innerText = `${translationKeys[testType].toUpperCase()} PRACTICE TEST`;
if (testType != "toeic") {
  let time = 0;
  if (testIncludes.includes("writing1")) {
    Test.Questions.generateIELTSWriting(translationKeys[testType], "Writing Task 1");
    time += 20 * 60; // 20 minutes
  }
  if (testIncludes.includes("writing2")) {
    Test.Questions.generateIELTSWriting(translationKeys[testType], "Writing Task 2");
    time += 40 * 60; // 40 minutes
  }
  Test.Timer.set(time);
}

window.Test = Test;