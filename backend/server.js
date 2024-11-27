const express = require('express');
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require('cors')
const jwt = require("jsonwebtoken"); // For generating JWTs

// Replace this with a strong secret key and store it securely
const JWT_SECRET = "your_jwt_secret_key";

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hackathon',
});

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://127.0.0.1:5500', // Indica quem pode se conectar 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Permite cookies e cabeçalhos de autorização
    allowedHeaders: ['Content-Type', 'Authorization'] // Liste os cabeçalhos que você espera receber
}));


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

    try {
        // Verify the token and decode the payload
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach the decoded data to req.user
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};






// Register Route
app.post("/register", async (req, res) => {
    try {
        const { user_name, email, password, cpf, user_type,phone_number} = req.body;
       
        // Hash the password using bcrypt
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user into database
        await connection.query(
            "INSERT INTO users (user_name, email, password_hash, cpf,user_type,phone_number) VALUES (?, ?, ?, ?,?,?)",
            [user_name, email, password_hash, cpf,user_type,phone_number]
        );

        res.status(200).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Retrieve the user from the database
        const [rows] = await connection.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        // Check if user exists
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const user = rows[0];

        // Compare provided password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, user_name: user.user_name }, // Payload (user data)
            JWT_SECRET, // Secret key
            { expiresIn: "1h" } // Token expiration time
        );

        res.status(200).json({ 
            message: "Login successful!", 
            token, 
            user: { id: user.id, user_name: user.user_name, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.get("/questions", authenticateToken, async (req, res) => { // tem que adicionar matérias aqui 
    try {
        const query = `
            SELECT 
                questions.title,
                questions.question_description,
                questions.closed,
                questions.main_response,
                questions.createdAt,
                COUNT(relevanceVote.id) AS relevantVotes
            FROM 
                questions
            LEFT JOIN 
                relevanceVote 
            ON 
                questions.id = relevanceVote.question_id
            GROUP BY 
                questions.id;
        `;
        const [response] = await connection.query(query); 
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching questions." });
    }
});


app.get("/myQuestions", authenticateToken, async (req, res) => { // tem que adicionar matérias aqui 

    try {
        const query = `
            SELECT 
                questions.title,
                questions.question_description,
                questions.closed,
                questions.main_response,
                questions.createdAt,
                COUNT(relevanceVote.id) AS relevantVotes
            FROM 
                questions
            LEFT JOIN 
                relevanceVote 
            ON 
                questions.id = relevanceVote.question_id
            WHERE
            questions.creator_id = ?

            GROUP BY 
                questions.id;
        `;
        const [response] = await connection.query(query,req.user.id); 
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching questions." });
    }
});



app.post("/question",authenticateToken, async(req,res) =>{
    const { title,subtitle,question_description,subjects} = req.body;
    try{
        await connection.query("INSERT INTO questions (title, subtitle, question_description, creator_id,subjects) VALUES (?,?,?,?,?)", [title,subtitle,question_description,req.user.id,JSON.stringify(subjects)])
        res.status(200).json({
            message: "Acess granted",
            user : req.user
        })
    }
    catch(err){
        res.status(401).json({error :err});
    }
})

app.post("/answer/:question_id",authenticateToken,async(req,res) =>{

    const content = req.body.content;
    const question_id = req.params.question_id;
    respondent_id = req.user.id;
    try{
        await connection.query("INSERT INTO answers (content,respondent_id,questions_id) VALUES (?, ?, ?)", [content,respondent_id,question_id])
        return res.status(202).json({message : "question answered" });
    }
    catch(err){
        return res.status(401).json({ error: err});
    }
})  

app.post("/voteRelevance/:question_id",authenticateToken,async(req,res) =>{
    const question_id = req.params.question_id;
    const user_id = req.user.id;
    try{
        await connection.query("INSERT INTO relevanceVote (question_id,users_id) VALUES (?, ?)", [question_id,user_id])
        return res.status(200).json({message : "voted answered" });
    }
    catch(err){
        return res.status(401).json({ error: err});
    }
})  

app.post("/upvote/:answer_id",authenticateToken,async(req,res) =>{
 
    const answer_id = req.params.answer_id;
    const user_id = req.user.id;
    try{
        await connection.query("INSERT INTO upvotes (answers_id,users_id) VALUES (?, ?)", [answer_id,user_id])
        return res.status(200).json({message : "voted answered" });
    }
    catch(err){
        return res.status(401).json({ error: err});
    }
})  


// Protected Route Example
app.get("/profile", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verify token
        res.status(200).json({ message: "Access granted!", user: decoded });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
