
const { Socket } = require('socket.io');
const express = require("express");

const app = express();
const http = require("http").createServer(app);
const path = require("path");
const port = 3000;

/**
 * @type {Socket}
*/
const io = require("socket.io")(http);

const { uniqueNamesGenerator, names } = require('unique-names-generator');

const { Player, Games, Game, Quote } = require("./public/Games");

const yaml = require('js-yaml');
const fs = require('fs');

const THEMES = require("./themes/data.json");
const DATA = [];

for (i = 0; i < THEMES.length; i++) {
    const themeData = THEMES[i];
    const theme = themeData.theme;
    const file = yaml.load(fs.readFileSync(`./themes/${themeData.path}`, 'utf8'));
    const quotes = file.questions;
    for (j = 0; j < quotes.length; j++) {
        const quote = quotes[j];
        DATA.push(new Quote(quote.quote, quote.answer, theme));
    }
}

app.use("/jquery", express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use("/clipboard", express.static(path.join(__dirname, "node_modules/clipboard/dist")));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/home/index.html"));
});

app.get("/lobby/:code", (req, res) => {
    const code = req.params.code;
    if (games.containt(code))
        res.sendFile(path.join(__dirname, "public/lobby/index.html"));
    else
        res.redirect("..");
});

app.get("/game/:code", (req, res) => {
    const code = req.params.code;
    if (games.containt(code))
        res.sendFile(path.join(__dirname, "public/game/index.html"));
    else
        res.redirect("..");
});

http.listen(port, () => {
    console.log(`App server is running on port ${port}`);
});

const games = new Games();

io.on("connection", (socket) => {
    socket.on("get-random-name", () => {
        socket.emit("get-random-name", uniqueNamesGenerator({dictionaries: [names]}));
    });

    socket.on("create-game", (hostID) => {
        const game = games.create(hostID);
        socket.emit("create-game", game);
    });

    socket.on("get-game-data", (code, playerID) => {
        let game = games.get(code);
        if (game == undefined) return;
        if (!game.containtPlayer(playerID)) game = undefined;
        socket.emit("get-game-data", game);
    });

    socket.on("join-game", (player, code) => {
        if (games.containt(code)) {
            const game = games.get(code);
            game.addPlayer(player);
            socket.emit("join-game", game);
            socket.broadcast.emit(`update-players-game-${code}`, game);
        } else
            socket.emit("join-game", undefined);
    });

    socket.on("edit-option-game", (playerID, code, option) => {
        if (games.get(code).host.id == playerID) {
            socket.broadcast.emit(`edit-option-game-${code}`, option);
        }
    });

    socket.on("load-game", (code, options) => {
        const game = games.get(code);
        game.started = true;
        socket.emit(`load-game-${code}`, game);
        socket.broadcast.emit(`load-game-${code}`, game);

        startGame(socket, game, options);
    });

    socket.on("add-point-player", (playerID, code, points) => {
        const game = games.get(code);
        game.addPoints(playerID, points);
    });
});


function startGame(socket, game, options) {
    const code = game.code;
    game.createQuoteList(DATA, options);
    setTimeout(() => {
        socket.emit(`start-game-${code}`, game);
        socket.broadcast.emit(`start-game-${code}`, game);
    }, 7000);

    games.update(game);

    let i = 0;
    const loop = setInterval(() => {
        const quote = game.quotes[i];

        socket.emit(`load-quote-game-${code}`, quote);
        socket.broadcast.emit(`load-quote-game-${code}`, quote);

        i++;
        if (i >= game.quotes.length) {
            clearInterval(loop);
            endGame(socket, code);
        }
    }, 10*1000);
}

function endGame(socket, code) {
    setTimeout(() => {
        const game = games.get(code);

        socket.emit(`end-game-${code}`, game);
        socket.broadcast.emit(`end-game-${code}`, game);

        games.stop(code);
    }, 10*1000);
}

function getCurrentTime() {
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    let dateTime = cDate + ' ' + cTime;
    return dateTime
}

setInterval(() => {
    console.log(`\n[${getCurrentTime()}] Actualisation :`);
    console.log(games);
}, 5*1000);
