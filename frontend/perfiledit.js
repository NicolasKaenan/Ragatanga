const URL_PASSWORD_CHECK = "https://ragatanga.onrender.com/check-password";
const URL_PERFIL_EDIT = "https://ragatanga.onrender.com/edit-profile";
if (!localStorage.getItem("user")) {
    window.location.replace("/");
}
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

    const form_password = document.getElementById("passwordConfirmForm");

    form_password.addEventListener('submit', function (e) {
        e.preventDefault();
        const form_password = document.getElementById("passwordConfirmForm");
        const formData = new FormData(form_password);
        const data = {
            "password": formData.get('password')
        };
        checkPassword(data);
    });

});

function checkPassword(data) {
    const header = {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('user')}`
        },
        credentials: 'include',
        body: JSON.stringify(data)
    };

    fetch(URL_PASSWORD_CHECK, header)
        .then(function (response) {
            if (!response.ok) {
                if (response.status == (401)) {
                    window.location.replace("/");
                }
                if (response.status == 400) {
                    return response.json().then(data => {
                        alert("Senha errada");
                    });
                }
            }
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            alert("Perfil atualizado com sucesso!");
            closePasswordConfirmModal();
        })
        .catch(function (error) {
            console.error("Erro:", error);
            alert("erro");
        });
}
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
                        return false
                    });
                } else {
                    throw new Error(`Erro na requisição: ${response.status}`);
                    return false
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
