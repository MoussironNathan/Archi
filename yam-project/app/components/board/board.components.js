import React from "react";
import { View, StyleSheet } from 'react-native';
import PlayerTimer from "./timers/player-timer.component";
import OpponentTimer from "./timers/opponent-timer.component";
import OpponentDeckComponent from "./decks/opponent-deck.component";
import PlayerDeckComponent from "./decks/player-deck.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";
import OpponentInfos from "./infos/opponent-infos.component";
import OpponentScore from "./scores/opponent-score.component";
import PlayerInfos from "./infos/player-infos.component";
import PlayerScore from "./scores/player-score.component";
import OpponentTokens from "./tokens/opponent-tokens.component";
import PlayerTokens from "./tokens/player-tokens.component";

const Board = ({ gameViewState }) => {
    console.log(gameViewState);
    return (
        <View style={styles.container}>
            <View style={[styles.row, { height: '9%' }]}>
                <OpponentInfos />
                <OpponentScore />
                <OpponentTokens />
                <OpponentTimer />
            </View>
            <View style={[styles.row, { height: '82%' }]}>
                <View style={styles.semiRow1}>
                    <Grid />
                </View>
                <View style={[styles.semiRow2, { height: '100%' }]}>
                    <OpponentDeckComponent />
                    <Choices />
                    <PlayerDeckComponent />
                </View>
            </View>
            <View style={[styles.row, { height: '9%' }]}>
                <PlayerInfos />
                <PlayerScore />
                <PlayerTokens />
                <PlayerTimer />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: "#0F7732",
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    semiRow1: {
        flexDirection: 'row',
        height: '80%',
        width: '60%',
        borderBottomWidth: 1,
        borderColor: 'black',
        margin: 'auto',

    },
    semiRow2: {
        flexDirection: 'column',
        width: '35%',
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    opponentTimerScoreContainer: {
        flex: 4,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "lightgrey"
    },
    playerTimerScoreContainer: {
        flex: 4,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "lightgrey"
    },
});

export default Board;