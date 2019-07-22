const express = require('express')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')
const password = process.env.PASS || 'blbl'
console.log(password)
const port = process.env.PORT || 3000

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/', express.static(path.join(__dirname + '/')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let info = {
    value:'testing',
    font:50
}
app.post('/', (req, res) => {
    const {query, body} = req

    console.log(body)

    if(query.password === password){
        console.log(query)
        info = {
            value:body.value,
            font:body.font
        }
        io.emit('value',info)
        res.send(info)
    }
    else{
        res.json({
            'code':404,
            'error':'Incorrect password'
        })
    }
})

io.on('connection', socket => {
    io.emit('value', info)
    console.log(`User connected`)
})

http.listen(port, () => {
    console.log(`listening on: ${port}`)
})