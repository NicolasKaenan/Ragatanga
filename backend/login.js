const URL_LOGIN = "http://localhost:3000/login/"

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('loginForm')
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {
            "email": formData.get('loginEmail'),
            "password":formData.get('loginPassword')
        }

        console.log(data)
        verifyLogin( data )
    })
})


function verifyLogin( data ){
    var options = {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data),
        credentials: 'include' 
    }

    var status = 0
    fetch(URL_LOGIN,options)
    .then(function(response){
        status = response.status
        return response.json()
    }).then( function(data){
        if (status == 422) {
            if( data != undefined ){
                var mensagemErro = document.getElementById("mensagemErro")
                mensagemErro.innerText = data.msg
                mensagemErro.style.display = "block"
            }
        }else if(status == 200 ) {
            localStorage.setItem('id',data.id)
            window.location.href = "./../frontend/duvidas.html"
        }
    })
    .catch(function(error){
        console.log(error)
    })
}