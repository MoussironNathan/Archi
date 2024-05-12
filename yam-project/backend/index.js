const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const GameService = require('./services/game.service');

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let botGames = [];
let queue = [];

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const newPlayerInQueue = (socket) => {
    queue.push(socket);

    // Queue management
    if (queue.length >= 2) {
        const player1Socket = queue.shift();
        const player2Socket = queue.shift();
        createGame(player1Socket, player2Socket);
    } else {
        socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
    }
};

// Fonction pour retirer le socket du joueur de la file de sortie
const playerOutQueue = (socket) => {
  queue = queue.filter((sock) => sock.id !== socket.id);
};

// Fonction pour mettre à jour le timer
const updateClientViewTimer = (game) => {
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    if(!game.vsbot)
        game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
}

// Fonction pour mettre à jour le deck du joueur
const updateClientViewDecks = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
        if(!game.vsbot)
            game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
    }, 200);
}

// Fonction pour mettre à jour les choix possibles
const updateClientViewChoices = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
        if(!game.vsbot)
            game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
    }, 200);
}

// Fonction pour mettre à jour la grille
const updateClientViewGrid = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
        if(!game.vsbot)
            game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
    }, 200);
}

// Fonction pour mettre à jour le score
const updateClientViewScore = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:1', game));
        if(!game.vsbot)
            game.player2Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:2', game));
    }, 200);
}

// Fonction pour mettre à jour les pions pour jouer
const updateClientViewTokens = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.tokens.view-state', GameService.send.forPlayer.tokensViewState('player:1', game));
        if(!game.vsbot)
            game.player2Socket.emit('game.tokens.view-state', GameService.send.forPlayer.tokensViewState('player:2', game));
    }, 200);
}

// Fonction pour mettre à jour l'état du jeu
const updateGameInterval = (game) => {
    // Réduction du décompte du minuteur du jeu
    game.gameState.timer--;

    // Vérification si le minuteur du tour actuel a atteint zéro
    if (game.gameState.timer === 0) {
        game.gameState.choices.isDefi = false;
        game.player1Socket.emit('game.isDefi', game.gameState.choices.isDefi);

        // Passage au tour suivant selon qu'il y a un joueur ou un bot
        if(!game.vsbot)
            game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
        else
            game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'bot' : 'player:1';

        // Réinitialisation du timer, du jeu de cartes, des choix et de la grille du jeu
        game.gameState.timer = GameService.timer.getTurnDuration();
        game.gameState.deck = GameService.init.deck();
        updateClientViewDecks(game);

        game.gameState.choices = GameService.init.choices();
        updateClientViewChoices(game);

        game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
        updateClientViewGrid(game);

        updateClientViewScore(game);
    }
    updateClientViewTimer(game);
}

// Fonction pour initier un défi lorsqu'un joueur le lance ou lors du tour du bot
const challengeDice = (socket, botTour = false) => {
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];
    game.gameState.choices.isDefi = true;
    if(!botTour)
        game.player1Socket.emit('game.isDefi', game.gameState.choices.isDefi);
}

// Fonction pour lancer les dés dans le jeu
const rollDice = (socket) => {
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];

    // Vérification du nombre de lancers restants
    if(game.gameState.deck.rollsCounter < game.gameState.deck.rollsMaximum) {
        game.gameState.deck.dices = GameService.dices.roll(game.gameState.deck.dices);
        game.gameState.deck.rollsCounter ++;
    } else if(game.gameState.deck.rollsCounter === game.gameState.deck.rollsMaximum) {
        game.gameState.deck.dices = GameService.dices.roll(game.gameState.deck.dices);
        game.gameState.deck.rollsCounter ++;
        game.gameState.deck.dices = GameService.dices.lockEveryDice(game.gameState.deck.dices);
        game.gameState.timer = 10;
    }

    // combinations management
    const dices = game.gameState.deck.dices;
    const isDefi = game.gameState.choices.isDefi;
    const isSec = game.gameState.deck.rollsCounter === 2;

    // we affect changes to gameState
    game.gameState.choices.availableChoices = GameService.choices.findCombinations(dices, isDefi, isSec);
    game.gameState.choices.availableChoices = GameService.choices.checkPossibleCombinations(game.gameState.grid, game.gameState.choices.availableChoices)

    updateClientViewDecks(game);
    updateClientViewChoices(game);
};

// Fonction pour locker les dés
const lockDice = (socket, diceId) => {
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];
    game.gameState.deck.dices[diceId].locked = !game.gameState.deck.dices[diceId].locked
    updateClientViewDecks(game);
};

// Fonction pour choisir les choix disponibles
const selectChoice = (socket, data) => {
    // gestion des choix
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];
    game.gameState.choices.idSelectedChoice = data.choiceId;

    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(game.gameState.choices.idSelectedChoice, game.gameState.grid);

    updateClientViewChoices(game);
    updateClientViewGrid(game);
};

// Fonction pour selectionner une cellule de la grille de jeu
const selectCell = (socket, data) => {
    const game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];

    // La sélection d'une cellule signifie la fin du tour (ou plus tard le check des conditions de victoires)
    // On reset l'état des cases qui étaient précédemment clicables.
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, game.gameState);

    let statusPlayer = GameService.score.calculScore(game.gameState.grid, game.gameState.currentTurn);

    // Gestion du résultat de la partie
    if(statusPlayer.winner) {
        game.gameState.winner = game.gameState.currentTurn;
    } else if(!game.vsbot) {
        if(game.gameState.player1.tokens === 0 || game.gameState.player2.tokens === 0) {
            if(game.gameState.player1.score === game.gameState.player2.score){
                game.gameState.winner = 'No winner, the match ended in a tie';
            } else {
                game.gameState.winner = game.gameState.player1.score < game.gameState.player2.score ? 'Player:2' : 'Player:1';
            }
        } else {
            game.gameState.player1.score = game.gameState.currentTurn === 'player:1' ? statusPlayer.score : game.gameState.player1.score;
            game.gameState.player2.score = game.gameState.currentTurn === 'player:2' ? statusPlayer.score : game.gameState.player2.score;
        }
    } else {
        if(game.gameState.player1.tokens === 0 || game.gameState.bot.tokens === 0) {
            if(game.gameState.player1.score === game.gameState.bot.score){
                game.gameState.winner = 'No winner, the match ended in a tie';
            } else {
                game.gameState.winner = game.gameState.player1.score < game.gameState.bot.score ? 'bot' : 'Player:1';
            }
        } else {
            game.gameState.player1.score = game.gameState.currentTurn === 'player:1' ? statusPlayer.score : game.gameState.player1.score;
            game.gameState.bot.score = game.gameState.currentTurn === 'bot' ? statusPlayer.score : game.gameState.bot.score;
        }
    }

    // Sinon on finit le tour
    game.gameState.choices.isDefi = false;
    game.player1Socket.emit('game.isDefi', game.gameState.choices.isDefi);
    if(!game.vsbot)
        game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    else
        game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'bot' : 'player:1';
    game.gameState.timer = GameService.timer.getTurnDuration();

    // On remet le deck et les choix à zéro (la grille, elle, ne change pas)
    game.gameState.deck = GameService.init.deck();
    game.gameState.choices = GameService.init.choices();

    // On reset le timer
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    if(!game.vsbot)
        game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));

    // et on remet à jour la vue
    updateClientViewDecks(game);
    updateClientViewChoices(game);
    updateClientViewGrid(game);
    updateClientViewScore(game);
    updateClientViewTokens(game);
}

// Fonction pour retirer un joueur d'une partie
const playerOutGame = (socket) => {
  games = games.filter((game) => game.player1Socket.id !== socket.id && game.player2Socket.id !== socket.id);
  socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
};

// Fonction pour effectuer le tour du bot
const botTurn = (game) => {
    // Le bot lance les dés
    rollDice(game.player1Socket);

    // Le bot verrouille un dé aléatoirement s'il a lancé moins de 3 fois et si un jet de dés aléatoire est réussi
    if(Math.random() < 0.5 && game.gameState.deck.rollsCounter < 3) {
        lockDice(game.player1Socket, Math.floor(Math.random() * 4 +1));
    }

    // Le bot lance un défi aléatoirement s'il a déjà lancé deux fois et si un jet de dés aléatoire est réussi
    if(Math.random() < 0.5 && game.gameState.deck.rollsCounter === 2) {
        challengeDice(game.player1Socket, true);
    }

    // Si le bot a des choix disponibles, il en sélectionne un aléatoirement
    if(game.gameState.choices.availableChoices.length > 0) {

        const choice = {
            choiceId: game.gameState.choices.availableChoices[Math.floor(Math.random() * (game.gameState.choices.availableChoices.length))].id,
        }

        selectChoice(game.player1Socket, choice);

        // Recherche de la première cellule cliquable et sélection de cette cellule
        let cellSelected = {};
        game.gameState.grid.forEach((rows, rowIndex) => {
            rows.forEach((cell, cellIndex) => {
                if (cell.canBeChecked) {
                    cellSelected = {"cellId": cell.id, "rowIndex": rowIndex, "cellIndex": cellIndex};
                }
            })
        });

        // Si une cellule cliquable est trouvée, le bot la sélectionne
        if(Object.keys(cellSelected).length > 0) {
            selectCell(game.player1Socket, cellSelected);
        }
    }
}

// Fonction pour créer une nouvelle partie entre deux joueurs
const createGame = (player1Socket, player2Socket) => {

    // Initialisation d'une nouvelle partie
    const newGame = GameService.init.gameState(false);
    newGame['idGame'] = uniqid();
    newGame['player1Socket'] = player1Socket;
    newGame['player2Socket'] = player2Socket;
    newGame['vsbot'] = false;

    // Ajout de la nouvelle partie à la liste des parties en cours
    games.push(newGame);

    const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

    games[gameIndex].gameState.grid = GameService.init.grid();

    games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
    games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

    // Mise à jour de la vue des dés, de la grille, du score et des jetons pour les joueurs
    updateClientViewDecks(games[gameIndex])
    updateClientViewGrid(games[gameIndex]);
    updateClientViewScore(games[gameIndex]);
    updateClientViewTokens(games[gameIndex]);

    const gameInterval = setInterval(() => {
        // Vérification s'il y a un gagnant
        if(!games[gameIndex].gameState.winner)
            updateGameInterval(games[gameIndex]);
        else {
            clearInterval(gameInterval);
            console.log('fin de partie, winner : ', games[gameIndex].gameState.winner);
        }
    }, 1000);


    player1Socket.on('disconnect', () => {
        clearInterval(gameInterval);
    });

    player2Socket.on('disconnect', () => {
        clearInterval(gameInterval);
    });
};

// Fonction pour créer une nouvelle partie contre un bot
const createBotGame = (player1Socket) => {

    // Initialisation d'une nouvelle partie avec un bot
    const newGame = GameService.init.gameState(true);
    newGame['idGame'] = uniqid();
    newGame['player1Socket'] = player1Socket;
    newGame['vsbot'] = true;

    // Ajout de la nouvelle partie à la liste des parties contre un bot
    botGames.push(newGame);

    const gameIndex = GameService.utils.findGameIndexById(botGames, newGame.idGame);

    botGames[gameIndex].gameState.grid = GameService.init.grid();

    botGames[gameIndex].player1Socket.emit('game.vsbot.start', GameService.send.forPlayer.viewGameState('player:1', botGames[gameIndex]));
    updateClientViewDecks(botGames[gameIndex])
    updateClientViewGrid(botGames[gameIndex]);
    updateClientViewScore(botGames[gameIndex]);
    updateClientViewTokens(botGames[gameIndex]);

    const gameInterval = setInterval(() => {
        // Vérification s'il y a un gagnant et mise à jour de l'état du jeu
        if(!botGames[gameIndex].gameState.winner) {
            updateGameInterval(botGames[gameIndex]);
            if (botGames[gameIndex].gameState.currentTurn === 'bot') {
                botTurn(botGames[gameIndex]);
            }
        } else {
            clearInterval(gameInterval);
            console.log('fin de partie winner : ', botGames[gameIndex].gameState.winner);
        }

    }, 1000);

    player1Socket.on('disconnect', () => {
        clearInterval(gameInterval);
    });
};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {
    console.log(`[${socket.id}] socket connected`);

    socket.on('queue.join', () => {
        console.log(`[${socket.id}] new player in queue `)
        newPlayerInQueue(socket);
    });

    socket.on('queue.leave', () => {
        console.log(`[${socket.id}] player out of queue `)
        playerOutQueue(socket);
    });

    socket.on('game-vsbot.join', () => {
        console.log(`[${socket.id}] new player in queue `)
        createBotGame(socket);
    });

    socket.on('game.dices.defi', () => {
        console.log(`[${socket.id}] player call challenge `)
        challengeDice(socket);
    });

    socket.on('game.dices.roll', () => {
        console.log(`[${socket.id}] player rolling dices `)
        rollDice(socket);
    });

    socket.on('game.dices.lock', (diceId) => {
        console.log(`[${socket.id}] player locking dices `)
        lockDice(socket, diceId);
    });

    socket.on('game.choices.selected', (data) => {
        console.log(`[${socket.id}] player locking dices `)
        selectChoice(socket, data);
    });

    socket.on('game.grid.selected', (data) => {
        console.log(`[${socket.id}] player selected cell`);
        selectCell(socket, data);
    });

    socket.on('disconnect', reason => {
        console.log(`[${socket.id}] socket disconnected - ${reason}`);
        playerOutQueue(socket);
    });

});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});