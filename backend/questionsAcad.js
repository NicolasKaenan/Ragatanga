const URL_QUESTIONS = "http://localhost:3000/question/";

document.addEventListener("DOMContentLoaded", function () {
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
        alert('Dúvida publicada com sucesso!');
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
            window.location.href = "duvidas.html"; // Página com a lista de dúvidas
        })
        .catch(function (error) {
            console.error("Erro ao criar pergunta:", error.message);
            alert(`Erro: ${error.message}`);
        });
}


