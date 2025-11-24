const enableAI = false;

export async function getAIResponse(prompt = "") {
  if (!enableAI) {
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 1000)
    );
    return `This is a response to the question "${prompt}"`;
    //return prompt;
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
  static TimerElement = document.getElementById("timer");
  static intervalId;
  static timeGiven = 0;
  static timeLeft = 0;

  static set(time) {
    this.timeLeft = Date.now() + 1000 * time;
    this.update();
    this.timeGiven = time;
  }
    
  static start() {
    this.timeLeft = Date.now() + 1000 * this.timeGiven;
    this.intervalId = setInterval(this.update.bind(this), 100);
    // setInterval makes "this" keyword no longer refer to what it used to iirc
    // binding so it does
  }

  static update() {
    let et = Math.ceil((this.timeLeft - Date.now()) / 1000);
    if (et <= 0) {
      this.TimerElement.innerHTML = "0:00";
      this.TimerElement.style = /*css*/ "color:var(--accent-color)";
      Test.submit();
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
  static questionsLeftToGenerate = 0;

  static checkGenerationFinished() {
    this.questionsLeftToGenerate--;
    this.questionsLeftToGenerate <= 0 && Test.ready();
  }

  static generateWriting(name, test) {
    this.questionsLeftToGenerate++;
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
- Output **only** the question text and its required reading passage**. Do **not** include titles, explanations, tips, instructions, greetings, closings, or meta commentary.
- The response **must** begin with **only** the full reading passage (which means you musn't put the question/requirement here), followed by a markdown line break (three dashes, like this: \`---\`) padded with new lines both before and after, followed by the question.  
- If the task involves data (charts, graphs, comparisons, processes, etc.), represent all data **only** using Markdown tables. Do not use images, ASCII, or non-table charts
- The passage and questions must be fully self-contained and formatted exactly like a standard ${test} ${name} prompt.
- Do not add anything before or after the passage + question text.
- Output the **complete** passage and question text, and nothing else.
- If the response is long, continue until all required content is produced. Do **not** stop early or truncate the output.`
    ).then((response) => {
      sectionQuestion.innerHTML = marked.parse(response);
      Test.Questions.questions.push({
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
  
    document.getElementById("test").appendChild(section);
  }
}

export class Test {
  static ActionButton = document.getElementById("submit_btn");
  static TestBox = document.getElementById("test");
  static Timer = Timer;
  static Questions = Questions;

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
    let avgScore = 0;
    let count = 0;
    let generated = 0;

    this.Timer.TimerElement.style = /*css*/ "color:var(--accent-color)";
    clearInterval(this.Timer.intervalId);
    console.log("Test is done!");
    Test.disable();
    this.ActionButton.disabled = true;
    this.Questions.questions.forEach((e) => {
      generated++;
      e.response.innerHTML = /*html*/ `<span class="loader"></span>Response generation in progress...`;
  
      getAIResponse(`Generate a helpful review for the following answer:\n
${e.answer.value}\n
The question is:\n
${e.question}\n\n
Requirements:
- Evaluate the quality, clarity, correctness, and completeness of the answer.
- Provide a brief constructive review.
- At the end, output exactly one integer score from 0 to 100 in the format: "Your band: X.X" for IELTS, OR "Your score: XXX" for TOEIC.
- No other scoring formats or text after the score.
- Be fair but not harsh.`).then((r) => {
        e.response.innerHTML = /*html*/ `Here's what the AI thinks about your work.<br><div class="response">${marked.parse(
          r
        )}</div>`;

        let match = r.match(/Your (band|score):\s*(\d+|\d\.\d)/i);
        if (!enableAI) {
          // fake data!1111!!!!!!!11!1!
          match = [
            'stuff',
            'band',
            69
          ]
          // funny haha number if no ai
        }
        e.score = parseInt(match[2]);
        avgScore += e.score;
        count++;
        generated--;

        if (generated == 0) {
          avgScore /= count;
          let scoreElement = document.createElement("h1");
          scoreElement.innerHTML = `Your score is <code>${avgScore.toFixed(
            1
          )}<small>/100</small></code>, corresponding to a ${
            match[1] == "score" /* if it said score, thats TOEIC */
              ? `score of <code>${Math.floor(avgScore * 10)}</code>`
              : `band of <code>${(Math.floor(avgScore * 0.9) / 10).toFixed(
                1
              )
            }</code>`
          }`
          this.TestBox.appendChild(scoreElement);
        }
      });
    });
  }
}