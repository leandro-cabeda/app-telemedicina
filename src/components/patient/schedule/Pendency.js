import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { findPendingByUserPatient } from '../../../services/api';
import safeAreaStyles from '../../../styles/SafeAreaStyles';
import styles from '../../../styles/Styles';
import moment from 'moment';
import Header from '../../../template/Header';
import defaultLogo from '../../../img/default-user.jpg';

export default () => {
    const [pendenciesByUser, setPendenciesByUser] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        setInterval(() => {
            loadingPendenciesByUserByDateTime();
        }, 150000);
    }, [user]);

    const carregarDados = async () => {

        try {
            const isUser = JSON.parse(await AsyncStorage.getItem('user'));
            if (isUser !== null) {
                setUser(isUser);
                const data = await findPendingByUserPatient(isUser);
                setPendenciesByUser(data.pendencies);
            } else {
                Actions.reset("Main");
            }
        } catch (e) {
            Actions.reset("Main");
        }
    }

    const loadingPendenciesByUserByDateTime = async () => {
        const data = await findPendingByUserPatient(user);
        setPendenciesByUser(data.pendencies);
        //Actions.refresh({ key: 'SchedulePendency'});
    }

    const itensOfList = ({ item }) => {

        const dataTimeNow = moment.utc().subtract(3, "hours");
        const difStartDateMin = dataTimeNow.diff(item.startDate, "minutes");
        const difEndDateMin = dataTimeNow.diff(item.endDate, "minutes");
        const enableOrDisable = difStartDateMin >= -5 && difEndDateMin < 0 ? false : true;
        let textTitle = enableOrDisable ? "Aguarde" : "Entrar na Consulta";

        if (difEndDateMin >= 0) {
            textTitle = "Consulta Não Disponível";
        }

        const teleAppointment = {
            name: user?.name,
            email: user?.email,
            img: user?.img,
            id: user?.globalId,
            teleAppointmentId: item.id,
            endDate: item.endDate
        };

        const logoUser = item.img ? { uri: `${item.img}` } : defaultLogo;

        return (
            <View style={styles.viewList}>
                <View style={style.view}>
                    <Text style={[styles.viewListItemText, { fontSize: 30, textAlign: "center" }]}>{item.dateHour}</Text>
                    <View>
                        <View style={style.viewUser}>
                            <Image style={style.imgUser} source={logoUser} />
                            <View style={{ flex: 2 }}>
                                <Text style={[styles.viewListItemText, { marginLeft: 20 }]}>{item.profName}</Text>
                                <Text style={[styles.viewListItemText, style.txt]}>{item.number}</Text>
                            </View>
                            <TouchableOpacity style={[styles.viewListItemButton, style.btn]} >
                                <Text style={[styles.viewListItemText, { color: "#fff", fontSize: 21 }]}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.viewListItemText, { marginLeft: 85 }]}>{item.specialty}</Text>
                    </View>
                    <TouchableOpacity style={[styles.viewListItemButton, enableOrDisable && { backgroundColor: "#AFB5B4" }]}
                        disabled={enableOrDisable}
                        onPress={() => Actions.MedicalConsultationDoctor({ teleAppointment })}>
                        <Text style={[styles.viewListItemText, { color: "#fff", fontSize: 24 }]}>{textTitle}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (

        <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
            <Header data='Agendamentos' />
            <FlatList data={pendenciesByUser}
                renderItem={itensOfList}
                keyExtractor={item => item.id}
                style={{ marginTop: 50 }}
            />
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: "space-evenly"
    },
    imgUser: {
        resizeMode: "contain",
        height: 60,
        width: 60,
        marginLeft: 10
    },
    viewUser: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
    },
    btn: {
        backgroundColor: "#AC3335",
        height: 40,
        width: "30%",
        marginRight: 10,
    },
    txt: {
        fontWeight: "normal",
        fontSize: 17,
        marginLeft: 20
    }
});