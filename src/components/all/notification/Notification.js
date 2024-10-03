import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    FlatList,
    TouchableOpacity
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import safeAreaStyles from '../../../styles/SafeAreaStyles';
import styles from '../../../styles/Styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../../template/Header';

export default () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {

        try {
            const isUser = JSON.parse(await AsyncStorage.getItem('user'));
            if (isUser !== null) {
                setNotifications(JSON.parse(await AsyncStorage.getItem('notifications')));
            } else {
                Actions.reset("Main");
            }
        } catch (e) {
            Actions.reset("Main");
        }
    }

    const clearNotifications = async () => {
        await AsyncStorage.setItem('notifications', "");
        Actions.reset("Main");
    }

    const itensOfList = ({ item }) => {

        return (
            <View style={[styles.viewList, { height: 80 }]}>
                <View style={{ flex: 1, justifyContent: "space-evenly" }}>
                    <Text style={[styles.viewListItemText, { fontSize: 23, textAlign: "center" }]}>{item.payload.title}</Text>
                    <Text style={[styles.viewListItemText, { fontSize: 21, textAlign: "center" }]}>{item.payload.body}</Text>
                </View>
            </View>
        );
    }

    return (

        <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
            <Header data='Notificações' action={Actions.pop} />
            <TouchableOpacity style={styles.btnAction} onPress={clearNotifications}>
                <Icon size={23} name="trash" color="#0193BC" />
                <Text style={styles.txtAction}>Limpar Notificações</Text>
            </TouchableOpacity>
            <FlatList data={notifications}
                renderItem={itensOfList}
                keyExtractor={item => item.payload.notificationID}
                style={{ marginTop: 15 }}
            />
        </SafeAreaView>
    );
}