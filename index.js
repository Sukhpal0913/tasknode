const express = require('express');
const app = express();
const path=require('path')
const bodyParser = require('body-parser');
let user = require('./app.js');
let session = require('express-session');
let FileStore = require('session-file-store')(session);


app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new FileStore({
        path: './session'
    }),
    secret: 'keyboard#cat'
}));

app.use(user);

app.get('/', (req, res) => {
    res.render('firstpage');
})
app.use((req,res,next)=>{
    res.render('error')
})



app.use((error, req, res, next)=>{
    console.log(error);
    const status = error.statusCode;
    const message = error.message;
    const data = error.data
    res.status(status).json({message: message, data: data});
})

app.listen(3000);