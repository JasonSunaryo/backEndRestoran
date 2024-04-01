const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const expressLayouts = require('express-ejs-layouts');

const PORT = process.env.PORT || 4000;

// Mongodb
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected to the database"));

// Model MongoDB
const Item = require('./public/menus');

// Endpoint untuk pencarian
app.get('/search', async (req, res) => {
    const { keyword } = req.query;
    
    try {
        const results = await Item.find({ $text: { $search: keyword } });

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static("uploads"));

app.use(
    session({
        secret: 'my secret key',
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Set template engine
app.set('view engine', 'ejs');

// Route prefix
app.use("", require("./routes/routes"));

app.use(expressLayouts);
app.use(express.static('public'));

app.get('/', (req,res) => {
    res.render('index.ejs', {title:'Document',layout : 'MainLayout.ejs'});
});

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
