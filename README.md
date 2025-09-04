# An Express Server Template

A REST API built with Express.js and PostgreSQL for managing questions and answers, similar to a Q&A platform like Stack Overflow.

## Features description

- Questions Management: Create, read, update, and delete questions
- Answers Management: Create answers for questions and vote on them
- Vote System: Upvote/downvote answers with +1 or -1 votes
- PostgreSQL Database: Persistent data storage with connection pooling
- Input Validation: Middleware for validating request data

## Tech Stack

- Backend**: Node.js with Express.js
- Database: PostgreSQL
- Development: Nodemon for auto-restart during development
- Database Client: node-postgres (pg)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-skill-checkpoint-express-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Ensure PostgreSQL is running on your machine
   - Create a database named `skill-check-3`
   - Update database connection string in `utils/db.mjs` if needed
   - Set up the required tables (questions and answers)

4. **Start the development server**
   ```bash
   npm start
   ```

The server will start on `http://localhost:4000`

## API Endpoints

- `GET /questions` - Get all questions
- `GET /questions/:id` - Get a specific question by ID
- `POST /questions` - Create a new question
- `PUT /questions/:id` - Update a question
- `DELETE /questions/:id` - Delete a question
- `POST /questions/:questionId/answers` - Create an answer for a question
- `POST /answers/:answerId/vote` - Vote on an answer (+1 or -1)

## API Testing

You can test the API using tools like:
- **Postman**
- **cURL**
- **Thunder Client** (VS Code extension)