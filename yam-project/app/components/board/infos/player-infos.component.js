import {StyleSheet, Text, View} from "react-native";

const PlayerInfos = () => {
    return (
        <View style={styles.playerInfosContainer}>
            <Text>Informations du <br/>joueur : </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    playerInfosContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: 'black',
    }
});

export default PlayerInfos;