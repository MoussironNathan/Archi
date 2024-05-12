import {useContext, useEffect, useState} from "react";
import {SocketContext} from "../../../contexts/socket.context";
import {TouchableOpacity, Text, View, StyleSheet} from "react-native";

const Choices = () => {

    const socket = useContext(SocketContext);

    const [displayChoices, setDisplayChoices] = useState(false);
    const [canMakeChoice, setCanMakeChoice] = useState(false);
    const [idSelectedChoice, setIdSelectedChoice] = useState(null);
    const [availableChoices, setAvailableChoices] = useState([]);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const handleButtonMouseEnter = () => {
        setIsButtonHovered(true);
    };

    const handleButtonMouseLeave = () => {
        setIsButtonHovered(false);
    };

    useEffect(() => {

        socket.on("game.choices.view-state", (data) => {
            setDisplayChoices(data['displayChoices']);
            setCanMakeChoice(data['canMakeChoice']);
            setIdSelectedChoice(data['idSelectedChoice']);
            setAvailableChoices(data['availableChoices']);
        });

    }, []);

    const handleSelectChoice = (choiceId) => {
        if (canMakeChoice) {
            setIdSelectedChoice(choiceId);
            socket.emit("game.choices.selected", { choiceId });
        }
    };

    return (
        <View style={styles.choicesContainer}>
            {displayChoices &&
                availableChoices.map((choice) => (
                    <TouchableOpacity
                        key={choice.id}
                        style={[
                            styles.choiceButton,
                            idSelectedChoice === choice.id && styles.selectedChoice,
                            isButtonHovered && styles.buttonHovered
                        ]}
                        onPress={() => handleSelectChoice(choice.id)}
                        onMouseEnter={handleButtonMouseEnter}
                        onMouseLeave={handleButtonMouseLeave}
                    >
                        <Text style={styles.choiceText}>{choice.value}</Text>
                    </TouchableOpacity>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    choicesContainer: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        borderWidth: 3,
        borderColor: "white",
    },
    choiceButton: {
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 2,
        marginVertical: 'auto',
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "15%"
    },
    buttonHovered: {
        borderColor: 'white',
        backgroundColor: "#1A1A1A",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        transform: [{ translateY: -2 }],
    },
    selectedChoice: {
        borderColor: 'white',
        backgroundColor: "#1A1A1A",
    },
    choiceText: {
        fontSize: 13,
        fontWeight: "bold",
        color: 'red'
    },
});

export default Choices;