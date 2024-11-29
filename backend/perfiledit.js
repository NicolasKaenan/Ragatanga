const URL_PERFIL_EDIT = "http://localhost:3000/edit-profile";

document.addEventListener("DOMContentLoaded", function () {
    
    const form = document.getElementById('editProfileForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {
            "user_name": formData.get('editName'),
            "email": formData.get('editEmail'),
            "phone_number": formData.get('telEdit'),
            "password": formData.get('passwordEdit'),
        };
        showPasswordConfirmModal();
        EditProfile(data);
    });
});

document.getElementById("passwordConfirmForm").onsubmit = function (e) {
    e.preventDefault();
    closePasswordConfirmModal();
    alert("Perfil atualizado com sucesso!");
};

function EditProfile(data) {
    const header = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('user')}`
        },
        credentials: 'include',
        body: JSON.stringify(data)
    };



    fetch(URL_PERFIL_EDIT, header)
        .then(function (response) {
            if (!response.ok) {
                if (response.status === 422) {
                    return response.json().then(data => {
                        console.log("Erro de validação:", data);
                    });
                } else {
                    throw new Error(`Erro na requisição: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            window.alert("Editado com sucesso!");
            showPasswordConfirmModal();
        })
        .catch(function (error) {
            console.error("Erro:", error);
        });
}
