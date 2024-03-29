const express = require('express');
const app = express();
const port = 3001;
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');

app.use(expressLayouts);

app.use(express.static('public'));


app.get('/', (req,res) => {
    res.render('index.ejs', {title:'Document',layout : 'MainLayout.ejs'});
})

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
})

