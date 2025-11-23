// why did i do this
const enableAI = false;
export async function getAIResponse(prompt = "") {
  if (!enableAI) {
    await new Promise((resolve) =>
      setTimeout(resolve, 5000 + Math.random() * 2000)
    );
    //return `This is a response to the question "${prompt}"`;
  return prompt
  }

  const response = await fetch(
    `https://writemaster-api.vercel.app/api/ai?prompt=${encodeURIComponent(
      prompt
    )}`
  );

  if (response.error?.code == 429) {
    window.alert(
      "We have reached our rate limit for AI usage, please try again later."
    );
    throw new Error("RATE LIMITED: please try again later shortly.");
  } else if (response.error?.code) {
    window.alert(
      "Encountered unknown errors while prompting the AI, please try again later."
    );
    throw new Error("error :(");
  }

  const data = await response.json();
  console.log(data);
  return data.candidates[0].content.parts[0].text;
}

export class Timer {
  static timeGiven = 0;
  static timeLeft = 0;
  static intervalId = 0;
  static TimerElement = document.getElementById("timer");

  static set(time) {
    this.timeLeft = Date.now() + 1000 * time;
    this.timeGiven = time;
    this.update();
  }

  static start() {
    this.timeLeft = Date.now() + 1000 * this.timeGiven;
    this.intervalId = setInterval(this.update.bind(this), 100);
  }

  static update() {
    // please make variable names more self explanatory :(
    let et = Math.ceil((this.timeLeft - Date.now()) / 1000);
    if (et <= 0) {
      clearInterval(this.intervalId);
      this.TimerElement.innerHTML = "0:00";
      this.TimerElement.style = /*css*/ "color:var(--accent-color)";
      Test.submit();
	  window.alert("Your answers have been automatically submitted because you ran out of time.")
      return;
    } else {
      this.TimerElement.style = "";
    }
  
    let seconds = (et % 60).toString();
    let minutes = (Math.floor(et / 60) % 60).toString();
    let hours = Math.floor(et / 3600).toString();
    if (hours == 0) {
      this.TimerElement.innerHTML = `${minutes}:${seconds.padStart(2, "0")}`;
    } else {
      this.TimerElement.innerHTML = `${hours}:${minutes.padStart(
        2,
        "0"
      )}:${seconds.padStart(2, "0")}`;
    }
  }
}

export class Questions {
  static questions = [];
  static questionsGenerating = 0;
  
  static checkGenerationFinished() {
    this.questionsGenerating--;
    if (this.questionsGenerating > 0) return;
    this.questionsGenerating = 0;
    Test.ready();
  }

  static generateIELTSWriting(test, name) {
    this.questionsGenerating++;
    const section = document.createElement("div");
    const sectionTitle = document.createElement("h3");
    const sectionQuestion = document.createElement("p");
    const sectionTextbox = document.createElement("textarea");
    const sectionResponse = document.createElement("p");
    section.className = "section";
    sectionTitle.innerText = name;
    
    // just found out if you change the indentation there the thing breaks
    getAIResponse(
      `Generate a ${test} ${name} question.
      
  Requirements:
  - Produce *only* the question text. Do not include titles, tips, instructions, greetings, closings, word-count reminders, or any meta commentary.
  - If the task involves data (charts, graphs, trends, comparisons, processes, etc.), represent all data using Markdown tables only. Do not include images, ASCII art, or non-table charts.
  - The question should be fully self-contained and formatted exactly as a standard ${test} ${name} prompt.
  - Do not add anything before or after the question. Output the question alone.`
    ).then((response) => {
      sectionQuestion.innerHTML = marked.parse(response);
      this.questions.push({
        question: response,
        answer: sectionTextbox,
        response: sectionResponse,
      });
      this.checkGenerationFinished();
    });
    
    section.appendChild(sectionTitle);
    section.appendChild(sectionQuestion);
    section.appendChild(sectionTextbox);
    section.appendChild(sectionResponse);
  
    Test.TestBox.appendChild(section);
  }
}

export class Test {
  static ActionButton = document.getElementById("submit_btn");
  static TestBox = document.getElementById("test");
  static Questions = Questions;
  static Timer = Timer;

  static ready() {
    document.getElementById("testrdy").remove();
    document.getElementById("readyMessage").className = "ready";
    this.ActionButton.disabled = false;
  }

  static disable() {
    this.TestBox.querySelectorAll("input, textarea").forEach((e) => {
      e.disabled = true;
    });
  }

  static enable() {
    document.getElementById("test").className = "";
    this.TestBox.querySelectorAll("input, textarea").forEach((e) => {
      e.disabled = false;
    });
  }

  static submit() {
    this.Timer.TimerElement.style = /*css*/ "color:var(--accent-color)";
    clearInterval(this.Timer.intervalId);
    console.log("Test is done!");
    this.disable();
    this.ActionButton.disabled = true;
    this.Questions.questions.forEach((e) => {
      e.response.innerHTML = /*html*/ `<span class="loader"></span>Response generation in progress...`;
      getAIResponse(`Generate a helpful review for the following answer:
  ${e.answer.value}
  The question is:
  ${e.question}
  
  Notes: Please grade the answer with a specific score/band and not just a range. Use the format: "Your band: 1.0" (replace with actual score) for IELTS and "Your score: 100" (replace with actual score) for TOEIC, and place them at THE END of your response. ONLY SAY THE ACTUAL GRADING AND NOT ANYTHING ELSE, NO "here's what your score would've been with my improved essay." 
  **VERY IMPORTANT**: Don't grade too harshly, but not too sparingly either. Rate realisticly and objectively, do not just pick an average-ish score everytime. Thanks.`).then((r) => {
        e.response.innerHTML = /*html*/ `Here's what the AI thinks about your work.<br><div class="response">${marked.parse(
          r
        )}</div>`;
        
        let score = r.match(/Your (score|band): (\d\.\d+|\d+)/i);
        if (score == null) {
          window.alert("the ai messed up and didnt give you a score.");
        } else {
          e.score = score;
        }
      });
    });
  }
}