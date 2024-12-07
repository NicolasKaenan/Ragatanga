const express = require('express');
const bcrypt = require("bcrypt");
const cors = require('cors')
const jwt = require("jsonwebtoken");
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const JWT_SECRET = "your_jwt_secret_key";

const connection = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false 
    }
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});


const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://127.0.0.1:443', // Indica quem pode se conectar 
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


app.use(express.static(path.join(__dirname, './../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './../frontend/index.html'));
});

app.get('/frontend/:endereco', (req, res) => {
    endereco = req.params.endereco
    res.sendFile(path.join(__dirname, './../frontend/'+endereco));
});

app.put("/check-password", authenticateToken, async (req, res) => {
    const { password } = req.body;
    try {
        const userId = req.user.id; 

        const [rows] = await connection.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const storedPasswordHash = rows[0].password_hash;

        const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);

        if (isPasswordValid) {
            res.status(200).json({ message: "Senha correta." });
        } else {
            res.status(400).json({ error: "Senha errada." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});


app.post("/register", async (req, res) => {
    try {
        const { user_name, email, password, cpf, user_type, phone_number } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users 
            (user_name, email, password_hash, cpf, user_type, phone_number) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [user_name, email, password_hash, cpf, user_type, phone_number];

        await connection.query(query, values);

        res.status(200).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const query = "SELECT * FROM users WHERE email = $1";
        const values = [email];
        const result = await connection.query(query, values);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const token = jwt.sign(
            { id: user.id, user_name: user.user_name },
            JWT_SECRET,
            { expiresIn: "1h" } 
        );

        console.log(token);

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.get("/questions", authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                questions.id,
                questions.title,
                questions.subtitle,
                questions.question_description,
                questions.closed,
                questions.subjects,
                questions.main_response,
                questions."created_at",
                COUNT(relevancevote.id) AS relevantvotes,
                users.user_name AS user_name,
                users.email AS userEmail
            FROM 
                questions
            LEFT JOIN 
                relevanceVote 
            ON 
                questions.id = relevanceVote.question_id
            LEFT JOIN 
                users 
            ON 
                questions.creator_id = users.id
            GROUP BY 
                questions.id, 
                users.user_name, 
                users.email
            ORDER BY 
                relevantVotes DESC;
        `;
        const result = await connection.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching questions." });
    }
});

app.get("/myQuestions", authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                questions.title,
                questions.question_description,
                questions.closed,
                questions.subjects,
                questions.main_response,
                questions."created_at",
                COALESCE(COUNT(relevanceVote.id), 0) AS relevantVotes
            FROM 
                questions
            LEFT JOIN 
                relevanceVote 
            ON 
                questions.id = relevanceVote.question_id
            WHERE
                questions.creator_id = $1
            GROUP BY 
                questions.id;
        `;

        const result = await connection.query(query, [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: "An error occurred while fetching questions." });
    }
});


app.post("/question", authenticateToken, async (req, res) => {
    const { title, subtitle, question_description, subjects } = req.body;
    try {
        await connection.query(
            `INSERT INTO questions (title, subtitle, question_description, creator_id, subjects) 
            VALUES ($1, $2, $3, $4, $5)`,
            [title, subtitle, question_description, req.user.id, JSON.stringify(subjects)]
        );
        res.status(200).json({
            message: "Access granted",
            user: req.user,
        });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: err });
    }
});

app.post("/answer/:question_id", authenticateToken, async (req, res) => {
    const content = req.body.content;
    const question_id = req.params.question_id;
    const respondent_id = req.user.id;
    try {
        await connection.query(
            "INSERT INTO answers (content, respondent_id, questions_id) VALUES ($1, $2, $3)",
            [content, respondent_id, question_id]
        );
        return res.status(202).json({ message: "Question answered" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred while submitting the answer." });
    }
});

app.get("/getQuestion/:question_id", authenticateToken, async (req, res) => {
    const question_id = req.params.question_id;

    const query = `
        SELECT 
            users.user_name AS user_name,
            questions.title,
            questions.subtitle,
            questions.question_description,
            questions.closed,
            questions.subjects,
            questions."created_at",
            COUNT(relevanceVote.id) AS relevanceVotes_count
        FROM 
            questions
        LEFT JOIN 
            users 
        ON 
            questions.creator_id = users.id
        LEFT JOIN 
            relevanceVote 
        ON 
            questions.id = relevanceVote.question_id
        WHERE 
            questions.id = $1
        GROUP BY 
            questions.id, 
            users.id;
    `;

    try {
        const result = await connection.query(query, [question_id]);

        if (result.rows.length === 0) {
            // Se nenhuma pergunta foi encontrada, retorna 404
            return res.status(404).json({ message: "Question not found." });
        }

        // Retorna a pergunta encontrada
        res.status(200).json(result.rows[0]); // Apenas uma pergunta será retornada
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the question." });
    }
});

app.get("/getAnswers/:question_id", authenticateToken, async (req, res) => {
    try {
        const question_id = req.params.question_id;

        const query = `
            SELECT 
                answers.id AS answer_id,
                answers.content AS answer_content,
                answers.created_at AS answer_created_at,
                users.id AS respondent_id,
                users.user_name AS respondent_name,
                users.email AS respondent_email,
                COUNT(upvotes.id) AS upvote_count
            FROM 
                answers
            LEFT JOIN 
                users 
            ON 
                answers.respondent_id = users.id
            LEFT JOIN 
                upvotes 
            ON 
                answers.id = upvotes.answers_id
            WHERE 
                answers.questions_id = $1
            GROUP BY 
                answers.id, 
                users.id
            ORDER BY 
                upvote_count DESC;
        `;

        const result = await connection.query(query, [question_id]);

        return res.status(200).json(result.rows); 
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error." });
    }
});



app.post("/upvote/:answer_id", authenticateToken, async (req, res) => {
    const answers_id = req.params.answer_id;
    const user_id = req.user.id;
    try {
        await connection.query("INSERT INTO upvotes (answers_id,users_id) VALUES ($1, $2)", [answers_id, user_id])
        return res.status(200).json({ message: "voted answered" });
    }
    catch {
        res.status(401).json({ message: "error" })
    }

})


app.put("/edit-profile", authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { user_name, email, password, phone_number } = req.body;

        let updateFields = [];
        let values = [];

        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            updateFields.push("password_hash = $"+(values.length + 1));
            values.push(password_hash);
        }

        if (user_name) {
            updateFields.push("user_name = $"+(values.length + 1));
            values.push(user_name);
        }
        if (email) {
            updateFields.push("email = $"+(values.length + 1));
            values.push(email);
        }
        if (phone_number) {
            updateFields.push("phone_number = $"+(values.length + 1));
            values.push(phone_number);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No data to update." });
        }

        values.push(user_id);
        const sqlQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${values.length}`;

        const results = await connection.query(sqlQuery, values);

        if (results.rowCount === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "Profile updated successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});


app.post("/voteRelevance/:question_id", authenticateToken, async (req, res) => {
    const question_id = req.params.question_id;
    const user_id = req.user.id;

    try {
        const checkQuery = `
            SELECT * 
            FROM relevanceVote 
            WHERE question_id = $1 AND users_id = $2
        `;
        const existingVote = await connection.query(checkQuery, [question_id, user_id]);

        if (existingVote.rows.length > 0) {
            return res.status(409).json({ message: "Vote already exists" }); 
        }

        const insertQuery = `
            INSERT INTO relevanceVote (question_id, users_id) 
            VALUES ($1, $2)
        `;
        await connection.query(insertQuery, [question_id, user_id]);

        return res.status(200).json({ message: "Vote successfully added" });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", details: err.message });
    }
});


app.post("/upvote/:answer_id", authenticateToken, async (req, res) => {

    const answer_id = req.params.answer_id;
    const user_id = req.user.id;
    try {
        await connection.query("INSERT INTO upvotes (answers_id,users_id) VALUES ($1, $2)", [answer_id, user_id])
        return res.status(200).json({ message: "voted answered" });
    }
    catch (err) {
        return res.status(401).json({ error: err });
    }
})


app.get("/profile", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET); 
        res.status(200).json({ message: "Access granted!", user: decoded });
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
