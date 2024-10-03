import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import logo from '../img/logo-acao-positiva-h.png';
import safeAreaStyles from '../styles/SafeAreaStyles';
import Icon from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import OneSignal from 'react-native-onesignal';
import { updateUser, setClientToken } from '../services/api';
import LogoTipo from "../template/LogoTipo";
import defaultLogo from '../img/default-user.jpg';

export default () => {
  const [isUser, setUser] = useState(null);
  const [isLogged, setLogged] = useState(false);
  const [userId, setUserId] = useState('');
  const [notificattions, setNotificattions] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    verifyUserIdChange();
  }, [userId]);

  const carregarDados = async () => {

    try {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      const token = await AsyncStorage.getItem('token');

      if (user !== null) {
        oneSignalInitial();
        setUser(user);
        setLogged(true);
        loadingNotifications();
        setClientToken(token)
      }

    } catch (e) {
      setUser(null);
      setLogged(false);
    }
  }

  const verifyUserIdChange = async () => {

    if (isUser !== null && isUser.playerId !== userId) {
      isUser.playerId = userId;
      const updtUser = await updateUser(isUser);
      if (updtUser.data.data !== null) {
        await AsyncStorage.setItem('user', JSON.stringify(updtUser.data.data));
      }
    }
  }

  const oneSignalInitial = () => {
    OneSignal.init("88741eba-1e02-45fc-861d-fd105941d67c",
      { kOSSettingsKeyAutoPrompt: true });
    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);
    OneSignal.enableVibrate(true);
    OneSignal.enableSound(true);
    OneSignal.setSubscription(true);
    OneSignal.inFocusDisplaying(2);
  }

  const loadingNotifications = async () => {

    const notifications = JSON.parse(await AsyncStorage.getItem("notifications"));

    if (notifications) {
      setNotificattions(notifications);
    }

  }

  const onReceived = async notification => {

    const notifications = JSON.parse(await AsyncStorage.getItem("notifications"));

    if (notifications) {

      if (notifications.length > 9) {
        notifications.shift();
        notifications.push(notification);
      } else {
        notifications.push(notification);
      }
      setNotificattions(notifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

    } else {

      let objNotify = [];
      objNotify.push(notification);

      setNotificattions(objNotify);
      await AsyncStorage.setItem('notifications', JSON.stringify(objNotify));
    }

  }

  const onOpened = openResult => {
    console.log('Message: ', JSON.stringify(openResult.notification.payload.body));
    console.log('Data: ', JSON.stringify(openResult.notification.payload.additionalData));
    console.log('isActive: ', JSON.stringify(openResult.notification.isAppInFocus));
    console.log('openResult: ', JSON.stringify(openResult));
  }

  const onIds = device => setUserId(device.userId);


  const handleSchedule = () => {

    Actions.Home();
    /*if (isUser.type === 'PACIENTE') {
      Actions.Home();
    } else if (isUser.type === 'PROFISSIONAL') {
      Actions.HomeDoctor();
    }*/
  }

  const notifications = () => {
    if (notificattions.length > 0) {
      Actions.Notification();
    }
  }

  const logoUser = isUser?.img ? { uri: `${isUser?.img}` } : defaultLogo;

  const attendancePlanUser = isUser?.attendancePlan ?
    <View>
      <TouchableOpacity
        style={[styles.styleButton, { width: "85%" }]}
        onPress={handleSchedule}>
        <Icon size={30} name="plus" color="#FFF" style={{ paddingRight: 10 }} />
        <Text style={[styles.styleButtonText, { fontSize: 24 }]}>
          Agendar Consulta
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.styleButton, { width: "85%" }]}
        onPress={() => Actions.SchedulePendency()}>
        <Icon size={30} name="calendar" color="#FFF" style={{ paddingRight: 10 }} />
        <Text style={[styles.styleButtonText, { fontSize: 24 }]}>Meus Agendamentos</Text>
      </TouchableOpacity>
    </View>
    :
    <TouchableOpacity
      style={[styles.styleButton, { width: "85%" }]}
      onPress={() => Actions.AttendancePlan()}>
      <Icon size={35} name="shopping-cart" color="#FFF" style={{ paddingRight: 10 }} />
      <Text style={[styles.styleButtonText, { fontSize: 28 }]}>Comprar Plano</Text>
    </TouchableOpacity>



  return (
    <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
      <ScrollView>
        <View style={styles.container}>
          {isLogged ?
            <>
              <Image style={styles.imgLogo} source={logoUser} />
              <Icon2 style={{ alignSelf: "center" }} onPress={() => Actions.UserConfig()} size={50} name="navicon" color="#00408C" />
              {attendancePlanUser}
              <View>
                <Icon2 style={{ alignSelf: "center" }} size={50} name="bell"
                  color="#00408C" onPress={notifications} />
                <Text style={styles.txtNotification}>{notificattions.length > 0 ? notificattions.length : null}</Text>
              </View>
            </>
            :
            <>
              <Image style={styles.logo} source={logo} />
              <View style={{ marginTop: 60 }}>
                <TouchableOpacity
                  style={[styles.styleButton, { height: 60 }]}
                  onPress={() => Actions.Login()}>
                  <Icon size={30} name="log-in" color="#FFF" style={{ paddingRight: 10 }} />
                  <Text style={styles.styleButtonText}>LOGIN</Text>
                </TouchableOpacity>
                <Text style={styles.txt}>Esqueci Senha</Text>
                <TouchableOpacity
                  style={styles.styleButton2}
                  onPress={() => Actions.Register()}>
                  <Icon size={25} name="file-text" color="#000" style={{ paddingRight: 10 }} />
                  <Text style={styles.styleButtonText2}>Realizar Cadastro</Text>
                </TouchableOpacity>
              </View>
              <LogoTipo styleValue={{ marginBottom: 25 }} />
            </>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-evenly',
    paddingHorizontal: 5,
    height: Dimensions.get("window").height,
  },
  logo: {
    height: 95,
    resizeMode: 'contain',
    alignSelf: "center",
    marginTop: 75
  },
  imgLogo: {
    height: 150,
    resizeMode: 'contain',
    borderRadius: 120,
    width: 190,
    alignSelf: "center",
  },
  icons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  styleButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 30,
    fontFamily: "MuseoSans-300"
  },
  styleButtonText2: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 27,
    fontFamily: "MuseoSans-300",
  },
  styleButton: {
    height: 70,
    width: "80%",
    flexDirection: "row",
    alignSelf: 'center',
    backgroundColor: '#48887B',
    borderRadius: 30,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },
  styleButton2: {
    marginTop: 80,
    width: "80%",
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: "MuseoSans-300",
    marginTop: 20,
  },
  txtNotification: {
    fontFamily: "MuseoSans-300",
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "#F43735",
    alignSelf: "center",
    borderRadius: 20,
    marginTop: -50,
    marginLeft: 28,
  }
});
