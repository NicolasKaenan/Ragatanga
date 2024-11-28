const URL_PERFIL_EDIT = "http://localhost:3000/edit-profile";

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("editProfileForm").onsubmit = function (event) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            "user_name": formData.get('nameEdit'),
            "email": formData.get('emailEdit'),
            "phone_number": formData.get('telEdit'),
            "password":formData.get('passwordEdit'),
        }
        EditProfile(data);
        EditProfileModal();
        showPasswordConfirmModal();
    };
});

function EditProfile(data) {
    var header = {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
        credentials: 'include' 
    }

    fetch(URL_PERFIL_EDIT,header)
    .then(function(response){
        if (!response.ok && response.status === 422) {
            return response.json();            
        }else if(response.ok && response.status == 201 ) {
            window.alert("Editado com sucesso!")
        }
    }).then(function(data){
        console.log(data)
    }).catch(function(error){
        console.log(error)
    })
}