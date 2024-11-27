const URL_REGISTER = "http://localhost:3000/register/";

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('registerForm')
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = new FormData(form);
        const data = {
            "user_name": formData.get('nameRegister'),
            "email": formData.get('emailRegister'),
            "phone_number": formData.get('telRegister'),
            "password":formData.get('passwordRegister'),
            "cpf":formData.get('cpfRegister'),
            "user_type":formData.get('user_type')
        }

        saveRegister( data )
    })
})

function saveRegister( data ){
    console.log(data)
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