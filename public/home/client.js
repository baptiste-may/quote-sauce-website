
const socket = io();

if (Cookies.get("id") == undefined)
    Cookies.set("id", Math.random().toString(36).substr(2, 9));

if (Cookies.get("name") == undefined) {
    socket.emit("get-random-name");
    socket.on("get-random-name", (name) => {
        Cookies.set("name", name);
        console.log("Bienvenue", name, "!");
    });
} else {
    $("#name-input").val(Cookies.get("name"));
}

const clientPlayer = new Player(Cookies.get("name"), Cookies.get("id"));

$("#name-form").on("submit", (e) => {
    e.preventDefault();

    const name = $("#name-input").val();
    Cookies.set("name", name);

    message("name", "Ton pseudo a été modifié !", "#0C0");

    playsound("../sounds/up-1.wav");
});

$("#code-form").on("submit", (e) => {
    e.preventDefault();

    message("code", "Veuillez patienter...", "#555");

    socket.emit("join-game", clientPlayer, $("#code-input").val());
    socket.on("join-game", (game) => {
        if (game == undefined) {
            message("code", "Le code n'existe pas !", "#C00");
            playsound("../sounds/error-1.wav");
        } else
            window.location.href = `/lobby/${game.code}`;
    });
});

$("#create-form").on("submit", (e) => {
    e.preventDefault();

    message("create", "Veuillez patienter...", "#555");

    socket.emit("create-game", clientPlayer);
    socket.on("create-game", (game) => {
        window.location.href = `/lobby/${game.code}`;
    });
});



function message(form, text, color) {
    const element = $(`#${form}-message`);
    element.text(text);
    element.css("color", color);
    element.css("opacity", 1);
    setTimeout(() => element.css("opacity", 0), 2000);
}