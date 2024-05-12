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

const playerOutQueue = (socket) => {
  queue = queue.filter((sock) => sock.id !== socket.id);
};

const updateClientViewTimer = (game) => {
    game.player1Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:1', game.gameState));
    if(!game.vsbot)
        game.player2Socket.emit('game.timer', GameService.send.forPlayer.gameTimer('player:2', game.gameState));
}

const updateClientViewDecks = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
        if(!game.vsbot)
            game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
    }, 200);
}

const updateClientViewChoices = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
        if(!game.vsbot)
            game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
    }, 200);
}

const updateClientViewGrid = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
        if(!game.vsbot)
            game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
    }, 200);
}

const updateClientViewScore = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:1', game));
        if(!game.vsbot)
            game.player2Socket.emit('game.score.view-state', GameService.send.forPlayer.scoreViewState('player:2', game));
    }, 200);
}

const updateClientViewTokens = (game) => {
    setTimeout(() => {
        game.player1Socket.emit('game.tokens.view-state', GameService.send.forPlayer.tokensViewState('player:1', game));
        if(!game.vsbot)
            game.player2Socket.emit('game.tokens.view-state', GameService.send.forPlayer.tokensViewState('player:2', game));
    }, 200);
}

const updateGameInterval = (game) => {
    game.gameState.timer--;

    if (game.gameState.timer === 0) {
        game.gameState.choices.isDefi = false;
        game.player1Socket.emit('game.isDefi', game.gameState.choices.isDefi);

        if(!game.vsbot)
            game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
        else
            game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'bot' : 'player:1';

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

const challengeDice = (socket, botTour = false) => {
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];
    game.gameState.choices.isDefi = true;
    if(!botTour)
        game.player1Socket.emit('game.isDefi', game.gameState.choices.isDefi);
}

const rollDice = (socket) => {
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];

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

const lockDice = (socket, diceId) => {
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];
    game.gameState.deck.dices[diceId].locked = !game.gameState.deck.dices[diceId].locked
    updateClientViewDecks(game);
};

const selectChoice = (socket, data) => {
    // gestion des choix
    let game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];
    game.gameState.choices.idSelectedChoice = data.choiceId;

    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(game.gameState.choices.idSelectedChoice, game.gameState.grid);

    updateClientViewChoices(game);
    updateClientViewGrid(game);
};

const selectCell = (socket, data) => {
    const game = games[GameService.utils.findGameIndexBySocketId(games, socket.id)] || botGames[GameService.utils.findGameIndexBySocketId(botGames, socket.id)];

    // La sélection d'une cellule signifie la fin du tour (ou plus tard le check des conditions de victoires)
    // On reset l'état des cases qui étaient précédemment clicables.
    game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
    game.gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, game.gameState);

    let statusPlayer = GameService.score.calculScore(game.gameState.grid, game.gameState.currentTurn);

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

const playerOutGame = (socket) => {
  games = games.filter((game) => game.player1Socket.id !== socket.id && game.player2Socket.id !== socket.id);
  socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
};

const botTurn = (game) => {
    rollDice(game.player1Socket);

    if(Math.random() < 0.5 && game.gameState.deck.rollsCounter < 3) {
        lockDice(game.player1Socket, Math.floor(Math.random() * 4 +1));
    }

    if(Math.random() < 0.5 && game.gameState.deck.rollsCounter === 2) {
        challengeDice(game.player1Socket, true);
    }

    if(game.gameState.choices.availableChoices.length > 0) {

        const choice = {
            choiceId: game.gameState.choices.availableChoices[Math.floor(Math.random() * (game.gameState.choices.availableChoices.length))].id,
        }

        selectChoice(game.player1Socket, choice);

        let cellSelected = {};
        game.gameState.grid.forEach((rows, rowIndex) => {
            rows.forEach((cell, cellIndex) => {
                if (cell.canBeChecked) {
                    cellSelected = {"cellId": cell.id, "rowIndex": rowIndex, "cellIndex": cellIndex};
                }
            })
        });

        if(Object.keys(cellSelected).length > 0) {
            selectCell(game.player1Socket, cellSelected);
        }
    }
}

const createGame = (player1Socket, player2Socket) => {

    const newGame = GameService.init.gameState(false);
    newGame['idGame'] = uniqid();
    newGame['player1Socket'] = player1Socket;
    newGame['player2Socket'] = player2Socket;
    newGame['vsbot'] = false;

    games.push(newGame);

    const gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

    games[gameIndex].gameState.grid = GameService.init.grid();

    games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
    games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

    updateClientViewDecks(games[gameIndex])
    updateClientViewGrid(games[gameIndex]);
    updateClientViewScore(games[gameIndex]);
    updateClientViewTokens(games[gameIndex]);

    const gameInterval = setInterval(() => {
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

const createBotGame = (player1Socket) => {

    const newGame = GameService.init.gameState(true);
    newGame['idGame'] = uniqid();
    newGame['player1Socket'] = player1Socket;
    newGame['vsbot'] = true;

    botGames.push(newGame);

    const gameIndex = GameService.utils.findGameIndexById(botGames, newGame.idGame);

    botGames[gameIndex].gameState.grid = GameService.init.grid();

    botGames[gameIndex].player1Socket.emit('game.vsbot.start', GameService.send.forPlayer.viewGameState('player:1', botGames[gameIndex]));
    updateClientViewDecks(botGames[gameIndex])
    updateClientViewGrid(botGames[gameIndex]);
    updateClientViewScore(botGames[gameIndex]);
    updateClientViewTokens(botGames[gameIndex]);

    const gameInterval = setInterval(() => {
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