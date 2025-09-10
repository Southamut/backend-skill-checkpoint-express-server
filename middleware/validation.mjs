const validateAnswer = (req, res, next) => {
    const { content } = req.body;

    // คำตอบจะเป็นข้อความยาวๆ ไม่เกิน 300 ตัวอักษร
    if (content.length > 300) {
        return res.status(400).json({
            message: "Answer content must be less than 300 characters"
        })
    }

    // refactor-1 : Check if content exists and is not empty
    if (!content || content.trim() === '') {
        return res.status(400).json({
            message: "Invalid request data."
        });
    }
    next();
}

export default validateAnswer;