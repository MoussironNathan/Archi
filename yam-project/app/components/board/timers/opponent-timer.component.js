import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../../contexts/socket.context";
import {StyleSheet, Text, View} from "react-native";

const OpponentTimer = () => {
    const socket = useContext(SocketContext);
    const [opponentTimer, setOpponentTimer] = useState(0);

    useEffect(() => {
        socket.on("game.timer", (data) => {
            setOpponentTimer(data['opponentTimer'])
        });
    }, []);

    return (
        <View style={styles.opponentTimerContainer}>
            <Text>Timer: <br/>
                <div style={styles.timer}>
                    {opponentTimer}
                </div>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    opponentTimerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timer: {
        textAlign: 'center',
    }
});

export default OpponentTimer;