
const socket = io();

const code = window.location.pathname.replace("/game/", "");
// if (code == "") window.location.href = "..";

let actualQuote;

socket.emit("get-game-data", code, Cookies.get("id"));
socket.on("get-game-data", (game) => {
    if (game == undefined || !game.started) window.location.href = "..";

    socket.on(`start-game-${game.code}`, async (game) => {
        const title = $("#title")
        title.text("A vos marques !");
        playsound("../sounds/up-3.wav");
        await sleep(1000);
        title.text("Prêt ?");
        playsound("../sounds/up-3.wav");
        await sleep(1000);
        title.text("Devinez !");
        playsound("../sounds/up-4.wav");

        $("#answer-form").on("submit", (e) => {
            e.preventDefault();

            let hasFound = false;
            for (i = 0; i < actualQuote.answers.length; i++) {
                if ($("#answer-input").val().toLowerCase() == actualQuote.answers[i].toLowerCase()) {
                    hasFound = true;
                }
            }

            if (hasFound) {
                socket.emit("add-point-player", Cookies.get("id"), code, 1);

                playsound("../sounds/up-4.wav");
                $("#answer-input").prop("disabled", true);
                $("#answer-submit").prop("disabled", true);

                setTimeout(() => {
                    $("#answer-form").hide();
                }, 2000);
            } else
                playsound("../sounds/error-2.wav");
        });
    });

    socket.on(`load-quote-game-${code}`, (quote) => {
        actualQuote = quote;

        playsound("../sounds/up-3.wav");

        $("#answer-form").show();
        $("#answer-input").removeAttr("disabled");
        $("#answer-input").val("");
        $("#answer-submit").removeAttr("disabled");
        $("#title").text(quote.quote);
    });

    socket.on(`end-game-${code}`, (game) => {
        playsound("../sounds/up-4.wav")

        $("#answer-input").prop("disabled", true);
        $("#answer-submit").prop("disabled", true);
        $("#title").text("Fin de la partie !");

        console.log(game);
    });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || DEF_DELAY));
}
