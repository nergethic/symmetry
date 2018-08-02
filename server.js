var app = require("http").createServer(serverHandler)
var io = require('socket.io')(app)

var fs = require("fs")
var qs = require("querystring")
var p = require('path')

var mongoose = require("mongoose")
var Models = require("./www/database/Models.js")(mongoose)
var Operations = require("./www/database/Operations.js")
var op = new Operations()

var port = 3000

app.listen(port)
console.log("port: " + port)
mongoose.connect('mongodb://localhost/scoresdb')

function fileExists(path) {
  try {
    fs.accessSync(path)
        return true
  } catch (e) {
      return false
  }
}

function serverHandler(req, res) {

    switch (req.method) {

        case "GET": {
            var path = ""
            var contentType = "text/html"
            var isAudio = false

            if (req.url == "/") {
                path = "www/index.html"
            } else if (req.url == "/editor") {
                path = "www/editor/editor.html"
            } else {
                path = "www" + req.url
                if (!fileExists(path)) {
                    res.writeHead(400, {"Content-Type": "text/plain"})
                    res.end("ERROR File does NOT Exists")
                    return;
                }

                var fileName = p.basename(path)
                var dirName = p.dirname(path)

                var ext = fileName.split(".")[1]
                switch (ext) {
                    case "html": {
                        contentType = "text/html"                       
                    } break;

                    case "css": {
                        contentType = "text/css"  
                    } break;

                    case "js": {
                        contentType = "text/javascript"  
                    } break;

                    case "png": {
                        contentType = "image/png"  
                    } break;

                    case "jpg": {
                        contentType = "image/jpeg"  
                    } break;

                    case "wav": {
                        contentType = "audio/wav"
                        isAudio = true
                    } break;

                    case "ogg": {
                        contentType = "audio/ogg"
                        isAudio = true
                    } break;

                    case "mp3": {
                        contentType = "audio/mpeg3"
                        isAudio = true
                    } break;

                    case "ico": {
                        contentType = "image/x-icon"
                    } break;

                    default: {
                        contentType = "text/plain"  
                    } break;
                }
            }

            contentType += "; charset=utf-8"

            fs.readFile(path, function (error, data) {

                if (isAudio) {

                    res.writeHead(200, {
                        'Content-Length': fs.statSync(path).size,
                        'Content-Type': contentType,
                        'Content-Disposition': "attachment; filename=" + fileName
                    })

                    fs.createReadStream(path).pipe(res)

                } else {

                    res.writeHead(200, {
                        'Content-Length': Buffer.byteLength(data, 'utf8'),
                        'Content-Type': contentType,
                    })

                    res.write(data, 'utf8')
                    res.end()
                }
            })
        } break;

        case "POST": {
            servResp(req, res)
        } break;
    }
}

// POST
function servResp(req, res) {
    var allData = "";
    var result = null
    var type = 'text/html'

    req.on("data", function (data) {
        allData += data;
    })

    req.on("end", function (data) {
        var request = qs.parse(allData)
        var result = {success: false, message: "", data: null}

        switch (request.action) {
            case "CREATE_FILE": {
                fs.writeFile(__dirname + request.path, request.data, function(error) {
                    if (error) {
                        console.log("file error:" + error)
                        result.message = "file error"
                    } else {
                        console.log("file created successfully!")
                        result.message = "file created successfully!"
                        result.success = true
                    }
                });
            } break;

            case "READ_FILE": {
                result.data = fs.readFileSync(__dirname + request.path, "utf8");
                result.success = true // TODO
                type = "application/json"
            } break;

            default: {
                console.log("request.action not recognized!!!")
                result.message = "request.action not recognized!!!"
            } break;
        }

        result.action = request.action

        var data = JSON.stringify(result)

        res.writeHead(200, {
            'Content-Length': Buffer.byteLength(data, 'utf8'),
            'Content-Type': (type + '; charset=utf-8')
        })

        res.write(data, 'utf8')
        res.end()
    })
}

// SOCKET
var online = [], myIndex = null, theirIndex = null, id = []

var firstClientId = null

io.on("connection", function(socket) {

    console.log("Client has connected: " + socket.id)

    if (firstClientId == null) {
        firstClientId = socket.id
    }

    var isFirst = (socket.id == firstClientId)

    if (isFirst) {
        console.log("first: " + (socket.id == firstClientId))
    }

    io.sockets.to(socket.id).emit("onconnect", {
        clientId: socket.id,
        isFirst: isFirst
    })

    socket.on("search", function(data) {
        
        if(online.length < 2) {
            id.push(socket.id)
            online.push(data.username)
        }

        if(online.length == 2) {
            io.sockets.emit("ready", {
                players: online
            })

        }
        
    })

    socket.on("insertScore", function(data) {

        let scoreObject = new Models.Scores(
        {
            username: data.username,
            score: data.score,
        })

        scoreObject.validate(function (err) {
            console.log(err)
        })

        op.InsertOne(scoreObject)
        console.log("Saved score")
    })

    socket.on("getScores", function() {
        op.SelectCallback(Models.Scores, function (scoreData) {
            console.log(scoreData)
            io.sockets.to(socket.id).emit("returnScores", scoreData)
        })
    })

    socket.on("clickTile", function(data) {
        socket.broadcast.emit("clickTile", data)
    })

    socket.on("win", function(data) {
        socket.broadcast.emit("win", data)
    })

    socket.on("sendNewLevelArray", function(data) {
        console.log("emmiting sendNewLevelArray")
        socket.broadcast.emit("sendNewLevelArray", data)
    })

    socket.on("levelLoaded", function() {
        io.emit("levelLoaded")
    })

    socket.on("disconnect", function() {

        if (socket.id == firstClientId) {
            firstClientId = null
        }
        
        let i = id.indexOf(socket.id)
        online.splice(i, 1)
        id.splice(i, 1)

        console.log("Remaining online: " + online)
        socket.broadcast.emit("leaving")
        console.log("Client is disconnecting")
    })
})