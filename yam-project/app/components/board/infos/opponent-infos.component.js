import {StyleSheet, Text, View} from "react-native";

const OpponentInfos = () => {
    return (
        <View style={styles.opponentInfosContainer}>
            <Text>Informations de <br/>l'Adversaire : </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    opponentInfosContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: 'black',
    }
});

export default OpponentInfos;