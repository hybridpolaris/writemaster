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
  ielts_gen: "IELTS",
  ielts_acad: "IELTS Academic",
  toeic: "TOEIC",
};
const params = new URLSearchParams(window.location.search);
const testType = params.get("type");
const testIncludes = params.getAll("include");
document.title = `${translationKeys[testType]} practice - Writemaster`;

let timeLeft = 0; // seconds
let intervalId = 0; // what
const TimerElement = document.getElementById("timer");
function StartTimer(time) {
  timeLeft = Date.now() + 1000 * time;
  intervalId = setInterval(UpdateTimer, 100);
}
const ActionButton = document.getElementById("submit_btn");
const TestBox = document.getElementById("test");
let stage = 0; //0: before 1: during 2: after
function UpdateTimer() {
  // please make variable names more self explanatory :(
  let et = Math.ceil((timeLeft - Date.now()) / 1000);
  if (et <= 0) {
    clearInterval(intervalId);
    TimerElement.innerHTML = "0:00";
    TimerElement.style = /*css*/ "color:var(--accent-color)";
    Submit();
    return;
  } else {
    TimerElement.style = "";
  }

  let seconds = (et % 60).toString();
  let minutes = (Math.floor(et / 60) % 60).toString();
  let hours = Math.floor(et / 3600).toString();
  if (hours == 0) {
    TimerElement.innerHTML = `${minutes}:${seconds.padStart(2, "0")}`;
  } else {
    TimerElement.innerHTML = `${hours}:${minutes.padStart(
      2,
      "0"
    )}:${seconds.padStart(2, "0")}`;
  }
}
ActionButton.addEventListener("click", () => {
  if (stage == 0) {
    stage = 1;
    ActionButton.innerHTML = "Submit";
    TestBox.className = "";
    StartTimer(5 * 60);//can and will be changed later
    enableTest(); 
  } else {
    clearInterval(intervalId);
    TimerElement.style = /*css*/ "color:var(--accent-color)";
    Submit();
  }
});
function ReadyTest() {
  document.getElementById("testrdy").innerHTML = "";
  ActionButton.disabled = false;
}
function disableTest() {
  TestBox.querySelectorAll("input, textarea").forEach((e) => {
    e.disabled = true;
  });
}
disableTest();
function enableTest() {
  TestBox.querySelectorAll("input, textarea").forEach((e) => {
    e.disabled = false;
  });
}
function Submit() {
  stage = 2;
  //tbh idk what should be done here
  //leave that for qh
  console.log("Test is done!");
  alert("uiia");
  disableTest();
  ActionButton.disabled = true;
}
async function getAIResponse(prompt = "") {
  return `This is a response to the question "${prompt}"`;
  const response = await fetch(
    `https://writemaster-api.vercel.app/api/ai?prompt=${encodeURIComponent(
      prompt
    )}`
  );

  if (response.status == 429) {
    window.alert(
      "We have reached our rate limit for AI usage, please try again later."
    );
    throw new Error("RATE LIMITED: please try again later shortly.");
  } else if (!response.ok) {
    window.alert(
      "Encountered unknown errors while prompting the AI, please try again later."
    );
    throw new Error("error :(");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/*getAIResponse(
  `I'm practicing for ${testType}, can you generate a writing question for me? I don't want any tips/directions, as I'd like this to be a sort of mock test. \nNotes: you don't need to provide pictures or anything. Thanks.`
).then((response) => {
  console.log(response);
});
*/
