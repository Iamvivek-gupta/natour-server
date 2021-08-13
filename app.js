const express = require('express');
require('dotenv').config();
const logger = require('morgan');
const mongoose = require('mongoose');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const app = express();

// 1. Mongo Database Connection
const db_user = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
mongoose.connect(`mongodb+srv://${db_user}:${db_password}@natures.uyq6l.mongodb.net/natours?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true}).then( con => {
    console.log("database succesfully connected")
}).catch(err => {
    console.log("not connected", err)
})

// 2. Middleware
app.use(express.json());

// app.use(function(req, res, next){
//     console.log("hallo from middleware");
//     next();
// })

// if(process.env.NODE_ENV === 'development'){
//     app.use(logger('tiny'));
// }
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `can't find ${req.originalUrl} on this server`
    // })
    // const err = new Error(`can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    // next(err);
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})

app.use(globalErrorHandler);

// 3. Server Creation
const PORT = process.env.PORT || 8001;
app.listen(PORT, function(){
    console.log("server is up on port " + PORT);
})




