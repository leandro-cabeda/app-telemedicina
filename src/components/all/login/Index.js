import { Input, Item } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Image,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { loginUser } from '../../../services/api';
import logo from '../../../img/logo-acao-positiva-h.png';
import LogoTipo from "../../../template/LogoTipo";
import { Actions } from 'react-native-router-flux';
import Header from '../../../template/Header';
import safeAreaStyles from '../../../styles/SafeAreaStyles';

export default function Login() {
  const [isPassword, setPassword] = useState('');
  const [isEmail, setEmail] = useState('');
  const [eventLogin, setEventLogin] = useState(false);


  const showAlert = message => {
    Alert.alert(
      'Alerta !!!',
      message,
      [{ text: 'OK' }],
      { cancelable: false },
    );
  }

  const handleLogin = () => {
    if (isEmail.trim() === '') {
      showAlert('Você precisa preencher o Email');
    } else if (isEmail.indexOf("@") == -1) {
      showAlert('Email inválido! Por favor preencher um email válido contendo @');
    } else if (isPassword.trim() === '') {
      showAlert('Você precisa preencher a Senha');
    } else {

      const data = {
        email: isEmail.toLowerCase(),
        password: isPassword,
      };
      confirmLoginUser(data);
    }
  }

  const confirmLoginUser = async data => {

    try {

      setEventLogin(true);
      const res = await loginUser(data);

      if (res.data.error) {
        showAlert(res.data.error);
        setEventLogin(false);

      } else if (res.data.user.type === 'PACIENTE') {
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        await AsyncStorage.setItem('token', res.data.token);
        Actions.reset("Main");

      } else if (res.data.user.type === 'PROFISSIONAL') {
        //await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        //Actions.HomeDoctor();
      } else {
        showAlert('Erro! Entre em contato com desenvolvedor');
        setEventLogin(false);
      }

    } catch (error) {
      showAlert(error.message);
    }
  }


  return (
    <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
      <ScrollView>
        <Header data="Login" />
        <KeyboardAvoidingView
          behavior="padding"
          enabled={Platform.OS === 'ios'}
          style={styles.container}>
          <Image style={styles.logo} source={logo} />
          <Item regular style={[styles.input, { marginTop: 50 }]}>
            <Icon size={30} name="edit-3" color="#30998E" style={styles.icon} />
            <Input
              autoCapitalize="none"
              autoCompleteType="email"
              keyboardType="default"
              placeholderTextColor="#999"
              value={isEmail}
              onChangeText={email => setEmail(email)}
              placeholder="Email..."
            />
          </Item>
          <Item regular style={styles.input}>
            <Icon size={30} name="key" color="#30998E" style={styles.icon} />
            <Input
              placeholderTextColor="#999"
              value={isPassword}
              secureTextEntry
              onChangeText={password => setPassword(password)}
              placeholder="Senha..."
            />
          </Item>
          <Text style={styles.txt}>Esqueci Senha</Text>
          {eventLogin ?
            <ActivityIndicator style={{ marginTop: 20, alignSelf: "center" }} size="large" color="#AC3335" />
            :
            <TouchableOpacity
              style={[styles.styleButton, { flexDirection: "row" }]}
              onPress={handleLogin}
            >
              <Icon size={30} name="log-in" color="#FFF" style={{ paddingRight: 10 }} />
              <Text style={styles.styleButtonText}>LOGIN</Text>
            </TouchableOpacity>
          }
          <LogoTipo />
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 95,
    marginBottom: 10,
    resizeMode: 'contain',
    alignSelf: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 40
  },
  icon: {
    paddingLeft: 10,
  },
  input: {
    height: 60,
    alignSelf: 'stretch',
    backgroundColor: '#FAFAFA',
    color: '#212121',
    borderWidth: 1,
    borderColor: '#FAFAFA',
    borderRadius: 4,
    marginTop: 20,
  },
  styleButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 30,
    fontFamily: "MuseoSans-300",
  },
  styleButton: {
    height: 60,
    width: "80%",
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
  txt: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: "MuseoSans-300",
    marginTop: 20,
    marginBottom: 40
  },
});
