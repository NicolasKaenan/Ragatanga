async function sendUpvote(answer_id){
    console.log("test")
    const response = await fetch(`http://localhost:3000/upvote/${answer_id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('user')}`,  // Ensure userToken is defined
        },
    });
    location.reload()
}

document.addEventListener("DOMContentLoaded",() =>{
    getAnswer()

    async function getAnswer(){
       

        async function loadQuestions() {
            const userToken = localStorage.getItem("user");
        
            try {
                
                const response = await fetch(`http://localhost:3000/getQuestion/${localStorage.getItem("question_id")}`, {
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
                console.log(data)
                
          
        
                data.forEach((element) => {
                    const isAnswered = element.closed ? 1 : 0;
                    console.log("existo")
                    document.getElementById("questionContainer").innerHTML = `
                        <div class="question-full">
                <div class="metadata-bar">
                    <span class="subject-tag">${element.subjects[0]}</span>
                    <span class="question-meta">Perguntado há 2 horas</span>
                </div>

                <div class="user-info">
                    <div class="user-avatar">
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <span class="user-name">${element.user.user_name}</span>
                </div>

                <h1 class="question-title">${element.title}</h1>
                <h2 class="question-subtitle">${element.subtitle}
                </h2>

                <div class="question-description">
                    <p>${element.question_description}
                    
                </div>
            </div>
                    `;
        
                    
        
                });
            } catch (error) {
                console.error("Error loading questions:", error);
            }
        }
        
        loadQuestions();





        
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
                    const response = await fetch(`http://localhost:3000/getAnswers/${localStorage.getItem("question_id")}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem('user')}`,  // Ensure userToken is defined
                        },
                    });
                    
                    
                    // Check if the response is successful (status code 200-299)
                    if (!response.ok) {
                        throw new Error(`Error fetching answers: ${response.statusText}`);
                    }
                    
                    
                    // If successful, parse the response
                    const data = await response.json();

                    //document.getElementById("answersNumber").innerHTML = `${data.length} respostas`
                    
                    console.log("Received answers:", data);
                    //onclick="upvote(this, 'answer1')
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
                                Respondido há menos de 1 hora
                                <span class="best-answer-badge" style="opacity : ${primeiro == true ? 1 : 0 }">Melhor resposta</span>
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


                    primeiro= false;
                    });
                } catch (error) {
                    console.error("Error:", error);
                }
            }
    
        getAnswers().then(() =>{
            
    const respondTemplate = `
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
    document.getElementById("questionContainer").innerHTML += respondTemplate;

        })


})