import React, { Component } from 'react';
import {StyleSheet} from "react-native";

function SplashMessage(logoPath) {
    return (
        <div style={styles.splashContainer}>
            <img src={logoPath} className="App-logo" alt="logo" style={styles.splashImg} />
        </div>
    );
}

export default function splashScreen(WrappedComponent, logoPath) {
    return class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                loading: true,
            };
        }

        async componentDidMount() {
            try {
                // Put here your await requests/ API requests
                setTimeout(() => {
                    this.setState({
                        loading: false,
                    });
                }, 2000)
            } catch (err) {
                console.log(err);
                this.setState({
                    loading: false,
                });
            }
        }

        render() {
            // while checking user session, show "loading" message
            if (this.state.loading) return SplashMessage(logoPath);

            // otherwise, show the desired route
            return <WrappedComponent {...this.props} />;
        }
    };
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
    },
    splashImg: {
        height: '100%',
        width: '100%'
    }
});