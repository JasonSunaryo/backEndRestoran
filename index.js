const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middlewares/authMiddlewares");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const expressLayouts = require('express-ejs-layouts');

const PORT = process.env.PORT || 3015;

app.use(bodyParser.json());
app.use(authRoutes);
app.use(cookieParser());
app.use(express.json());

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


app.get("*", checkUser);

app.get("/", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", (err, decodedToken) => {
      if (err) {
        res.render("login");
      } else {
        res.render("dashboard");
      }
    });
  } else {
    res.render("login");
  }
});

app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard");
});



// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static("uploads"))

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

app.get('/main', requireAuth, (req,res) => {
    res.render('main.ejs', {title:'Document',layout : 'MainLayout.ejs'});
});

app.get('/index', requireAuth, (req, res) => {
  res.render('index.ejs', {title:'Document',layout : 'MainLayout.ejs'});
});

app.get('/profile', requireAuth, (req, res) => {
  res.render('edit_profile.ejs', {title:'Document',layout : 'edit_profile.ejs'});
});

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
