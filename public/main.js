const socket = io();

const clientsTotal = document.getElementById('client-total');

const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatContainer = document.getElementById('chatContainer');
const feedback = document.getElementById('feedback');

const messageTone = new Audio('/messagetone.mp3');

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
})

socket.on('clients-total', (data) => {
    // console.log(data);
    clientsTotal.innerHTML = `Total Clients: ${data}`
})

function sendMessage(){
    // console.log(messageInput.value);
    if(messageInput.value === '') return;
    const data = {
        name: nameInput.value,
        message: messageInput.value,
    }

    socket.emit('message', data);
    addMessageToUI(true, data)

    messageInput.value = '';
    clearFeedback();
}

socket.on('chat-message', (data) => {
    addMessageToUI(false, data);

    // Play the sound only if the user has interacted
    try {
        messageTone.play().catch(error => {
            console.warn("Audio play blocked:", error);
        });
    } catch (error) {
        console.warn("Audio play error:", error);
    }
});

function addMessageToUI(isOwnMessage, data){
    clearFeedback();
    const element = `
        <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
            <p class="message">
              ${data.message}
              <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
            </p>
        </li>
    `

    messageContainer.innerHTML += element
    scrollToBottom();
}

function scrollToBottom() {
    setTimeout(() => {
        const lastMessage = messageContainer.lastElementChild;
        if (lastMessage) {
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, 100);
}

let typingTimer;
messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', {
        feedback: `🙋🏼‍♂️ ${nameInput.value} is typing a message ... `
    });
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit('feedback', {
            feedback: ''
        })
    }, 1500);
})

messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
        feedback: ''
    })
})


socket.on('feedback', (data) => {
    clearFeedback();
    if (data.feedback.trim() !== "") {
        const feedbackElement = document.createElement('li');
        feedbackElement.classList.add('message-feedback');
        feedbackElement.innerHTML = `<p class="feedback">${data.feedback}</p>`;
        messageContainer.appendChild(feedbackElement);
        scrollToBottom();
    }
});

function clearFeedback(){
    document.querySelectorAll('li.message-feedback').forEach(element => {
        element.parentNode.removeChild(element)
    })
}
