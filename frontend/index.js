
    const BASE_URL = "http://localhost:3000"; // Change to your server URL if deployed

    // Handle Register Form Submission
    window.addEventListener('load',() =>{






        document.getElementById("registerForm").addEventListener("submit", async (e) => {
            e.preventDefault(); // Prevent form submission
            try {
                // Get form data
                const user_name = document.getElementById("name").value;
                const email = document.getElementById("email").value;
                const password = document.getElementById("password").value;
                const cpf = document.getElementById("cpf").value;
                const user_type = document.getElementById("userType").value;
                const phone_number = document.getElementById("phone").value;
    
                // Send POST request to register endpoint
                const response = await fetch(`${BASE_URL}/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_name, email, password, cpf, user_type, phone_number }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    alert(data.message); // Success message
                    closeModal("registerModal"); // Close modal
                    switchToLogin(); // Show login modal
                } else {
                    alert(data.error); // Error message
                }
            } catch (err) {
                console.error("Error registering user:", err);
                alert("An error occurred during registration.");
            }
        });
    
        // Handle Login Form Submission
        document.getElementById("loginForm").addEventListener("submit", async (e) => {
            e.preventDefault(); // Prevent form submission
            try {
                // Get form data
                const email = document.getElementById("loginEmail").value;
                const password = document.getElementById("loginPassword").value;
    
                // Send POST request to login endpoint
                const response = await fetch(`${BASE_URL}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    alert("Login successful!");
                    console.log("Token:", data.token); // Log JWT token
                    // Save token to localStorage for future requests
                    localStorage.setItem("token", data.token);
                    closeModal("loginModal"); // Close modal
                    window.location.href = "./../frontend/questions.html"
                } else {
                    alert(data.error); // Error message
                }
            } catch (err) {
                console.error("Error logging in:", err);
                alert("An error occurred during login.");
            }
        });
    
        // Utility functions for modal handling
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = "none";
        }
    
        function switchToLogin() {
            closeModal("registerModal");
            document.getElementById("loginModal").style.display = "block";
        }
    
        function switchToRegister() {
            closeModal("loginModal");
            document.getElementById("registerModal").style.display = "block";
        }

        









    })
   