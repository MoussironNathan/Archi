const TURN_DURATION = 30;

const GRID_INIT = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const ALL_COMBINATIONS = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];

const DECK_INIT = {
    dices: [
        { id: 1, value: '', locked: true },
        { id: 2, value: '', locked: true },
        { id: 3, value: '', locked: true },
        { id: 4, value: '', locked: true },
        { id: 5, value: '', locked: true },
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: TURN_DURATION,
        player1: {
            score: 0,
            tokens: 12
        },
        player2: {
            score: 0,
            tokens: 12
        },
        grid: [],
        choices: {},
        deck: {},
        winner: null
    }
}

const GAME_BOT_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: TURN_DURATION,
        player1: {
            score: 0,
            tokens: 12
        },
        bot: {
            score: 0,
            tokens: 12
        },
        grid: [],
        choices: {},
        deck: {},
        winner: null
    }
}

const GameService = {

    init: {
        // Init first level of structure of 'gameState' object
        gameState: (vsbot) => {
            const game = vsbot === false ? { ...GAME_INIT } : { ...GAME_BOT_INIT };
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = { ...DECK_INIT };
            game['gameState']['choices'] = { ...CHOICES_INIT }
            game['gameState']['grid'] = [ ...GRID_INIT];
            return game;
        },
        choices: () => {
            return { ...CHOICES_INIT };
        },
        deck: () => {
            return { ...DECK_INIT };
        },
        grid: () => {
            return [ ...GRID_INIT ];
        }
    },
    send: {
        forPlayer: {
            // Return conditionnaly gameState custom objet for player views
            viewGameState: (playerKey, game) => {
                if(!game.vsbot)
                    return {
                        inQueue: false,
                        inGame: true,
                        idPlayer:
                            (playerKey === 'player:1')
                                ? game.player1Socket.id
                                : game.player2Socket.id,
                        idOpponent:
                            (playerKey === 'player:1')
                                ? game.player2Socket.id
                                : game.player1Socket.id
                    };
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer: game.player1Socket.id
                };
            },
            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },
            gameTimer: (playerKey, gameState) => {
                // Selon la clé du joueur on adapte la réponse (player / opponent)
                if(!gameState.vsbot){
                    const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                    const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                    return { playerTimer: playerTimer, opponentTimer: opponentTimer };
                }
                else {
                    const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                    const botTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                    return { playerTimer: playerTimer, botTimer: botTimer };
                }
            },
            deckViewState: (playerKey, gameState) => {
                if(!gameState.vsbot){
                    return {
                        displayPlayerDeck: gameState.currentTurn === playerKey,
                        displayOpponentDeck: gameState.currentTurn !== playerKey,
                        displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                        rollsCounter: gameState.deck.rollsCounter,
                        rollsMaximum: gameState.deck.rollsMaximum,
                        dices: gameState.deck.dices
                    };
                }
                return {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayBotDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
            },
            choicesViewState: (playerKey, gameState) => {
                return {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                };
            },
            gridViewState: (playerKey, gameState) => {
                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid
                };
            },
            scoreViewState: (playerKey, game) => {
                if (!game.vsbot) {
                    return {
                        playerScore: game.gameState.player1.score,
                        opponentScore: game.gameState.player2.score
                    }
                } else {
                    return {
                        playerScore: game.gameState.player1.score,
                        opponentScore: game.gameState.bot.score
                    }
                }
            },
            tokensViewState: (playerKey, game) => {
                if (!game.vsbot) {
                    return {
                        playerTokens: game.gameState.player1.tokens,
                        opponentTokens: game.gameState.player2.tokens
                    }
                } else {
                    return {
                        playerTokens: game.gameState.player1.tokens,
                        opponentTokens: game.gameState.bot.tokens
                    }
                }
            }
        }
    },
    timer: {
        getTurnDuration: () => {
            return TURN_DURATION;
        }
    },
    dices: {
        roll: (dicesToRoll) => {
            return dicesToRoll.map(dice => {
                if (dice.value === "") {
                    // Si la valeur du dé est vide, alors on le lance en mettant le flag locked à false
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        id: dice.id,
                        value: newValue,
                        locked: false
                    };
                } else if (!dice.locked) {
                    // Si le dé n'est pas verrouillé et possède déjà une valeur, alors on le relance
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        ...dice,
                        value: newValue
                    };
                } else {
                    // Si le dé est verrouillé ou a déjà une valeur mais le flag locked est true, on le laisse tel quel
                    return dice;
                }
            });
        },

        lockEveryDice: (dicesToLock) => {
            return dicesToLock.map(dice => ({
                ...dice,
                locked: true
            }));
        }
    },
    choices: {
        findCombinations: (dices, isDefi, isSec) => {

            const allCombinations = ALL_COMBINATIONS;

            // Tableau des objets 'combinations' disponibles parmi 'ALL_COMBINATIONS'
            const availableCombinations = [];

            // Tableau pour compter le nombre de dés de chaque valeur (de 1 à 6)
            const counts = Array(7).fill(0);

            let hasPair = false; // check: paire
            let threeOfAKindValue = null; // check: valeur brelan
            let hasThreeOfAKind = false; // check: brelan
            let hasFourOfAKind = false; // check: carré
            let hasFiveOfAKind = false; // check: yam
            let hasStraight = false; // check: suite
            let isLessThanEqual8 = false;
            let sum = 0; // sum of dices

            dices.forEach((dice) => {
                counts[dice.value] += 1;
            });

            let cpt = 0
            counts.forEach((count, index) => {
                if(count >= 1){
                    sum = sum + (index*count);
                    if(count === 2) {
                        hasPair = true;
                    } else if(count === 3) {
                        threeOfAKindValue = index;
                        hasThreeOfAKind = true;
                    } else if (count === 4) {
                        threeOfAKindValue = index;
                        hasThreeOfAKind = true;
                        hasFourOfAKind = true;
                    } else if (count === 5){
                        threeOfAKindValue = index;
                        hasThreeOfAKind = true;
                        hasFourOfAKind = true;
                        hasFiveOfAKind = true;
                    }
                }
                cpt ++;
            });
            isLessThanEqual8 = sum <= 8;

            let str = counts.join('');
            if (/11111/.test(str))
                hasStraight = true;

            // return available combinations
            allCombinations.forEach(combination => {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8) ||
                    (combination.id === 'defi' && isDefi && (
                            (hasPair && hasThreeOfAKind) ||
                            hasFourOfAKind ||
                            hasFiveOfAKind ||
                            hasStraight ||
                            isLessThanEqual8
                    ))
                ) {
                    availableCombinations.push(combination);
                }
            });
            const notOnlyBrelan = availableCombinations.some(combination => !combination.id.includes('brelan'));

            if (isSec && availableCombinations.length > 0 && notOnlyBrelan) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'sec'));
            }
            return availableCombinations;
        },

        checkPossibleCombinations: (grid, combinations) => {
            let possibleCombinations = [];
            grid.forEach(row => {
                row.forEach(cell => {
                    combinations.forEach(combination => {
                        if(combination.id === cell.id && cell.owner === null){
                            if(!possibleCombinations.includes(combination))
                            possibleCombinations.push(combination);
                        }
                    })
                })
            })
            return possibleCombinations;
        }
    },
    grid: {
        resetcanBeCheckedCells: (grid) => {
            // La grille retournée doit avoir le flag 'canBeChecked' de toutes les cases de la 'grid' à 'false'
            return grid.map(row => row.map(cell => {
                return {...cell, canBeChecked: false};
            }));
        },
        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {
            // La grille retournée doit avoir toutes les 'cells' qui ont le même 'id' que le 'idSelectedChoice' à 'canBeChecked: true'
            return grid.map(row => row.map(cell => {
                    if (cell.id === idSelectedChoice && cell.owner === null)
                        return {...cell, canBeChecked: true};
                    else
                        return { ...cell};
            }));
        },
        selectCell: (idCell, rowIndex, cellIndex, gamestate, currentTurn, grid) => {
            // La grille retournée doit avoir la case selectionnée par le joueur du tour en cours à 'owner: currentTurn'
            // Nous avons besoin de rowIndex et cellIndex pour différencier les deux combinaisons similaires du plateau
            gamestate.grid[rowIndex][cellIndex].owner = gamestate.currentTurn;
            switch(gamestate.currentTurn) {
                case 'player:1':
                    gamestate.player1.tokens--;
                    break;
                case 'player:2':
                    gamestate.player2.tokens--;
                    break;
                case 'bot':
                    gamestate.bot.tokens--;
                    break;
            }
            return gamestate.grid;
        }
    },
    score: {
        calculScore: (grid, player) => {
            let winner = false;
            let score = 0;
            // calcul verticale
            grid.forEach((row, rowIndex) => {
                row.forEach((cell, cellIndex) => {
                    if (rowIndex <= grid.length - 3 && !winner && grid[rowIndex][cellIndex].owner === player) {
                        let consecutiveVertical = checkVerticale(grid, rowIndex, cellIndex, 5);

                        if (consecutiveVertical === 5) {
                            winner = grid[rowIndex][cellIndex].owner;
                        } else if (consecutiveVertical >= 3) {
                            score += 1;
                        }
                    }
                })
            })
            // calcul horizontale
            grid.forEach((row, rowIndex) => {
                row.forEach((cell, cellIndex) => {
                    if (cellIndex <= row.length - 3 && !winner && grid[rowIndex][cellIndex].owner === player) {
                        let consecutiveHorizontal = checkHorizontale(grid, rowIndex, cellIndex, 5);

                        if (consecutiveHorizontal === 5) {
                            winner = grid[rowIndex][cellIndex].owner;
                        } else if (consecutiveHorizontal >= 3) {
                            score += 1;
                        }
                    }
                })
            })
            // calcul diagonale
            grid.forEach((row, rowIndex) => {
                row.forEach((cell, cellIndex) => {
                    if (rowIndex <= grid.length - 3 && cellIndex >= row.length - 3 && !winner && grid[rowIndex][cellIndex].owner === player) {
                        let consecutiveDiagonaleDroite = checkDiagonalDroite(grid, rowIndex, cellIndex, 5);

                        if (consecutiveDiagonaleDroite === 5) {
                            winner = grid[rowIndex][cellIndex].owner;
                        } else if (consecutiveDiagonaleDroite >= 3) {
                            score += 1;
                        }

                        let consecutiveDiagonaleGauche = checkDiagonalGauche(grid, rowIndex, cellIndex, 5);

                        if (consecutiveDiagonaleGauche === 5) {
                            winner = grid[rowIndex][cellIndex].owner;
                        } else if (consecutiveDiagonaleGauche >= 3) {
                            score += 1;
                        }
                    }
                })
            })
            return {"winner": winner, "score": score};
        }
    },
    utils: {
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },
        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                if(!games[i].vsbot){
                    if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) {
                        return i; // Retourne l'index du jeu si le socket est trouvé
                    }
                } else {
                    if (games[i].player1Socket.id === socketId) {
                        return i; // Retourne l'index du jeu si le socket est trouvé
                    }
                }
            }
            return -1;
        }
    }
}

function checkVerticale(grid, rowIndex, cellIndex, consecutiveNeeded) {
    let consecutiveCount = 1;
    let currentOwner = grid[rowIndex][cellIndex].owner;

    for (let i = 1; i < consecutiveNeeded; i++) {
        let nextRowIndex = rowIndex + i;

        // Vérifier si on dépasse les limites du plateau ou si le propriétaire du jeton change
        if (nextRowIndex >= grid.length || grid[nextRowIndex][cellIndex].owner !== currentOwner) {
            if(consecutiveCount >= 3) {
                return consecutiveCount;
            }
            return 0;
        }
        consecutiveCount++;
    }
    return consecutiveCount;
}

function checkHorizontale(grid, rowIndex, cellIndex, consecutiveNeeded) {
    let consecutiveCount = 1;
    let currentOwner = grid[rowIndex][cellIndex].owner;

    for (let i = 1; i < consecutiveNeeded; i++) {
        let nextCellIndex = cellIndex + i;

        // Vérifier si on dépasse les limites du plateau ou si le propriétaire du jeton change
        if (nextCellIndex >= grid[rowIndex].length || grid[rowIndex][nextCellIndex].owner !== currentOwner) {
            if(consecutiveCount >= 3) {
                return consecutiveCount;
            }
            return 0;
        }
        consecutiveCount++;
    }
    return consecutiveCount;
}

function checkDiagonalDroite(grid, rowIndex, cellIndex, consecutiveNeeded) {
    let consecutiveCount = 1;
    let currentOwner = grid[rowIndex][cellIndex].owner;

    for (let i = 1; i < consecutiveNeeded; i++) {
        let newRow = rowIndex + i;
        let newCell = cellIndex + i;

        // Vérifier si on dépasse les limites du plateau ou si le propriétaire du jeton change
        if (newRow < 0 || newRow >= grid.length || newCell < 0 || newCell >= grid[rowIndex].length || grid[newRow][newCell].owner !== currentOwner) {
            if(consecutiveCount >= 3) {
                return consecutiveCount;
            }
            return 0;
        }
        consecutiveCount++;
    }
    return consecutiveCount;
}

function checkDiagonalGauche(grid, rowIndex, cellIndex, consecutiveNeeded) {
    let consecutiveCount = 1;
    let currentOwner = grid[rowIndex][cellIndex].owner;

    for (let i = 1; i < consecutiveNeeded; i++) {
        let newRow = rowIndex + i;
        let newCell = cellIndex - i;
        // Vérifier si on dépasse les limites du plateau ou si le propriétaire du jeton change
        if (newRow < 0 || newRow >= grid.length || newCell < 0 || newCell >= grid[rowIndex].length || grid[newRow][newCell].owner !== currentOwner) {
            if(consecutiveCount >= 3) {
                return consecutiveCount;
            }
            return 0;
        }
        consecutiveCount++;
    }
    return consecutiveCount;
}

module.exports = GameService;