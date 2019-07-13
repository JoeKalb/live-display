const express = require('express')
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')
const password = process.env.PASS || 'blbl'
console.log(password)
const port = process.env.PORT || 3000

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/', express.static(path.join(__dirname + '/')));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let value = '';
app.post('/', (req, res) => {
    const {query} = req

    if(query.password === password){
        console.log(query)
        value = query.value
        io.emit('value',value)
        res.send(query)
    }
    else{
        res.json({
            'code':404,
            'error':'Incorrect password'
        })
    }
})

io.on('connection', socket => {
    io.emit('value', value)
    console.log(`User connected`)
})

http.listen(port, () => {
    console.log(`listening on: ${port}`)
})