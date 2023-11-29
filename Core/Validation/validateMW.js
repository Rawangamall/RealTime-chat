const { validationResult } = require("express-validator");

module.exports = (request, response, next) => {
    const result = validationResult(request);
    if (!result.isEmpty()) {
        const errorMsg = result.errors.reduce(
            (current, error) => current + error.msg + " , ",
            ""
        );

        return response.status(422).json({ error: errorMsg });

    } else {
        next();
    }
};
