import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";

const PlayerDeckComponent = () => {

    const socket = useContext(SocketContext);
    const [displayPlayerDeck, setDisplayPlayerDeck] = useState(false);
    const [dices, setDices] = useState(Array(5).fill(false));
    const [displayRollButton, setDisplayRollButton] = useState(false);
    const [rollsCounter, setRollsCounter] = useState(0);
    const [rollsMaximum, setRollsMaximum] = useState(3);
    const [isDefi, setIsDefi] = useState(false);

    useEffect(() => {
        socket.on("game.deck.view-state", (data) => {
            setDisplayPlayerDeck(data['displayPlayerDeck']);
            if (data['displayPlayerDeck']) {
                setDisplayRollButton(data['displayRollButton']);
                setRollsCounter(data['rollsCounter']);
                setRollsMaximum(data['rollsMaximum']);
                setDices(data['dices']);
            }
        });
        socket.on('game.isDefi', (defi) => {
            setIsDefi(defi);
        })
    }, []);

    const toggleDiceLock = (index) => {
        const newDices = [...dices];
        if (newDices[index].value !== '' && displayRollButton) {
            socket.emit("game.dices.lock", newDices[index].id-1);
        }
    };

    const rollDices = () => {
        if (rollsCounter <= rollsMaximum) {
            socket.emit("game.dices.roll");
        }
    };

    const makeDefi = () => {
        socket.emit("game.dices.defi");
    };

    return (

        <View style={[styles.deckPlayerContainer, !displayPlayerDeck && styles.noDeckPlayerContainer]}>

            {displayPlayerDeck && (

                <>
                    {displayRollButton && (

                        <>
                            <View style={styles.rollInfoContainer}>
                                <Text style={styles.rollInfoText}>
                                    Lancer {rollsCounter} / {rollsMaximum}
                                </Text>
                            </View>
                        </>

                    )}

                    <View style={styles.diceContainer}>
                        {dices.map((diceData, index) => (
                            <Dice
                                key={diceData.id}
                                index={index}
                                locked={diceData.locked}
                                value={diceData.value}
                                onPress={toggleDiceLock}
                            />
                        ))}
                    </View>

                    {displayRollButton && (
                        <>
                            <TouchableOpacity style={styles.rollButton} onPress={rollDices}>
                                <Text style={styles.rollButtonText}>Roll</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {displayRollButton && rollsCounter === 2 && !isDefi &&(
                        <>
                            <TouchableOpacity style={styles.challengeButton} onPress={makeDefi} disabled={isDefi}>
                                <Text style={styles.challengeButtonText}>Challenge</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    deckPlayerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noDeckPlayerContainer: {
        flex: 0,
    },
    rollInfoContainer: {
        marginBottom: 10,
    },
    rollInfoText: {
        fontSize: 14,
        fontStyle: "italic",
    },
    diceContainer: {
        flexDirection: "row",
        flexWrap: 'wrap',
        width: "70%",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    rollButton: {
        width: "70%",
        paddingVertical: 10,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        marginBottom: '5%',
    },
    rollButtonText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
    },
    challengeButton: {
        width: "70%",
        paddingVertical: 10,
        borderRadius: 5,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "black"
    },
    challengeButtonText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
    },
});

export default PlayerDeckComponent;