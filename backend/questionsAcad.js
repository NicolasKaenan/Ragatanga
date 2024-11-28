const URL_QUESTIONS = "http://localhost:3000/question/";

document.addEventListener("DOMContentLoaded", function () {
    async function loadQuestions() {
        const userToken = localStorage.getItem("user");
    
        try {
            const response = await fetch('http://localhost:3000/questions', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken}`,
                },
            });
    
            if (!response.ok) {
                console.error("Failed to fetch questions:", response.statusText);
                return;
            }
    
            const data = await response.json();
    
            const generalContainer = document.getElementById("general");
            generalContainer.innerHTML = ""; // Clear existing content
    
            data.forEach((element) => {
                const isAnswered = element.closed ? 1 : 0;
    
                // Create question card elements
                const questionCard = document.createElement("div");
                questionCard.classList.add("question-card");
                
                questionCard.innerHTML = `
                    <div class="vote-section">
                        <button class="upvote-button">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
                            </svg>
                            <span class="tooltiptext">Tenho essa mesma dúvida</span>
                        </button>
                        <span class="upvote-count">${element.relevantVotes}</span>
                    </div>
                    <div class="question-content" onclick="toggleAnswer(this)">
                        <div class="question-header">
                            <div>
                                <span class="subject-tag">${element.subjects[0]}</span>
                                <span class="markAsAnswered" style="opacity: ${isAnswered};">Respondido</span>
                            </div>
                            <span class="question-meta">Perguntado há 2 horas</span>
                        </div>
                        <div class="user-info">
                            <div class="user-avatar">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <span class="user-name">${element.user_name}</span>
                        </div>
                        <h3>${element.title}</h3>
                        <p>${element.subtitle}</p>
                        <div class="answer-section">
                            <h4>Descrição da Dúvida:</h4>
                            <p>${element.question_description}</p>
                            <button class="submit-answer" 
                                onclick="window.location.href = 'respostaDuvidaAcademica.html'; localStorage.setItem('question_id', ${element.id});">
                                Responder
                            </button>
                        </div>
                    </div>
                `;
    
                // Add click handler for relevantVote
                const voteButton = questionCard.querySelector(".upvote-button");
                voteButton.addEventListener("click", async () => {
                    try {
                        const voteResponse = await fetch(`http://localhost:3000/voteRelevance/${element.id}`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${userToken}`,
                            },
                        });
                
                        if (!voteResponse.ok) {
                            console.error("Failed to submit vote:", voteResponse.statusText);
                        } else {
                            console.log("Vote submitted successfully!");
                            
                            // Increment relevantVotes in the DOM
                            const voteCountElement = questionCard.querySelector(".upvote-count");
                            const currentVotes = parseInt(voteCountElement.textContent, 10) || 0;
                            voteCountElement.textContent = currentVotes + 1;
                        }
                    } catch (error) {
                        console.error("Error submitting vote:", error);
                    }
                });
    
                generalContainer.appendChild(questionCard);
            });
        } catch (error) {
            console.error("Error loading questions:", error);
        }
    }
    
    loadQuestions();
    
    const form = document.getElementById("formNewQuestion");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const selects = document.getElementsByClassName("selected");
        const subjects = Array.from(selects).map(subject => subject.innerText); // Pega o texto das matérias selecionadas

        const formData = new FormData(form);
        const data = {
            "title": formData.get('title'),
            "subtitle": formData.get('subtitle'),
            "question_description": formData.get('question_description'),
            "subjects": subjects // Lista de matérias selecionadas
        };

        AddQuestion(data);
        closeNewQuestionModal();
    });
});

function toggleSubject(element) {
    element.classList.toggle('selected'); // Adiciona ou remove a classe 'selected'
}


function AddQuestion(data) {
    const userToken = localStorage.getItem("user");

    var options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(data)
    };

    fetch(URL_QUESTIONS, options)
        .then(function (response) {
            if (!response.ok) {
                if (response.status === 422) {
                    // Erro de validação
                    return response.json().then(data => {
                        throw new Error(data.error || "Erro de validação");
                    });
                } else {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(function (data) {
            console.log("Pergunta criada com sucesso:", data);
            // Redirecionar ou atualizar a interface
            alert("Dúvida publicada com sucesso!");
            window.location.href = "./../frontend/areaAcademica.html"; // Página com a lista de dúvidas
        })
        .catch(function (error) {
            console.error("Erro ao criar pergunta:", error.message);
            alert(`Erro: ${error.message}`);
        });
}


