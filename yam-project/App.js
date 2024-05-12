import React from 'react';
import {Image, LogBox, View} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SocketContext, socket } from './app/contexts/socket.context';
import HomeScreen from './app/screens/home.screen';
import OnlineGameScreen from './app/screens/online-game.screen';
import VsBotGameScreen from './app/screens/vs-bot-game.screen';
import splashScreen from "./app/screens/splash.screen";
import "@fontsource/bungee-shade";

const logoPath = './app/img/logo.png';

const Stack = createStackNavigator();
LogBox.ignoreAllLogs(true);

function App() {
    return (
        <SocketContext.Provider value={socket}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="HomeScreen"
                    screenOptions={{
                        headerShown: true,
                        headerTitleStyle: {
                            fontFamily: 'Bungee Shade',
                            fontSize: 28,
                            fontWeight: 'bold',
                            color: 'red',
                        },
                        headerTitleAlign: 'center',
                        headerStyle: {
                            backgroundColor: '#0F7732',
                        },
                    }}
                >
                    <Stack.Screen
                        name="HomeScreen"
                        component={HomeScreen}
                        options={{
                            title: "Yam Master",
                        }}
                    />
                    <Stack.Screen
                        name="OnlineGameScreen"
                        component={OnlineGameScreen}
                        options={{
                            title: "Partie en ligne",
                        }}
                    />
                    <Stack.Screen
                        name="VsBotGameScreen"
                        component={VsBotGameScreen}
                        options={{
                            title: "VS Bot",
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SocketContext.Provider>
    );
}
export default splashScreen(App, logoPath);