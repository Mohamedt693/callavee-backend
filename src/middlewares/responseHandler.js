export const responseHandler = (req, res, next) => {

    res.success = (message, data = {}, statusCode = 200) => {

        return res.status(statusCode).json({

            success: true,

            message,

            data

        });

    };



    res.error = (message, statusCode = 500, error = null) => {

        return res.status(statusCode).json({

            success: false,

            message,

            error: error ? error.message : null

        });

    };



    next();

};