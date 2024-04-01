const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/authRoute')
const app = express();

//middleware
app.use(cors());
app.use(express.json());



//route
app.use('/api/auth', authRouter);


// mongo db connection
mongoose
.connect('mongodb://localhost:27017/Authentication')
.then(()=> console.log('Connected to MongoDB!'))
.catch((error)=>console.error('Failed to connect to MongoDB:',error));



// global error handler
app.use((err, req, res, next) =>{
err.statuCode = err.statuCode || 500;
err.status = err.status || 'error';

res.status(err.statuCode).json({
status: err.status,
message: err.message,
});
});

// server
const PORT = 3005
app.listen(PORT, () => {
 console.log(`App running on ${PORT}`);   
});