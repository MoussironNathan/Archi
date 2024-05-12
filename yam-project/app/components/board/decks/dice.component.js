import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";

const images = {
    1: require('../../../img/1.png'),
    2: require('../../../img/2.png'),
    3: require('../../../img/3.png'),
    4: require('../../../img/4.png'),
    5: require('../../../img/5.png'),
    6: require('../../../img/6.png'),
};

const Dice = ({ index, locked, value, onPress, opponent }) => {

    const imageSource = images[value];

    const handlePress = () => {
        if (!opponent) {
            onPress(index);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.dice, locked && styles.lockedDice]}
            onPress={handlePress}
            disabled={opponent}
        >
            <Image source={imageSource} style={{ width: 50, height: 50 }}/>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    dice: {
        width: 50,
        height: 50,
        backgroundColor: "white",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        margin: 'auto',
        marginBottom: '2%'
    },
    lockedDice: {
        backgroundColor: "gray",
    },
});

export default Dice;