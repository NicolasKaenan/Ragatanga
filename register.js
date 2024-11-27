const URL_REGISTER = "http://localhost:3000/auth/register/";

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('formulario')
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = new FormData(form);
        const data = {
            "nome": formData.get('name'),
            "email": formData.get('email'),
            "password":formData.get('password'),
            "cpf":formData.get('cpf'),
            "type":formData.get('type')
        }

        enviaPOST( data )
    })
})

function saveRegister( data ){
    var header = {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data)
    }
    fetch(URL_REGISTER,header)
    .then(function(response){
        if (!response.ok && response.status === 422) {
            return response.json();            
        }else if(response.ok && response.status == 201 ) {
            window.location.href = "login.html"
        }
    }).then(function(data){
        console.log(data)
    }).catch(function(error){
        console.log(error)
    })
}