const URL_LOGOUT = "http://localhost:3000/logout/"

readUser(localStorage.getItem('user'))

var btnLogout = document.getElementById("btnLogout")
botaoLogout.addEventListener("click",function(){
    var options = {
        method:"GET",
        headers:{"Content-Type":"application/json"},
        credentials: 'include'
    }
    
    let status = 0
    
    fetch(URL_LOGOUT,options)
    .then(function(response){
        status = response.status
        return response.json()
    }).then( function(data){
        if(status == 200 ) {
            window.location.href = './frontend/index.html'
        }else{
            console.log("Error")
        }
    })
    .catch(function(error){
        console.log(error)
    })
})