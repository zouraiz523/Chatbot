// script.js

// ! API Configuration
const API_KEY = ""; // ! Replace with your actual API key
const API_URL = ``;

// * DOM Elements
const messagesDiv = document.getElementById('messages'); // * Chat messages container
const messageInput = document.getElementById('messageInput'); // * Input field for user messages
const voiceBtn = document.getElementById('voiceBtn'); // * Button for voice input
const scrollBtn = document.getElementById('scrollBtn'); // * Button to scroll to the bottom of the chat

// ? Adds a message to the chat
function addMessage(message, isUser = false, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message'); // ? Different styles for user and bot messages
    if (isTyping) messageDiv.classList.add('typing-indicator'); // ? Typing indicator for bot
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    scrollToBottom(); // * Auto-scroll to the bottom
    updateScrollButton(); // * Update scroll button visibility
}

// ? Shows a typing indicator for the bot
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
    typingDiv.textContent = 'Typing...'; // * Placeholder text for typing
    typingDiv.id = 'typing';
    messagesDiv.appendChild(typingDiv);
    scrollToBottom();
}

// ? Removes the typing indicator
function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing');
    if (typingDiv) typingDiv.remove();
}

// ? Sends a message to the API and handles the response
async function sendMessage() {
    const message = messageInput.value.trim(); // * Get user input

    if (!message) return; // ! Do nothing if input is empty

    addMessage(message, true); // * Add user message to chat
    messageInput.value = ''; // * Clear input field
    showTypingIndicator(); // * Show bot typing indicator

    try {
        const response = await callGeminiAPI(message); // * Call the API
        removeTypingIndicator(); // * Remove typing indicator
        addMessage(response); // * Add bot response to chat
    } catch (error) {
        removeTypingIndicator(); // * Remove typing indicator on error
        addMessage(`Oops! Something went wrong: ${error.message}`); // ! Display error message
    }
}

// ? Calls the Gemini API with the user's message
async function callGeminiAPI(message) {
    const requestBody = {
        contents: [{
            parts: [{
                text: message // * User message
            }]
        }]
    };

    const response = await fetch(API_URL, {
        method: 'POST', // * HTTP POST request
        headers: {
            'Content-Type': 'application/json', // * JSON content type
        },
        body: JSON.stringify(requestBody) // * Request payload
    });

    if (!response.ok) {
        throw new Error('API request failed'); // ! Handle API errors
    }

    const data = await response.json(); // * Parse JSON response
    return data.candidates[0].content.parts[0].text; // * Extract bot response
}

// ? Starts voice recognition for input
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) { // ! Check browser support
        addMessage('Sorry, your browser doesn’t support voice input.');
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // * Single result mode
    recognition.interimResults = false; // * No interim results

    recognition.onstart = () => {
        voiceBtn.classList.add('recording'); // * Indicate recording state
        addMessage('Listening to your voice...');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript; // * Get recognized text
        messageInput.value = transcript; // * Set input field
        sendMessage(); // * Send message
    };

    recognition.onerror = (event) => {
        addMessage(`Voice input failed: ${event.error}`); // ! Handle errors
        voiceBtn.classList.remove('recording');
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('recording'); // * End recording state
        addMessage('Voice input complete!');
    };

    recognition.start(); // * Start recognition
}

// ? Clears the chat history
function clearChat() {
    messagesDiv.innerHTML = ''; // * Remove all messages
    scrollBtn.style.display = 'none'; // * Hide scroll button
}

// ? Scrolls the chat to the bottom
function scrollToBottom() {
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight, // * Scroll to the bottom
        behavior: 'smooth' // * Smooth scrolling
    });
}

// ? Updates the visibility of the scroll button
function updateScrollButton() {
    const isScrolledToBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight < 1;
    scrollBtn.style.display = isScrolledToBottom ? 'none' : 'flex'; // * Show/hide button
}

// * Event Listeners
messagesDiv.addEventListener('scroll', updateScrollButton); // * Update scroll button on scroll

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { // * Send message on Enter key
        sendMessage();
    }
});