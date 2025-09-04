const validateAnswer = (req, res, next) => {

    // คำตอบจะเป็นข้อความยาวๆ ไม่เกิน 300 ตัวอักษร
    if (req.body.content.length > 300) {
        return res.status(400).json({
            message: "Answer content must be less than 300 characters"
        })
    }

    next();
}

export default validateAnswer;