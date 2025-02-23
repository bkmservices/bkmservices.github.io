let voiceEnabled = false;

function generateChatId() {
    fetch('https://bkmai.pythonanywhere.com/generateChatId')
        .then(response => response.json())
        .then(data => {
            const chatId = data.chatId;
            localStorage.setItem('chatId', chatId);
        })
        .catch(error => console.error('Erreur lors de la génération du Chat ID:', error));
}

function formatMarkdown(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
    text = text.replace(/\*(.*?)\*/g, '<i>$1</i>'); 
    text = text.replace(/\+ (.*?) \+/g, '<ul><li>$1</li></ul>'); 
    return text;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error("Erreur lors de la copie :", err);
    });
}

function sendMessage() {
    const userMessage = document.getElementById('userMessage').value.trim();
    const chatId = localStorage.getItem('chatId');

    if (!chatId || userMessage === "") return;

    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<div class="message user">${userMessage}</div>`;
    document.getElementById('userMessage').value = '';

    fetch(`https://bkmai.pythonanywhere.com/WILLIAM?q=${encodeURIComponent(userMessage)}&userId=${encodeURIComponent(chatId)}`)
        .then(response => response.json())
        .then(data => {
            const formattedResponse = formatMarkdown(data.response);
            chatBox.innerHTML += `
                <div class="message bot">
                    ${formattedResponse}
                    <button class="copy-btn" onclick="copyToClipboard('${data.response.replace(/'/g, "\\'")}')"></button>
                </div>
            `;
            chatBox.scrollTop = chatBox.scrollHeight;

            if (voiceEnabled) {
                readMessage(data.response);
            }
        })
        .catch(error => console.error('Erreur lors de l\'envoi du message:', error));
}

function startVoice() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "fr-FR";
    recognition.start();

    recognition.onresult = (event) => {
        document.getElementById('userMessage').value = event.results[0][0].transcript;
    };
}

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    alert(voiceEnabled ? "Lecture activée" : "Lecture désactivée");
}

function readMessage(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "fr-FR";
    window.speechSynthesis.speak(speech);
}

if (!localStorage.getItem('chatId')) {
    generateChatId();
}

// Modal "À propos"
function showAbout() {
    document.getElementById('aboutModal').style.display = 'flex';
}

function closeAbout() {
    document.getElementById('aboutModal').style.display = 'none';
}
