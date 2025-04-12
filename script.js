// Local Storage Keys
const STORAGE_KEYS = {
    API_KEY: 'openai_api_key',
    HTML_CONTENT: 'html_content',
    CONVERSATION_HISTORY: 'conversation_history'
};

// Default HTML content
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
    <title>My Web Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <h1>Welcome to My Web Page</h1>
    <p>This is a sample paragraph. Edit me!</p>
</body>
</html>`;

// DOM Elements
const htmlEditor = document.getElementById('htmlEditor');
const preview = document.getElementById('preview');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');
const runButton = document.getElementById('runButton');
const previewToggle = document.getElementById('previewToggle');
const fullPreview = document.getElementById('fullPreview');
const fullPreviewFrame = document.getElementById('fullPreviewFrame');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeyStatus = document.getElementById('apiKeyStatus');

// Initialize the editor
function initializeEditor() {
    // Load saved content or use default
    const savedContent = localStorage.getItem(STORAGE_KEYS.HTML_CONTENT);
    htmlEditor.value = savedContent || DEFAULT_HTML;
    
    // Load saved API key
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        apiKeyStatus.classList.add('valid');
    }
    
    // Load conversation history
    const savedHistory = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
    if (savedHistory) {
        const history = JSON.parse(savedHistory);
        history.forEach(msg => {
            addMessage(msg.content, msg.role === 'user');
        });
    }
    
    // Update preview
    updatePreview();
    
    // Add event listeners
    htmlEditor.addEventListener('input', () => {
        saveContent();
    });

    previewToggle.addEventListener('change', () => {
        if (previewToggle.checked) {
            fullPreview.style.display = 'block';
            fullPreviewFrame.srcdoc = htmlEditor.value;
        } else {
            fullPreview.style.display = 'none';
        }
    });

    // Add chat input listener
    sendMessage.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            handleChatMessage(message);
            chatInput.value = '';
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = chatInput.value.trim();
            if (message) {
                handleChatMessage(message);
                chatInput.value = '';
            }
        }
    });
}

// Update the preview with visual feedback
function updatePreview() {
    // Add visual feedback
    preview.classList.add('opacity-50');
    runButton.classList.add('animate-pulse');
    
    // Create an iframe to isolate the preview
    const iframe = document.createElement('iframe');
    iframe.srcdoc = htmlEditor.value;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // Clear and update the preview
    preview.innerHTML = '';
    preview.appendChild(iframe);

    // Update full preview if it's visible
    if (previewToggle.checked) {
        fullPreviewFrame.srcdoc = htmlEditor.value;
    }
    
    // Remove visual feedback after a short delay
    setTimeout(() => {
        preview.classList.remove('opacity-50');
        runButton.classList.remove('animate-pulse');
    }, 300);
}

// Save content to localStorage
function saveContent() {
    localStorage.setItem(STORAGE_KEYS.HTML_CONTENT, htmlEditor.value);
}

// Add message to chat
function addMessage(content, isUser = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add loading spinner
function addLoadingSpinner() {
    const spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'message assistant-message flex items-center gap-2';
    spinnerDiv.innerHTML = `
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span>Thinking...</span>
    `;
    chatMessages.appendChild(spinnerDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return spinnerDiv;
}

// Remove loading spinner
function removeLoadingSpinner(spinnerDiv) {
    spinnerDiv.remove();
}

// Clean up AI response by removing code blocks
function cleanAIResponse(response) {
    // Split the response into chat message and code updates
    const parts = response.split('CODE UPDATES:');
    const chatMessage = parts[0].replace('CHAT MESSAGE:', '').trim();
    
    // If there's no code updates section, return the cleaned chat message
    if (parts.length === 1) {
        return chatMessage;
    }
    
    return chatMessage;
}

// Handle chat message
async function handleChatMessage(message) {
    addMessage(message, true);
    
    // Get API key from localStorage
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (!apiKey) {
        addMessage("Please enter a valid OpenAI API key!", false);
        return;
    }

    const spinner = addLoadingSpinner();

    try {
        // Get conversation history
        const savedHistory = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
        const conversationHistory = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Prepare messages array with system message and conversation history
        const messages = [
            {
                role: 'system',
                content: `You are an HTML coding assistant. Your responses MUST follow this EXACT format:

CHAT MESSAGE:
[Your explanation of the changes you're making. Be clear and concise. Do NOT include any code here.]
CODE UPDATES:
[CODE UPDATES HERE]

RULES:
1. You MUST include both CHAT MESSAGE and CODE UPDATES sections
2. The CHAT MESSAGE must end with "CODE UPDATES:"
3. Never include code in the CHAT MESSAGE section
4. Always provide complete, valid HTML in the CODE UPDATES section
5. For external resources (like Google Fonts), include the full link tag
6. Make sure all code is properly formatted and indented`
            }
        ];

        // Add conversation history
        conversationHistory.forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add current message
        messages.push({
            role: 'user',
            content: `Current HTML code:\n${htmlEditor.value}\n\nUser question: ${message}`
        });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 5000
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const assistantMessage = data.choices[0].message.content;
        console.log('Full AI Response:', assistantMessage);
        
        // Remove loading spinner
        removeLoadingSpinner(spinner);
        
        // Add cleaned message to chat
        const chatMessage = cleanAIResponse(assistantMessage);
        console.log('Cleaned Chat Message:', chatMessage);
        addMessage(chatMessage, false);

        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: chatMessage }
        );
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(conversationHistory));

        // Handle code updates
        if (assistantMessage.includes('CODE UPDATES:')) {
            const codeUpdates = assistantMessage.split('CODE UPDATES:')[1].trim();
            console.log('Code Updates Section:', codeUpdates);
            
            let newCode = htmlEditor.value;
            let updatesMade = false;
            
            // Check for full page update
            const fullPageMatch = codeUpdates.match(/```html\n([\s\S]*?)\n```/);
            if (fullPageMatch) {
                console.log('Found full page update');
                newCode = fullPageMatch[1];
                updatesMade = true;
            }
            
            // Check for head update
            const headMatch = codeUpdates.match(/```html:head\n([\s\S]*?)\n```/);
            if (headMatch) {
                console.log('Found head update');
                const headContent = headMatch[1];
                newCode = newCode.replace(/<head>[\s\S]*?<\/head>/, `<head>\n${headContent}\n</head>`);
                updatesMade = true;
            }
            
            // Check for body update
            const bodyMatch = codeUpdates.match(/```html:body\n([\s\S]*?)\n```/);
            if (bodyMatch) {
                console.log('Found body update');
                const bodyContent = bodyMatch[1];
                newCode = newCode.replace(/<body>[\s\S]*?<\/body>/, `<body>\n${bodyContent}\n</body>`);
                updatesMade = true;
            }
            
            // Check for style update
            const styleMatch = codeUpdates.match(/```html:style\n([\s\S]*?)\n```/);
            if (styleMatch) {
                console.log('Found style update');
                const styleContent = styleMatch[1];
                if (newCode.includes('<style>')) {
                    newCode = newCode.replace(/<style>[\s\S]*?<\/style>/, `<style>\n${styleContent}\n</style>`);
                } else {
                    // If no style tag exists, add it in the head
                    newCode = newCode.replace(/<head>/, `<head>\n<style>\n${styleContent}\n</style>`);
                }
                updatesMade = true;
            }
            
            if (updatesMade) {
                console.log('Applying code updates');
                htmlEditor.value = newCode;
                updatePreview();
                saveContent();
            } else {
                console.log('No code updates found in response');
            }
        } else {
            console.log('No CODE UPDATES section found in response');
        }

    } catch (error) {
        console.error('Error:', error);
        removeLoadingSpinner(spinner);
        addMessage(`Error: ${error.message}`, false);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    
    // Add Run button event listener
    runButton.addEventListener('click', () => {
        updatePreview();
    });

    // Add save API key button listener
    const saveApiKey = document.getElementById('saveApiKey');
    saveApiKey.addEventListener('click', () => {
        const apiKey = apiKeyInput.value;
        localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
        apiKeyStatus.classList.add('valid');
    });
}); 