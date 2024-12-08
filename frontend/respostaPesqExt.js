async function sendUpvote(answer_id) {
    console.log("test")
    const response = await fetch(`https://ragatanga.onrender.com/upvote/${answer_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('user')}`,  // Ensure userToken is defined
        },
    });
    location.reload()
}

document.addEventListener("DOMContentLoaded", () => {
    getAnswer()

    async function getAnswer() {

        async function loadQuestion() {
            const userToken = localStorage.getItem("user");

            try {

                const response = await fetch(`https://ragatanga.onrender.com/getQuestion/${localStorage.getItem("question_id")}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userToken}`,
                    },
                });

                if (response.status == (401)) {
                    window.location.replace("/");
                }

                if (!response.ok) {
                    console.error("Failed to fetch questions:", response.statusText);
                    return;
                }

                const data = await response.json();
                console.log(data)

                const isAnswered = data.closed ? 1 : 0;
                console.log("existo")
                document.getElementById("questionContainer").innerHTML = `
                    <a href="areaAcademica.html" class="back-button">
                <svg style="width:24px;height:24px;fill:#2e7d32;" viewBox="0 0 24 24">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Voltar para pesquisa e extensão
            </a>
                        <div class="question-full">
                <div class="metadata-bar">
                    <span class="subject-tag">${data.subjects[0]}</span>
                    <span class="question-meta">Perguntado há ${ResponseTime(data.created_at
                )}</span>
                </div>

                <div class="user-info">
                    <div class="user-avatar">
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <span class="user-name">${data.user_name}</span>
                </div>

                <h1 class="question-title">${data.title}</h1>
                <h2 class="question-subtitle">${data.subtitle}
                </h2>

                <div class="question-description">
                    <p>${data.question_description}
                    
                </div>
            </div>

            <div class="reply-section">
                <button class="reply-button" onclick="toggleReplyEditor()">
                    Responder
                </button>

                <div id="replyEditor" style="display: none;">
                    <textarea id="replyText" placeholder="Digite sua resposta aqui..." rows="6"
                        style="width: 100%; margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; resize: vertical;"></textarea>
                    <div class="reply-buttons">
                        <button class="clear-button" onclick="clearReply()">Limpar</button>
                        <button class="submit-button" onclick="submitReply()">Enviar</button>
                    </div>
                </div>
            </div>
                    `;
            } catch (error) {
                console.error("Error loading questions:", error);
            }
        }

        loadQuestion();
    }





    answerField = `
    <div class="reply-section">
                <button class="reply-button" onclick="toggleReplyEditor()">
                    Responder
                </button>

                <div id="replyEditor" style="display: none;">
                    <textarea id="replyText" placeholder="Digite sua resposta aqui..." rows="6"
                        style="width: 100%; margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; resize: vertical;"></textarea>
                    <div class="reply-buttons">
                        <button class="clear-button" onclick="clearReply()">Limpar</button>
                        <button class="submit-button" onclick="submitReply()">Enviar</button>
                    </div>
                </div>
            </div>
            `

    async function getAnswers() {
        try {
            const response = await fetch(`https://ragatanga.onrender.com/getAnswers/${localStorage.getItem("question_id")}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('user')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching answers: ${response.statusText}`);
            }


            const data = await response.json();

            console.log("Received answers:", data);
            primeiro = true;
            data.forEach(element => {

                template = `
                    <!-- Best Answer -->
                    <div class="answer">
                        <div class="vote-section">
                            <button class="upvote-button" onclick='sendUpvote(${element.answer_id})'>
                                <svg viewBox="0 0 24 24">
                                    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
                                </svg>
                                <span class="tooltiptext">Obrigado! Me ajudou.</span>
                                <span class="upvote-count">${element.upvote_count}</span>
                            </button>
                        </div>
                        <div class="answer-content">
                            <div class="answer-meta">
                                Respondido há ${ResponseTime(element.answer_created_at)}
                                <span class="best-answer-badge" style="opacity : ${primeiro == true ? 1 : 0}">Melhor resposta</span>
                            </div>

                            <div class="user-info">
                                <div class="user-avatar">
                                    <svg viewBox="0 0 24 24">
                                        <path
                                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <span class="user-name">${element.respondent_name}</span>
                            </div>

                            <p>${element.answer_content}</p>
                        </div>
                    </div>`
                document.getElementById("questionContainer").innerHTML += template;


                primeiro = false;
            });
        } catch (error) {
            console.error("Error:", error);
        }
    }

    getAnswers();

})

function ResponseTime(data) {
    const inputDate = new Date(data);
    const currentDate = new Date();

    const diffInMs = currentDate - inputDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
        return `${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
        return `${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInMinutes > 0) {
        return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else {
        return `${diffInSeconds} segundo${diffInSeconds > 1 ? 's' : ''}`;
    }
}