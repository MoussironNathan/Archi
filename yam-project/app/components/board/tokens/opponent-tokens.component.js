import {StyleSheet, Text, View} from "react-native";
import {SocketContext} from "../../../contexts/socket.context";
import {useContext, useEffect, useState} from "react";

const tokenImgPath = './app/img/token.png';

const OpponentTokens = () => {

    const socket = useContext(SocketContext);
    const [tokens, setTokens] = useState(12);

    useEffect(() => {

        socket.on("game.tokens.view-state", (data) => {
            setTokens(data['opponentTokens']);
        });

    }, []);

    const getTokens = tokens => {
        let content = [];
        for (let i = 0; i < tokens; i++) {
            content.push(<img src={tokenImgPath} className="tokenImg" alt="token" style={styles.tokenImg}/>);
            if(i === 5){
                content.push(<br />);
            }
        }
        return content;
    }

    return (
        <View style={styles.opponentTokensContainer}>
            <Text>Jetons restants: <br/>
                <div style={styles.tokens}>
                    {getTokens(tokens)}
                </div>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    opponentTokensContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: 'black',
    },
    tokenImg: {
        width: '16px',
        height: '21px',
    },
    tokens: {
        textAlign: 'center',
    }
});

export default OpponentTokens;