import {StyleSheet, Text, View} from "react-native";
import {SocketContext} from "../../../contexts/socket.context";
import {useContext, useEffect, useState} from "react";

const PlayerScore = () => {

    const socket = useContext(SocketContext);
    const [score, setScore] = useState(0);

    useEffect(() => {

        socket.on("game.score.view-state", (data) => {
            setScore(data['playerScore']);
        });

    }, []);

    return (
        <View style={styles.playerScoreContainer}>
            <Text>Score: <br/>
                <div style={styles.score}>
                    {score}
                </div>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    playerScoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: 'black',
    },
    score: {
        textAlign: 'center',
    }
});

export default PlayerScore;