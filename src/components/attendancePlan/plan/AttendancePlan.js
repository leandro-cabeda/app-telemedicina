/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { findAllAttendancePlans } from '../../../services/api';
import logo from '../../../img/logo-acao-positiva-h.png';
import styles from '../../../styles/Styles';
import safeAreaStyles from '../../../styles/SafeAreaStyles';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../../../template/Header';

export default () => {
    const [attendancePlans, setAttendancePlans] = useState([]);
    const [isUser, setUser] = useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const user = JSON.parse(await AsyncStorage.getItem('user'));
            if (user === null) {
                Actions.reset("Main");
            } else {
                setAttendancePlans(await findAllAttendancePlans());
                setUser(user);
            }
        } catch (e) {
            Actions.reset("Main");
        }
    }

    const SpecialtiesAttendancePlan = specialties =>
        specialties.map(spec =>
            <Text style={styles.txtTitle4}>
                {spec.specialtyName}
            </Text>
        );

    const itensOfList = ({ item }) => {

        return (
            <View style={[styles.viewList, style.viewList]}>
                <Text style={styles.txtTitle3}>{item.name}</Text>
                <View style={styles.viewList3}>
                    <Text style={[styles.txtTitle6,{marginBottom:10}]}>Especialidade(s):</Text>
                    <View style={style.viewData2}>
                        {SpecialtiesAttendancePlan(item.specialties)}
                    </View>
                </View>
                <View style={styles.viewList3}>
                    <Text style={styles.txtTitle6}>Benefícios:</Text>
                    <View style={style.viewData}>
                        {item.examAcess &&
                            <Text style={style.txtTitle2}>- Agendamentos via Aplicativo</Text>
                        }
                        <Text style={style.txtTitle2}>- {item.attendanceNumber} Consulta(s) via Telemedicina por Mês</Text>
                        <Text style={style.txtTitle2}>- Tempo de Consulta: {item.attendanceTime} Minuto(s)</Text>
                        <Text style={style.txtTitle2}>- Acompanhamento do Dia-a-Dia pelo Aplicativo</Text>
                        <Text style={style.txtTitle2}>- Suporte via Chat</Text>
                        <Text style={style.txtTitle2}>- 7 dias Gratuitos para Teste</Text>
                        <Text style={[style.txtTitle2, style.txtModify]}>- Preço R$ {item.price} por mês</Text>
                    </View>
                </View>
                <View style={[styles.viewList3,{marginTop:120}]}>
                    <View style={{flex:1, flexDirection:"row", alignItems: "center"}}>
                        <Text style={styles.txtTitle6}>Contrato:</Text>
                        <Text style={styles.txtTitle5}>{item.minimumContract} Meses</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.buttonBtn}
                    onPress={() => { }}>
                    <Icon name="shopping-cart" size={26} color="#fff" />
                    <Text style={styles.txtBtn2}>Assinar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
            <ScrollView>
                <Header data='Planos' action={Actions.pop} />
                <Image style={style.imgLogo} source={logo} />
                <View>
                    <Text style={style.txtTitle}>Escolha um Plano</Text>
                    <FlatList data={attendancePlans}
                        renderItem={itensOfList}
                        keyExtractor={item => item.id}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    imgLogo: {
        height: 60,
        resizeMode: 'contain',
        alignSelf: "center",
        marginTop:45,
    },
    txtTitle: {
        fontSize: 23,
        textAlign: "center",
        fontFamily: "MuseoSans-300",
        marginBottom:15,
        marginTop:45
    },
    viewList: {
        alignItems: "center",
        backgroundColor: "#D2D9D6",
        height: 500,
        padding: 10,
    },
    txtTitle2: {
        fontSize: 16,
        color: "#000",
        fontFamily: "MuseoSans-300",
        marginBottom: 5,
        textAlign: "center"
    },
    txtModify:{
        backgroundColor:"#6B7D87",
        fontSize: 22,
        borderRadius:15,
        color:"#fff",
        padding:7
    },
    viewData:{
        marginTop: 15, 
        alignItems: "center", 
        flex: 1
    },
    viewData2:{
        flex:1, 
        flexDirection:"row",
        flexWrap:"wrap", 
        justifyContent:"center",
        marginBottom:40
    }
});