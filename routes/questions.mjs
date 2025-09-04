import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const routerQuestion = Router();

//get
//get all question
routerQuestion.get("/", async (req, res) => {
    try {
        const result = await connectionPool.query("SELECT * FROM questions")
        return res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Unable to fetch questions."
        });
    }

});

//get questions by title or category
routerQuestion.get("/search", async (req, res) => {
    try {
        const { title, category } = req.query;

        if (!title && !category) {
            return res.status(400).json({
                message: "Invalid search parameters."
            });
        }

        let query = "SELECT * FROM questions WHERE ";
        let params = [];
        let conditions = [];

        if (title) {
            conditions.push("title ILIKE $1");
            params.push(`%${title}%`);
        }

        if (category) {
            const paramIndex = title ? 2 : 1;
            conditions.push(`category ILIKE $${paramIndex}`);
            params.push(`%${category}%`);
        }

        query += conditions.join(" OR ");

        const result = await connectionPool.query(query, params);

        return res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Unable to fetch question."
        });
    }

});

//get question by id
routerQuestion.get("/:questionId", async (req, res) => {
    try {
        const { questionId } = req.params;
        const result = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId])

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        return res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Unable to fetch question."
        });
    }

});

// get answers for a question
routerQuestion.get("/:questionId/answers", async (req, res) => {
    try {
        const { questionId } = req.params;
        const result = await connectionPool.query(
            `SELECT answers.id, answers.content FROM answers
      INNER JOIN questions ON answers.question_id = questions.id
      WHERE questions.id = $1`, [questionId])

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        return res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Unable to fetch answers."
        });
    }

});

//post
//create a new question
routerQuestion.post("/", async (req, res) => {
    try {
        //check query
        const { title, description, category } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Invalid request data."
            });
        }

        await connectionPool.query(
            `INSERT INTO questions (title, description, category) VALUES ($1, $2, $3)`,
            [title, description, category]
        );

        return res.status(201).json({
            message: "Question created successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to create question."
        });
    }
});

//create an answer for a question
routerQuestion.post("/:questionId/answers", async (req, res) => {
    try {
        // check content
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({
                message: "Invalid request data."
            });
        }

        // checkquestionId
        const { questionId } = req.params;
        const existingQuestion = await connectionPool.query(
            "SELECT * FROM questions WHERE id = $1",
            [questionId]
        );
        if (existingQuestion.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        await connectionPool.query(
            `INSERT INTO answers (content, question_id) VALUES ($1, $2)`,
            [content, questionId]
        );

        return res.status(201).json({
            message: "Answer created successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to create answers."
        });
    }
});

//vote on a question
routerQuestion.post("/:questionId/vote", async (req, res) => {
    try {
        // check content
        const { vote } = req.body;
        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({
                message: "Invalid vote value."
            });
        }

        // checkquestionId
        const { questionId } = req.params;
        const existingQuestion = await connectionPool.query(
            "SELECT * FROM questions WHERE id = $1",
            [questionId]
        );
        if (existingQuestion.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        await connectionPool.query(
            `INSERT INTO question_votes (question_id, vote) VALUES ($1, $2)`,
            [questionId, vote]
        );

        return res.status(201).json({
            message: "Vote on the question has been recorded successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to vote question."
        });
    }
});

//put
//update a question by ID
routerQuestion.put("/:questionId", async (req, res) => {
    try {
        //check query
        const { title, description, category } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Invalid request data."
            });
        }

        // checkquestionId
        const { questionId } = req.params;
        const existingQuestion = await connectionPool.query(
            "SELECT * FROM questions WHERE id = $1",
            [questionId]
        );
        if (existingQuestion.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        await connectionPool.query(
            "UPDATE questions SET title = $1, description = $2, category = $3 WHERE id = $4",
            [title, description, category, questionId]
        );

        return res.status(200).json({
            message: "Question updated successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to fetch questions."
        });
    }
});

//delete
//delete a question by ID
routerQuestion.delete("/:questionId", async (req, res) => {
    try {
        // checkquestionId
        const { questionId } = req.params;
        const existingQuestion = await connectionPool.query(
            "SELECT * FROM questions WHERE id = $1",
            [questionId]
        );
        if (existingQuestion.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        await connectionPool.query(
            "DELETE FROM questions WHERE id = $1",
            [questionId]
        );
        return res.status(200).json({
            message: "Question post has been deleted successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to delete question."
        });
    }
});

//delete answers for a question
routerQuestion.delete("/:questionId/answers", async (req, res) => {
    try {
        // checkquestionId
        const { questionId } = req.params;
        const existingQuestion = await connectionPool.query(
            "SELECT * FROM questions WHERE id = $1",
            [questionId]
        );
        if (existingQuestion.rows.length === 0) {
            return res.status(404).json({
                message: "Question not found."
            });
        }

        await connectionPool.query(
            "DELETE FROM answers WHERE question_id = $1",
            [questionId]
        );
        return res.status(200).json({
            message: "All answers for the question have been deleted successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to delete answers."
        });
    }
});

export default routerQuestion;