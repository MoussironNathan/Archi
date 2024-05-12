import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../../contexts/socket.context";
import {StyleSheet, Text, View} from "react-native";

const PlayerTimer = () => {
    const socket = useContext(SocketContext);
    const [playerTimer, setPlayerTimer] = useState(0);

    useEffect(() => {
        socket.on("game.timer", (data) => {
            setPlayerTimer(data['playerTimer'])
        });
    }, []);

    return (
        <View style={styles.playerTimerContainer}>
            <Text>Timer: <br/>
                <div style={styles.timer}>
                    {playerTimer}
                </div>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    playerTimerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timer: {
        textAlign: 'center',
    }
});

export default PlayerTimer;