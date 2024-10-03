import AsyncStorage from '@react-native-community/async-storage';
import { Button, Footer, FooterTab } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Feather';
import { Text, View } from 'react-native';
import { findPendingByUserPatient } from '../services/api';

export default props => {
    const [status, setStatus] = useState(false);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        const isUser = JSON.parse(await AsyncStorage.getItem('user'));
        if (isUser !== null) {
            const data = await findPendingByUserPatient(isUser);
            setStatus(data.status);
        }
    }

    return (
        <Footer>
            <FooterTab style={{ backgroundColor: '#2D2E83' }}>
                <View style={{ flexDirection: "row", flex:1}}>
                    <Button badge vertical onPress={() => Actions.reset("Main")}>
                        <Icon size={25} name="home" color="#FFF" />
                        <Text style={{ color: '#FFF', fontFamily:"MuseoSans-300" }}>Home</Text>
                    </Button>
                    <Button badge vertical onPress={() => Actions.UserConfig()}>
                        <Icon size={25} name="user" color="#FFF" />
                        <Text style={{ color: '#FFF',fontFamily:"MuseoSans-300" }}>Perfil</Text>
                    </Button>
                    {status &&
                        <Button badge vertical onPress={() => Actions.SchedulePendency()}>
                            <Icon size={25} name="calendar" color="#FFF" />
                            <Text style={{ color: '#FFF',fontFamily:"MuseoSans-300" }}>Agendamentos</Text>
                        </Button>
                    }
                </View>
            </FooterTab>
        </Footer>
    );
}

