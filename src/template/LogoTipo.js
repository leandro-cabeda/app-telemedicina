import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import logo from "../img/logo.png";

export default ({ styleValue }) =>

<View style={[styles.view,styleValue]}>
    <Text style={styles.txt}>Desenvolvido por:</Text>
    <Image style={styles.img} source={logo} />
</View>

const styles = StyleSheet.create({
    txt: {
        fontSize: 14,
        color: "#000",
        textAlign: "center",
        fontFamily: "MuseoSans-300",
        fontWeight: "bold",
    },
    view: {
        alignItems: "center",
        marginTop: 60,
        marginBottom: 15
    },
    img: {
        resizeMode: "contain",
        height: 40,
        marginTop: 5
    }
});

