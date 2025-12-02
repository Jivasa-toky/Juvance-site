// gemini.js (ADJUSTED)

let conversationHistory = [];

async function askGemini(userQuestion) {
    const endpoint = '/api/ask_gemini'; 
    const outputElement = document.getElementById('gemini-output');

    const loadingId = `loading-${Date.now()}`;
    outputElement.innerHTML += `<div id="${loadingId}" class="loading-message">
        Sending message... Loading response...
    </div>`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: userQuestion, history: conversationHistory })
        });

        // 🔑 Backend now returns { answer: "...", isStructured: true/false }
        const data = await response.json(); 

        const loadingIndicator = document.getElementById(loadingId);
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        if (response.ok) {
            let analysisText = "";
            let geminiCode = "";

            // 💡 CRITICAL: Conditionally handle structured vs. plain text response
            if (data.isStructured) {
                const rawJsonString = data.answer;
                try {
                    const structuredResponse = JSON.parse(rawJsonString);
                    analysisText = structuredResponse.analysis_summary || "No summary provided.";
                    geminiCode = structuredResponse.suggested_code || "No code provided.";
                } catch (e) {
                    console.error("Failed to parse JSON:", rawJsonString);
                    outputElement.innerHTML += `<div class="error-message">
                        <strong>Parsing Error:</strong> Could not parse structured JSON.
                    </div><hr>`;
                    return;
                }
            } else {
                // Handle plain text response for conversational messages ("hey")
                analysisText = data.answer;
                geminiCode = "N/A - Conversational response.";
            }

            // 4. DISPLAY: Append the user's question
            outputElement.innerHTML += `<div class="user-message">
                <strong>You:</strong> ${userQuestion.length > 200 ? 'HTML Content Sent' : userQuestion}
            </div>`;

            // 5. DISPLAY: Use element creation and textContent for safe code display
            const messageDiv = document.createElement('div');
            messageDiv.className = 'gemini-message';

            if (data.isStructured) {
                // Display the structured format (Summary + Code Block)
                messageDiv.innerHTML = `
                    <strong>Analysis Summary:</strong>
                    <p>${analysisText}</p>
                    <strong>Suggested Code:</strong>
                    <pre><code class="copyable-code"></code></pre>
                `;
                const codeElement = messageDiv.querySelector('.copyable-code');
                if (codeElement) {
                    codeElement.textContent = geminiCode; 
                }
            } else {
                // Display the plain text format (Just the answer)
                messageDiv.innerHTML = `
                    <strong>Gemini:</strong>
                    <p>${analysisText}</p>
                `;
            }


            outputElement.appendChild(messageDiv);
            outputElement.innerHTML += `<hr>`;

            // 6. HISTORY: Store the full message, whether it was JSON or plain text
            conversationHistory.push({ role: 'user', parts: [{ text: userQuestion }] });
            conversationHistory.push({ role: 'model', parts: [{ text: data.answer }] });

        } else {
            outputElement.innerHTML += `<div class="error-message"><strong>Error:</strong> ${data.error}</div><hr>`; 
        }

    } catch (error) {
        const loadingIndicator = document.getElementById(loadingId);
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        outputElement.innerHTML += `<div class="error-message">
            <strong>Network Error:</strong> Could not connect to the server.
        </div><hr>`;
    }
}


function analyzePageWithGemini() {
    const outputElement = document.getElementById('gemini-output');

    if (conversationHistory.length === 0) {
        const pageContent = document.documentElement.outerHTML;
        // This specific, long prompt is used by the backend to trigger IS_ANALYSIS_REQUEST = true
        const prompt = `Perform the initial web design and UX analysis on this HTML content: ${pageContent} and give the suggested full code for the best suggested improvement, don't add any JavaScript code in it.`;

        askGemini(prompt);
    } else {
        outputElement.innerHTML += `<div class="system-note">
            <strong>Note:</strong> The analysis is underway. Type your follow-up question into the text box and click <strong>"Send Message"</strong> to continue this conversation.
        </div><hr>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const analyzeButton = document.getElementById("analyzePage");
    if (analyzeButton) {
        analyzeButton.addEventListener("click", analyzePageWithGemini);
    }
});