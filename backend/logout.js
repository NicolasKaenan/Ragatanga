const URL_LOGOUT = "http://localhost:3000/logout/"

//readUser(localStorage.getItem('user'))

document.addEventListener("DOMContentLoaded", () =>{
    
    var btnLogout = document.getElementById("btnLogout")
    btnLogout.addEventListener("click", () =>{
        console.log("kaenan")
        logout();    
        })
        function logout(){
            console.log("logout")
            localStorage.clear("token")
            localStorage.clear("user")
            window.location.href = "./../frontend"
        }
})



