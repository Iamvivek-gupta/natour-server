const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}


const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}


const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}


const handleJWTError = err => new AppError('Invalid token, Please login again.', 401);
const handleJWTExpiredError =  err => new AppError('Your token has expired! please login again.', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
}


const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    // Programming or other unknown error: don't leak error details    
    } else {
        // 1) Log error
        console.error('ERROR 💡💡', err);

        // 2) Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }
}


module.exports = (err, req, res, next) => {
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if(process.env.NODE_ENV === 'development') {
        if( err.name === 'CastError') err = handleCastErrorDB(err);
        if( err.code === 11000) err = handleDuplicateFieldsDB(err);
        if( err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if(err.name === 'JsonWebTokenError') err = handleJWTError(err);
        if(err.name === 'TokenExpiredError') err = handleJWTExpiredError(err);
        sendErrorDev(err, res);
    } else if(process.env.NODE_ENV === 'production'){
        console.log("error coming from here", err);
        let error = { ...err };

        if( error.name === 'CastError') error = handleCastErrorDB(error);
        if( error.code === 11000) error = handleDuplicateFieldsDB(error);
        if( error.name === 'ValidationError') error = handleValidationErrorDB(error);
        sendErrorProd(error, res);
    }
}