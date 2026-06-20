import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMcNj2siTJDQdC8Hea5vdZUHZBgljUxJA",
  authDomain: "argon-anonymous.firebaseapp.com",
  databaseURL: "https://argon-anonymous-default-rtdb.firebaseio.com",
  projectId: "argon-anonymous",
  storageBucket: "argon-anonymous.firebasestorage.app",
  messagingSenderId: "324975740153",
  appId: "1:324975740153:web:7efbb4300c1a0ee6d50e28",
  measurementId: "G-69W0B7Y7YL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "argon_feedback");

const feed = document.getElementById('feed');
const dayBar = document.getElementById('dayBar');
const input = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const statusLine = document.getElementById('statusLine');

let allMessages = [];
let selectedDayKey = null;

function dayKeyFor(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function dayLabelFor(key) {
  const todayKey = dayKeyFor(new Date());
  const yestKey = dayKeyFor(new Date(Date.now() - 86400000));
  if (key === todayKey) return 'Today';
  if (key === yestKey) return 'Yesterday';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function timeLabelFor(date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function showStatus(text) {
  statusLine.textContent = text;
}

function getDayGroups() {
  const groups = {};
  allMessages.forEach(m => {
    const k = dayKeyFor(m.date);
    if (!groups[k]) groups[k] = [];
    groups[k].push(m);
  });
  return groups;
}

function buildDayBar() {
  const groups = getDayGroups();
  const keys = Object.keys(groups).sort().reverse();
  const todayKey = dayKeyFor(new Date());

  if (!keys.includes(todayKey)) keys.unshift(todayKey);
  if (!selectedDayKey || !keys.includes(selectedDayKey)) selectedDayKey = todayKey;

  dayBar.innerHTML = '';
  keys.forEach(key => {
    const btn = document.createElement('button');
    btn.className = 'day-pill' + (key === selectedDayKey ? ' active' : '');
    const count = groups[key] ? groups[key].length : 0;
    btn.innerHTML = dayLabelFor(key) + (count > 0 ? `<span class="count">${count}</span>` : '');
    btn.addEventListener('click', () => {
      selectedDayKey = key;
      buildDayBar();
      renderFeed();
    });
    dayBar.appendChild(btn);
  });
}

function renderFeed() {
  const groups = getDayGroups();
  const dayMsgs = (groups[selectedDayKey] || []).slice().sort((a, b) => a.date - b.date);

  feed.innerHTML = '';

  if (dayMsgs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'argon-empty';
    empty.textContent = 'No messages on this day yet.';
    feed.appendChild(empty);
    return;
  }

  dayMsgs.forEach(m => {
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    const p = document.createElement('p');
    p.className = 'msg-text';
    p.textContent = m.text;
    const t = document.createElement('p');
    t.className = 'msg-time';
    t.textContent = timeLabelFor(m.date);
    bubble.appendChild(p);
    bubble.appendChild(t);
    feed.appendChild(bubble);
  });

  feed.scrollTop = feed.scrollHeight;
}

// Real-time listener: updates instantly for everyone when any message is added
const q = query(messagesRef, orderBy("createdAt", "asc"));
onSnapshot(q, (snapshot) => {
  allMessages = snapshot.docs.map(doc => {
    const data = doc.data();
    const date = data.createdAt ? data.createdAt.toDate() : new Date();
    return { text: data.text, date };
  });
  buildDayBar();
  renderFeed();
}, (error) => {
  showStatus('Could not connect. Check your Firebase setup.');
  console.error(error);
});

async function handleSend() {
  const text = input.value.trim();
  if (!text) return;

  sendBtn.disabled = true;
  try {
    await addDoc(messagesRef, {
      text: text,
      createdAt: serverTimestamp()
    });
    input.value = '';
    input.style.height = 'auto';
    selectedDayKey = dayKeyFor(new Date());
    showStatus('');
  } catch (e) {
    showStatus('Could not send. Please try again.');
    console.error(e);
  }
  sendBtn.disabled = false;
  input.focus();
}

sendBtn.addEventListener('click', handleSend);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 110) + 'px';
});




// CHOOSE TAB

const btn1 = document.querySelector('.btn1');
const btn2 = document.querySelector('.btn2');
const groupChat = document.querySelector('.group-chat');
const feedback = document.querySelector('.daily-feedback');
btn1.addEventListener('click', ()=>{
  if(!btn1.classList.contains('selected')){
    btn1.classList.toggle('selected');
    btn2.classList.toggle('selected');
    
    groupChat.style.display = 'block';
    feedback.style.display = 'none';
  }
})
btn2.addEventListener('click', ()=>{
  if(!btn2.classList.contains('selected')){
    btn1.classList.toggle('selected');
    btn2.classList.toggle('selected');

    groupChat.style.display = 'none';
    feedback.style.display = 'block';
  }
});



// FOR UPDATING STREAK COUNT
const streakCountContainer = document.getElementById('streak');

let streakCount = (localStorage.getItem('streakCount') || 0);

function updateStreakCount() {
  streakCount = (localStorage.getItem('streakCount') || 0);
  streakCountContainer.textContent = streakCount
} 
updateStreakCount();




// SUBMITTING RESPONSES

const responsesRef = collection(db, "argon_survey_responses");

async function submitSurveyAnswers(answers) {
  try {
    await addDoc(responsesRef, {
      answers: answers,
      submittedAt: serverTimestamp()
    });
    return true; // success
  } catch (e) {
    console.error("Failed to submit survey:", e);
    return false; 
  }
}


const responses = [

];

const question = [
  '🌟 What win or achievement are you grateful for today?',
  '💭 What challenge or frustration did you face today?',
  '📖 What lesson did God teach you today?',
  '🤝 Do you need advice, encouragement, or accountability in any area?',
  '💚 Is there anything you\'d like shared anonymously to encourage the community? ',
  '🎯 What is one area you would like to improve or be intentional about?',
  '🙏 Is there anything you would like the community to pray with you about?'
];

const inputResponses = 
document.querySelectorAll('.questions input');

const submitBtn = document.querySelector('.sub-btn');

let emptyField = false;
let compiledResponse = [];
const answerArray = [];
let today = new Date().toLocaleDateString();
let lastUpdated = (localStorage.getItem("lastUpdated") || "");

// CHECKING IF UPDATED TODAY;

const updatedToday = document.querySelector('.updated-today')
const questionsSub = document.querySelector('.questions-sub')

function checkIfUpdated() {
  if (lastUpdated === today) {
    updatedToday.style.display = 'block'
    questionsSub.style.display = 'none'
  }
}
checkIfUpdated();


submitBtn.addEventListener('click', async ()=>{
  emptyField = false;
  responses.length = 0; // reset so old answers don't pile up on repeated submissions

  inputResponses.forEach((input)=>{
    if(input.value === ''){
      emptyField=true;
    }else{
      responses.push(input.value);
    }
  });

  if (emptyField){
    alert("Fill a Fields");
  }else{
    compiledResponse.length = 0; // reset this too, same reason
    for (let i = 0; i < question.length; i++) {
      compiledResponse.push({
        id: i,
        question: question[i],
        answer: responses[i]
      })
    }

    submitBtn.disabled = true; // prevent double-click double-submits while waiting

    const success = await submitSurveyAnswers(compiledResponse);

    if (success) {
      lastUpdated = today;
      localStorage.setItem("lastUpdated", lastUpdated);
      streakCount++;
      localStorage.setItem('streakCount', streakCount);
      updateStreakCount();
      checkIfUpdated();
      alert("Thank you! Your responses were submitted anonymously.");
    } else {
      alert("Something went wrong. Please try again.");
    }

    submitBtn.disabled = false;
  }
})




