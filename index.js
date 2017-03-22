var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static('public', { maxAge: 0, etag: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

var messageList = [
    {
        msg: 'Merry Christmas, Everyone',
        name: "Shakin' Stevens"
    },
    {
        msg: 'Ed Balls',
        name: 'Ed Balls'
    },
    {
        msg: 'Get your message displayed here &ndash; see below',
        name: 'JavaScript'
    }
];

// routes
app.get('/', function (req, res) { res.render('index'); });
app.get('/thanks', function (req, res) { res.render('thanks'); });
app.get('/submit/:err?', function (req, res) {
    res.render('submit', { hasError: req.params.err });
});

app.post('/submit', function (req, res) {
    if (!req.body.msg || !req.body.name) {
        res.redirect('/submit/err');
    } else {
        // add message to queue
        var newMsg = {
            name: escapeHtml(req.body.name),
            msg: escapeHtml(req.body.msg)
        };
        // store it
        messageList.push(newMsg);
        // update clients
        io.sockets.emit('msg-received', newMsg);
        res.redirect('/thanks');
    }
});

io.on('connection', function (socket) {
    socket.emit('init', messageList);
});

server.listen(8000);
