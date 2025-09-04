import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

//get
//get all question
app.get("/questions", async (req, res) => {
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
app.get("/questions/search", async (req, res) => {
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
app.get("/questions/:questionId", async (req, res) => {
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
app.get("/questions/:questionId/answers", async (req, res) => {
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
app.post("/questions", async (req, res) => {
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
app.post("/questions/:questionId/answers", async (req, res) => {
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
app.post("/questions/:questionId/vote", async (req, res) => {
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

//vote on an answer
app.post("/answers/:answerId/vote", async (req, res) => {
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

//put
//update a question by ID
app.put("/questions/:questionId", async (req, res) => {
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

    // Update question
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

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});