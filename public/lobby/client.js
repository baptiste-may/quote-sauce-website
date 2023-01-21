
const socket = io();

const code = window.location.pathname.replace("/lobby/", "");
if (code == "") window.location.href = "..";

$("#code").text(code);
$("#code").on("click", () => {
    navigator.clipboard.writeText(code).then(() => alert("Le code a été copié !"));
});

socket.emit("get-game-data", code, Cookies.get("id"));
socket.on("get-game-data", (game) => {
    if (game == undefined || game.started) window.location.href = "..";

    if (Cookies.get("id") == game.host.id) {
        $("#theme-input").removeAttr("disabled");
        $("#round-input").removeAttr("disabled");
        $("#start-game").removeAttr("disabled")
    }

    function updatePlayers(gameChosen) {
        $("#players").empty();
        for (i = 0; i < gameChosen.players.length; i++) {
            const player = gameChosen.players[i];
            $("#players").append(`<p id="player-${player.id}">${((player.id == gameChosen.host.id) ? "🛃 " : "") + player.name}</p>`);
        }
        playsound("../sounds/up-2.wav");
    }
    updatePlayers(game);
    socket.on(`update-players-game-${code}`, (game) => {
        if (game.code == code) {
            updatePlayers(game);
        }
    });

    socket.on(`load-game-${code}`, (game) => {
        if (game.code == code) {
            window.location.href = `/game/${code}`;
        }
    });
});

$("#theme-input").on("change", (e) => {
    socket.emit("edit-option-game", Cookies.get("id"), code, {type: "theme", val: $("#theme-input").val()});
});

$("#round-input").on("change", (e) => {
    socket.emit("edit-option-game", Cookies.get("id"), code, {type: "round", val: $("#round-input").val()});
});

socket.on(`edit-option-game-${code}`, (options) => {
    if (options.type == "theme")
        $("#theme-input").val(options.val);
    else
        $("#round-input").val(options.val);
});

$("#options-form").on("submit", (e) => {
    e.preventDefault();
    socket.emit("load-game", code, {theme: $("#theme-input").val(), round: $("#round-input").val()});
    setTimeout(() => {
        socket.emit("start-game", code);
    }, 5000);
});