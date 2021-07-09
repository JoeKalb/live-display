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
    value:'',
    font:60,
    color:'white'
}
app.post('/', (req, res) => {
    const {query, body} = req

    console.log(body)

    if(query.password === password){
        console.log(query)
        info = {
            value:body.value || '',
            font:body.font || '60',
            color:body.color || 'white'
        }
        clearInterval(countdownInterval)
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

let countdownInterval
let continueCountdown = true
let hasInfo = true
app.post('/countdown', (req, res) => {
    const {query, body} = req

    console.log(body)

    if(query.password === password){
        console.log(query)

        const valueArr = body.value.split(':')
        let totalTimeSeconds = (parseInt(valueArr[0]) * 60) + parseInt(valueArr[1])
        clearInterval(countdownInterval)

        countdownInterval = setInterval(() => {
            let minutes = Math.floor(totalTimeSeconds / 60)
            let seconds = totalTimeSeconds % 60
            
            let string = `${(minutes < 10)?`0${minutes}`:`${minutes}`}:${(seconds < 10)?`0${seconds}`:`${seconds}`}`
            info = {
                value:`Countdown: ${string}` || '',
                font:body.font || '60px',
                color:body.color || 'white'
            }

            if(continueCountdown)
                --totalTimeSeconds
            else{ // add pausing timeout
                if(hasInfo) {
                    info.value = `Countdown: --:--`
                    hasInfo = false
                }
                else hasInfo = true
            }

            io.emit('value', info)

            if(totalTimeSeconds < 0){
                clearInterval(countdownInterval)
                setTimeout(() => {
                    info.value = 'ITS OVER!'
                    io.emit('value', info)
                }, 1000)
            }
        },1000)

        res.json(info)
    }
    else{
        res.json({
            'code':404,
            'error':'Incorrect password'
        })
    }
})

app.get('/countdown/pause', (req, res) => {
    const { query } = req
    if(query.password === password){
        (continueCountdown) 
            ? continueCountdown = false: continueCountdown = true
        res.json({ continueCountdown })
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
