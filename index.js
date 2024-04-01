const express = require('express');
const app = express();
const port = 3012;
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');

app.use(expressLayouts);

app.use(express.static('public'));


app.get('/', (req,res) => {
    res.render('main.ejs', {title:'Document',layout : 'MainLayout.ejs'});
})

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3003
//   }
// })









