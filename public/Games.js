class Player {
    /**
     * Créer un joueur
     * @param {String} name Le nom du joueur
     * @param {String} id L'identifiant du joueur
     */
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}

class Games {
    /** 
     * Créer une liste vide de parties
     */
    constructor() {}

    /**
     * Créer automatiquement une partie
     * @param {Player} host L'host de la partie
     * @returns {Game} La partie créée
     */
    create(host) {
        const game = new Game(host);
        this[game.code] = game;
        return game
    }

    /**
     * Vérifie si un code est présent dans les parties disponibles
     * @param {String} code Le code de la partie
     * @returns {Boolean}
     */
    containt(code) {
        return this[code] != undefined
    }

    /**
     * Récupère les informations d'une partie grâce à son code
     * @param {String} code Le code de la partie
     * @returns {Game}
     */
    get(code) {
        return this[code]
    }

    /**
     * Met à jour une partie dans la liste
     * @param {Game} game Une partie
     */
    update(game) {
        this[game.code] = game;
    }

    /**
     * Supprime une partie de la liste
     * @param {String} code Le code de la partie à supprimer
     */
    stop(code) {
        delete(this[code]);
    }
}

class Game {
    /**
     * Créer une partie
     * @param {Player} host L'host de la partie
     */
    constructor(host) {
        this.code = randomCode(4) + "-" + randomCode(4);
        this.host = host;
        this.players = [host];
        this.theme;
        this.nbRound;
        this.started = false;
        this.quotes = [];
        this.points = {};
        this.points[host.id] = 0;
    }
    
    /**
     * Ajoute un joueur à une partie
     * @param {Player} player Le joueur
     */
    addPlayer(player) {
        this.players.push(player);
        this.points[player.id] = 0;
    }

    /**
     * Vérifie si un joueur est dans une partie
     * @param {String} playerID L'identifiant du joueur
     * @returns {Boolean}
     */
    containtPlayer(playerID) {
        for (i = 0; i < this.players.length; i++) {
            if (this.players[i].id == playerID) return true
        }
        return false
    }

    /**
     * Créer une liste de @type {Quote}
     * @param {Array} data Une liste de @type {Quote}
     * @param {JSON} options Quelques options de choix
     */
    createQuoteList(data, options) {
        let quote = new Quote("-", "-", "-");
        for (i = 0; i < options.round; i++) {
            quote = data[Math.floor(Math.random()*data.length)];
            while(quote.theme != options.theme)
                quote = data[Math.floor(Math.random()*data.length)];
            this.quotes.push(quote);
        }
    }

    /**
     * Ajoute des points à un joueur
     * @param {String} playerID L'identifiant du joueur
     * @param {int} points Les points à ajouter
     */
    addPoints(playerID, points) {
        this.points[playerID] += points;
    }
}

class Quote {
    /**
     * Créer une citation
     * @param {String} quote La citation
     * @param {Array} answers Les réponses possibles
     * @param {String} theme Le thème de la citation
     */
    constructor(quote, answers, theme) {
        this.quote = quote;
        this.answers = answers;
        this.theme = theme;
    }
}

function randomNumber() {
    return Math.floor(Math.random() * 10);
}

function randomCode(length) {
    let code = "";
    for (i = 0; i < length; i++)
        code += randomNumber();
    return code
}

function playsound(fileName) {
    var audio = new Audio(fileName);
    audio.loop = false;
    audio.play(); 
}

module.exports = { Player, Games, Game, Quote };