import React, { useEffect, useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = () => {

    const socket = useContext(SocketContext);

    const [displayGrid, setDisplayGrid] = useState(true);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState([]);

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        if (canSelectCells) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        socket.on("game.grid.view-state", (data) => {
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(data['canSelectCells'])
            setGrid(data['grid']);
        });
    }, []);

    return (
        <View style={styles.gridContainer}>
            {displayGrid &&
                grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((cell, cellIndex) => (
                            <TouchableOpacity
                                key={cell.id}
                                style={[
                                    styles.cell,
                                    cell.owner === "player:1" && styles.playerOwnedCell,
                                    (cell.owner === "player:2" || cell.owner === "bot") && styles.opponentOwnedCell,
                                    (cell.canBeChecked && !(cell.owner === "player:1") && !(cell.owner === "player:2")) && styles.canBeCheckedCell,
                                    (rowIndex === 0 && cellIndex === 0) && styles.topLeftBorderRadius,
                                    (rowIndex === 0 && cellIndex === row.length - 1) && styles.topRightBorderRadius,
                                    (rowIndex === grid.length - 1 && cellIndex === 0) && styles.bottomLeftBorderRadius,
                                    (rowIndex === grid.length - 1 && cellIndex === row.length - 1) && styles.bottomRightBorderRadius,
                                ]}
                                onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                disabled={!cell.canBeChecked}
                            >
                                <Text style={styles.cellText}>{cell.viewContent}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
    },
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "white",
    },
    cellText: {
        fontSize: 15,
        color: 'white'
    },
    playerOwnedCell: {
        backgroundColor: "black",
        opacity: 0.9,
    },
    opponentOwnedCell: {
        backgroundColor: "red",
        opacity: 0.9,
    },
    canBeCheckedCell: {
        backgroundColor: "yellow",
    },
    topBorder: {
        borderTopWidth: 1,
    },
    leftBorder: {
        borderLeftWidth: 1,
    },
    topLeftBorderRadius: {
        borderTopLeftRadius: 10,
    },
    topRightBorderRadius: {
        borderTopRightRadius: 10,
    },
    bottomLeftBorderRadius: {
        borderBottomLeftRadius: 10,
    },
    bottomRightBorderRadius: {
        borderBottomRightRadius: 10,
    },
});

export default Grid;