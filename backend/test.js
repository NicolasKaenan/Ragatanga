// Function to register a new user
const registerUser = async () => {
    const userData = {
        user_name: "johnDoe", // Replace with the username to be registered
        email: "john@example.com", // Replace with the user's email
        user_type : 0,
        password: "mySecurePassword123", // Replace with the password to be hashed
        cpf: "12345678901", // Replace with the user's CPF
        phone_number : "47997147454"

    };

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
            },
            body: JSON.stringify(userData), // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Registration Success:', result.message);
        } else {
            console.error('Registration Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};

// Function to log in a user and return the JWT token
const loginUser = async () => {
    const loginData = {
        email: "john@example.com", // Replace with the username
        password: "mySecurePassword123" // Replace with the password
    };

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
            },
            body: JSON.stringify(loginData), // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Login Success:', result.message);
            console.log('JWT Token:', result.token); // Log the JWT token
            console.log('User Info:', result.user); // Log user info

            // Return the token for further use
            return result.token;
        } else {
            console.error('Login Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};

const getQuestions = async(token) =>{
    try {
        const response = await fetch('http://localhost:3000/questions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
                Authorization: `Bearer ${token}` // Include the JWT token in the Authorization header
            },
            //body: JSON.stringify(questionData), // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log(result);
        } else {
            console.error('Get Question Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
}

// Function to post a question (requires JWT authentication)
const postQuestion = async (token) => {
    const questionData = {
        title: "How do I implement JWT?", // Replace with the question title
        subtitle : "HAHAHAHAHAHAHHA",
        question_description: "I am trying to implement JWT in my app, can someone help?", // Replace with the question description
        subjects : ["história","português"]
    };

    try {
        const response = await fetch('http://localhost:3000/question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
                Authorization: `Bearer ${token}` // Include the JWT token in the Authorization header
            },
            body: JSON.stringify(questionData), // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Question Posted Successfully:", result.message);
        } else {
            console.error('Post Question Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};

const answerQuestion = async (token) => {
    const answerData = {
        content: "sla porra", // Replace with the question title
    };

    try {
        const response = await fetch('http://localhost:3000/answer/1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
                Authorization: `Bearer ${token}` // Include the JWT token in the Authorization header
            },
            body: JSON.stringify(answerData), // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Question answered Successfully:", result.message);
        } else {
            console.error('Post answer Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};

const voteRelevance = async (token) => {
    try {
        const response = await fetch('http://localhost:3000/voteRelevance/1',  {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
                Authorization: `Bearer ${token}` // Include the JWT token in the Authorization header
            },
            body: null, // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Question answered Successfully:", result.message);
        } else {
            console.error('Post answer Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};


const upvoteAnswer = async (token) => {
    try {
        const response = await fetch('http://localhost:3000/upvote/2',  {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
                Authorization: `Bearer ${token}` // Include the JWT token in the Authorization header
            },
            body: null, // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Question answered Successfully:", result.message);
        } else {
            console.error('Post answer Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};

const myQuestions = async (token) => {
    try {
        const response = await fetch('http://localhost:3000/myQuestions',  {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Sending JSON data
                Authorization: `Bearer ${token}` // Include the JWT token in the Authorization header
            },
            body: null, // Convert JavaScript object to JSON string
        });

        const result = await response.json();

        if (response.ok) {
            console.log(result);
        } else {
            console.error('Get questions Error:', result.error);
        }
    } catch (error) {
        console.error('Network Error:', error);
    }
};


// Register a user, log them in, and post a question
const main = async () => {
    // Uncomment the line below to register a new user (optional)
    //await registerUser();

    // Log in the user and get the JWT token
    const token = await loginUser();
    if (token) {
        //getQuestions(token);
        // Post a question using the retrieved token
        //await postQuestion(token);
        //await answerQuestion(token);
        //voteRelevance(token);
        //upvoteAnswer(token);
        myQuestions(token);
    }
};

// Call the main function
main();
