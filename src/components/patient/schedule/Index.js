import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Image,
    StyleSheet,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Modal from 'react-native-modal';
import {
    Input, Item,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import { saveSchedule, findHoursByUserProf } from '../../../services/api';
import safeAreaStyles from '../../../styles/SafeAreaStyles';
import styles from '../../../styles/Styles';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';
import RNPicker from "rn-modal-picker";
import Header from '../../../template/Header';
import defaultLogo from '../../../img/default-user.jpg';

export default ({ specialty, userBySpecialty }) => {
    const hourInit = { id: "0", name: "Horários Disponíveis" };
    const [date, setDate] = useState("");
    const [isUser, setUser] = useState({ name: "" });
    const [modalVisible, setModalVisible] = useState(false);
    const [hour, setHour] = useState(hourInit);
    const [hoursByUserProf, setHoursByUserProf] = useState([]);

    LocaleConfig.locales['br'] = {
        monthNames: [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
            'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ],
        monthNamesShort: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio',
            'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        dayNames: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
        dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    };
    LocaleConfig.defaultLocale = 'br';

    useEffect(() => {
        carregarUser();
        daysOfMonth();
    }, []);

    const carregarUser = async () => {

        try {
            const user = await AsyncStorage.getItem('user');
            if (user !== null) {
                setUser(JSON.parse(user));
            } else {
                Actions.reset("Main");
            }
        } catch (e) {
            Actions.reset("Main");
        }
    }

    const logoUser = userBySpecialty.img ? { uri: `${userBySpecialty.img}` } : defaultLogo;

    const daysOfMonth = () => {
        const days = moment().daysInMonth();
        const dataMonthYear = moment().format("YYYY-MM");
        const dataToday = moment().format("YYYY-MM-DD");
        let daysMarked = {};

        for (let i = 1; i <= days; i++) {
            const day = i < 10 ? "0" + i : i;
            const date = moment(`${dataMonthYear}-${day}`).format("YYYY-MM-DD");

            if (date == dataToday) {
                daysMarked = {
                    ...daysMarked,
                    [`${date}`]: {
                        selected: true,
                        selectedColor: "#0172C6",
                    }
                }
            } else {
                daysMarked = {
                    ...daysMarked,
                    [`${date}`]: {
                        marked: true,
                        dotColor: "#0172C6"
                    }
                }
            }
        }

        return daysMarked;
    }

    const openModalByDay = async day => {
        const daySelect = moment(day.dateString).format('YYYY-MM-DD');
        const today = moment().format('YYYY-MM-DD');

        if (daySelect < today) {
            return alert("Atenção", "Só é permitido agendamento no dia atual ou a frente!", false);
        }

        setModalVisible(true);
        setDate(moment(day.dateString).format("DD/MM/yyyy"));
        const date = day.dateString.split("-");
        const data = {
            profId: userBySpecialty.id,
            dateSchedule: parseInt(date[0] + date[1] + date[2])
        }
        setHoursByUserProf(await findHoursByUserProf(data));
    };

    const closeModal = () => {
        setModalVisible(false);
        setHour(hourInit);
    }

    const selectValueHour = (_, hour) => setHour(hour);
    const saveScheduleModal = async () => {

        if (hour.name !== "Horários Disponíveis") {
            const data = {
                professional: userBySpecialty.id,
                patient: isUser._id,
                specialty: specialty.id,
                startDate: hour.dateTime
            }
            const res = await saveSchedule(data);
            if (res.status === "error" || res.status === "warning") {
                return alert("Erro ao agendar!", res.message, false);
            }
            return alert("Sucesso!", "Agendamento realizado com sucesso!", true);
        } else {
            return alert("Erro!", "É necessário informar um horário para agendar", false);
        }
    }

    const alert = (title, message, flag) => {

        Alert.alert(
            title,
            message,
            [{
                text: 'OK', onPress: async () => {
                    if (flag) {
                        closeModal();
                        Actions.reset("Main");
                    }
                }
            }],
            { cancelable: false },
        );
    }

    return (

        <SafeAreaView style={[safeAreaStyles.safeAreaStyle2, { backgroundColor: "#FFFFFF" }]}>
            <Header data='Agenda' action={Actions.pop} style={{ backgroundColor: "#FFFFFFFF" }} />
            <Modal isVisible={modalVisible} 
                //onBackdropPress={closeModal}
                style={styles.styleModal}>
                <View style={style.view}>
                    <View style={style.view2}>
                        <Icon style={styles.btnIconModal} onPress={closeModal} name="x-circle" />
                        <Image style={style.imgUser} source={logoUser} />
                        <Text style={[style.txt,style.txtt]}>{userBySpecialty.name}</Text>
                        <Text style={style.txt2}>{specialty.name}</Text>
                    </View>
                    <View style={[style.view2,{marginTop:10}]}>
                        <Text style={[style.txt,{textAlign:"center",marginBottom:10}]}>DATA</Text>
                        <Item regular style={styles.itemInput}>
                            <Input
                                keyboardType="default"
                                placeholderTextColor="#999"
                                value={date}
                                placeholder="Data"
                                style={styles.input2}
                                disabled={true}
                            />
                        </Item>
                    </View>
                    <View style={[style.view2,{marginTop:10}]}>
                        <Text style={[styles.txtTitle, style.txt3]}>Selecione Horário</Text>
                        <RNPicker
                            dataSource={hoursByUserProf}
                            dummyDataSource={hoursByUserProf}
                            defaultValue={false}
                            showSearchBar={true}
                            disablePicker={false}
                            changeAnimation="none"
                            searchBarPlaceHolder="Pesquisar....."
                            showPickerTitle={true}
                            searchBarContainerStyle={styles.searchBarContainerStyle}
                            pickerStyle={style.pickerSelectStyleModal}
                            itemSeparatorStyle={styles.itemSeparatorStyle}
                            pickerItemTextStyle={styles.listTextViewStyle}
                            selectedLabel={hour.name}
                            placeHolderLabel="Horários Disponíveis"
                            selectLabelTextStyle={[styles.selectPlaceHolderLabelTextStyle, style.selectHolderAndTextStyle]}
                            placeHolderTextStyle={[styles.selectPlaceHolderLabelTextStyle, style.selectHolderAndTextStyle]}
                            selectedValue={selectValueHour}
                        />
                    </View>
                    <TouchableOpacity style={styles.modalBtn}
                        onPress={saveScheduleModal}>
                        <Icon size={35} name="save" color="#FFF" style={{ paddingRight: 10 }} />
                        <Text style={[styles.txtBtn, { fontSize: 28 }]}>Agendar Consulta</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Text style={[styles.txtCombo, { fontWeight: "normal", fontSize: 22, marginTop: 60 }]}>Selecione o Dia para Agendar</Text>
            <Calendar
                style={{ marginLeft: 30, marginRight: 30, marginTop: 90 }}
                markedDates={daysOfMonth()}
                theme={{
                    calendarBackground: '#EDEDED',
                    textSectionTitleColor: '#000000',
                    textSectionTitleDisabledColor: '#808080',
                    //selectedDayTextColor: '#000000',
                    selectedDayBackgroundColor: "#ff0000",
                    //todayTextColor: "#0000ff",
                    textDisabledColor: '#808080',
                    arrowColor: '#ff0000',
                    monthTextColor: '#0000ff',
                    textDayFontWeight: 'bold',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: 'bold',
                    textDayFontSize: 18,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 16,
                    textDayFontFamily: "MuseoSans-300",
                    textDayHeaderFontFamily: "MuseoSans-300",
                    textMonthFontFamily: "MuseoSans-300",
                    dayTextColor: "#000000",
                }}
                hideExtraDays={true}
                current={new Date()}
                monthFormat="dd/MM/yyyy"
                onDayPress={openModalByDay}
            />
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    imgUser: {
        resizeMode: "contain",
        height: 120,
        width: 120,
        borderRadius: 150,
        alignSelf: "center",
        marginTop:-30

    },
    view: {
        flex: 1,
        justifyContent: "space-evenly",
        alignItems: "center",
    },
    view2:{
        alignSelf: "stretch",
    },
    txt: {
        fontSize: 26,
        fontWeight: "bold",
        fontFamily: "MuseoSans-300",
        color: "#000"
    },
    txtt: {
        marginTop: 10,
        alignSelf: "center",
        alignItems: "stretch"
    },
    txt2: {
        fontSize: 24,
        fontFamily: "MuseoSans-300",
        alignSelf: "center",
        alignItems: "stretch",
        textAlign:"center"
    },
    txt3: {
        fontSize: 25,
        fontWeight: "normal",
        color: "#000",
        marginBottom: 15
    },
    selectHolderAndTextStyle: {
        width: "90%",
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 15,
        fontSize: 22,
        fontWeight:"normal"
    },
    pickerSelectStyleModal: {
        marginLeft: 10,
        borderWidth: 1,
        width: "93%",
        backgroundColor: "#fff",
        flexDirection: "row"
    }
});