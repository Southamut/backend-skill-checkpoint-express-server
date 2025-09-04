import express from "express";
import connectionPool from "../utils/db.mjs";

const routerAnswer = express.Router();

//vote on an answer
routerAnswer.post("/:answerId/vote", async (req, res) => {
    try {
        // check content
        const { vote } = req.body;
        if (vote !== 1 && vote !== -1) {
            return res.status(400).json({
                message: "Invalid vote value."
            });
        }

        // checkanswerId
        const { answerId } = req.params;
        const existingAnswer = await connectionPool.query(
            "SELECT * FROM answers WHERE id = $1",
            [answerId]
        );
        if (existingAnswer.rows.length === 0) {
            return res.status(404).json({
                message: "Answer not found."
            });
        }

        await connectionPool.query(
            `INSERT INTO answer_votes (answer_id, vote) VALUES ($1, $2)`,
            [answerId, vote]
        );

        return res.status(201).json({
            message: "Vote on the answer has been recorded successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unable to vote answer."
        });
    }
});

export default routerAnswer;