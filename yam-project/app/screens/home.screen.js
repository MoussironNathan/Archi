import {StyleSheet, View, Button, Text, TouchableOpacity} from "react-native";
import {useState} from "react";

export default function HomeScreen({ navigation }) {

    const [isButton1Hovered, setIsButton1Hovered] = useState(false);
    const [isButton2Hovered, setIsButton2Hovered] = useState(false);

    const handleButton1MouseEnter = () => {
        setIsButton1Hovered(true);
    };

    const handleButton1MouseLeave = () => {
        setIsButton1Hovered(false);
    };

    const handleButton2MouseEnter = () => {
        setIsButton2Hovered(true);
    };

    const handleButton2MouseLeave = () => {
        setIsButton2Hovered(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.pageHeader}>
                    <h2>Que souhaitez-vous faire ?</h2>
                </View>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.buttons, isButton1Hovered && styles.buttonHovered]}
                        onPress={() => navigation.navigate('OnlineGameScreen')}
                        onMouseEnter={handleButton1MouseEnter}
                        onMouseLeave={handleButton1MouseLeave}
                    >
                        <Text style={styles.textButtons}>Jouer en ligne</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttons, isButton2Hovered && styles.buttonHovered]}
                        onPress={() => navigation.navigate('VsBotGameScreen')}
                        onMouseEnter={handleButton2MouseEnter}
                        onMouseLeave={handleButton2MouseLeave}
                    >
                        <Text style={styles.textButtons}>Jouer contre le bot</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F7732",
    },
    content: {
        width: "50%",
        height: "70%",
        margin: 'auto',
        borderWidth: 10,
        borderRadius: 25,
        borderColor: "#fff",
        backgroundColor: "#0F7732",
    },
    pageHeader: {
        flex: 1,
        textAlign: 'center',
        alignItems: "center",
        justifyContent: "center",
    },
    buttonsContainer: {
        flex: 3,
        alignItems: "center",
        justifyContent: "space-around"
    },
    buttons: {
        borderWidth: 5,
        borderRadius: 15,
        borderColor: "#000",
        width: "60%",
        height: "35%",
    },
    buttonHovered: {
        color: "#fff",
        backgroundColor: "#1A1A1A",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8, // Pour l'ombre sur Android
        transform: [{ translateY: -2 }],
    },
    textButtons: {
        fontFamily: 'Bungee Shade',
        fontSize: 25,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        marginTop: "auto",
        marginBottom: "auto",
    }
});
