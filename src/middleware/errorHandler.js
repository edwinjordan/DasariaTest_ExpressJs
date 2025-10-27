const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = {
        success: false,
        message: err.message || 'Internal Server Error',
        statusCode: err.statusCode || 500
    };

    // Validation error
    if (err.name === 'ValidationError') {
        error.statusCode = 400;
        error.message = 'Validation Error';
        error.errors = Object.values(err.errors).map(val => val.message);
    }

    // Duplicate key error
    if (err.code === 'ER_DUP_ENTRY') {
        error.statusCode = 400;
        error.message = 'Duplicate entry';
    }

    // Foreign key constraint error
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        error.statusCode = 400;
        error.message = 'Referenced record not found';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.statusCode = 401;
        error.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        error.statusCode = 401;
        error.message = 'Token expired';
    }

    // Database connection errors
    if (err.code === 'ECONNREFUSED') {
        error.statusCode = 503;
        error.message = 'Database connection failed';
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;