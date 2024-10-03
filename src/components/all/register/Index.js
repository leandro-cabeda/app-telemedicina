/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-community/async-storage';
import { Input, Item } from 'native-base';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import { RadioButton } from 'react-native-material-ui';
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/Feather';
import { searchCep, registerUser } from '../../../services/api';
import safeAreaStyles from '../../../styles/SafeAreaStyles';
import Header from '../../../template/Header';
import moment from 'moment';


export default function Register() {
  const [isName, setName] = useState('');
  const [isEmail, setMail] = useState('');
  const [isGender, setGender] = useState('');
  const [isGenderM, setGenderM] = useState(false);
  const [isGenderF, setGenderF] = useState(false);
  const [isGenderO, setGenderO] = useState(false);
  const [isPhoneNumber, setPhoneNumber] = useState('');
  const [isCPF, setCPF] = useState('');
  const [isCEP, setCEP] = useState('');
  const [isPassword, setPassword] = useState('');
  const [isNasc, setNasc] = useState('');
  const [isStreet, setStreet] = useState('');
  const [isNumber, setNumber] = useState('');
  const [isComplement, setComplement] = useState('');
  const [isNeighborhood, setNeighborhood] = useState('');
  const [isCity, setCity] = useState('');
  const [isState, setState] = useState('');
  const [isLoadingCep, setLoadingCep] = useState(false);
  const [eventCep, setEventCep] = useState(false);


  //CONSULTAR CEP
  const handleSeachCep = async () => {
    setLoadingCep(false);

    if (isCEP !== "") {
      try {

        if (isCEP === "00000000") {
          return showAlert(`Erro! Endereço com cep: ${isCEP} não é válido!`);
        } else if (isCEP.length < 8) {
          return showAlert('Você precisa inserir um cep válido com oito caracteres');
        }

        setEventCep(true);
        const res = await searchCep(isCEP);

        if (res.data.erro) {
          setEventCep(false);
          showAlert(`Erro! Endereço referente ao cep: ${isCEP} não foi encontrado!`);
        } else {
          handleConfirmCep(res.data, res.data.logradouro, res.data.localidade, res.data.uf);
        }

      } catch (error) {
        showAlert(error);
      }
    } else {
      showAlert('Você precisa preencher o CEP para buscar o endereço referente');
    }
  }

  //CONFIRMAÇÃO DO ENDEREÇO
  const handleConfirmCep = (address, logradouro, localidade, uf) => {
    Alert.alert(
      'Confirmação !!!',
      `Esse é teu endereço: ${logradouro}, Cidade: ${localidade} e Estado: ${uf} ?`,
      [
        {
          text: 'Não',
          onPress: () => confirmCep(address, 'Não'),
          style: 'cancel',
        },
        { text: 'Sim', onPress: () => confirmCep(address, 'Sim') },
      ],
      { cancelable: false },
    );
  }

  const confirmCep = (address, option) => {
    if (option === 'Não') {
      setLoadingCep(false);
      setCEP('');
    } else {
      setLoadingCep(true);
      setStreet(address.logradouro);
      setComplement(address.complemento);
      setNeighborhood(address.bairro);
      setCity(address.localidade);
      setState(address.uf);
    }
    setEventCep(false);
  }

  //GENERO DA PESSOA
  const handleRadioButtonGender = value => {

    if (value === 'MASCULINO') {
      setGenderM(true);
      setGenderF(false);
      setGenderO(false);
      setGender(value);
    } else if (value === 'FEMININO') {
      setGenderM(false);
      setGenderF(true);
      setGenderO(false);
      setGender(value);
    } else {
      setGenderM(false);
      setGenderF(false);
      setGenderO(true);
      setGender(value);
    }
  }

  const showAlert = message => {
    Alert.alert(
      'Alerta !!!',
      message,
      [{ text: 'OK' }],
    );
  }
  //ENVIAR DADOS PARA BACKEND
  const handleSaveUser = () => {

    if (isName === '') {
      showAlert('Você precisa preencher o Nome');
    } else if (isEmail === '') {
      showAlert('Você precisa preencher o Email');
    } else if (isEmail.indexOf("@") == -1) {
      showAlert('Email inválido! Por favor preencher um email válido contendo @');
    } else if (isGender === '') {
      showAlert('Você precisa escolher entre MASCULINO, FEMININO, OUTRO');
    } else if (isPhoneNumber === '') {
      showAlert('Você precisa preencher o número do Telefone');
    } else if (isCPF === '') {
      showAlert('Você precisa preencher o CPF');
    } else if (isPassword === '') {
      showAlert('Você precisa preencher uma Senha');
    } else if (isPassword.length < 6) {
      showAlert('Você precisa inserir uma senha com mínimo seis caracteres');
    } else if (isNasc === '') {
      showAlert('Você precisa preencher a data de nascimento');
    } else if (isCEP.length < 8) {
      showAlert('Você precisa inserir um cep válido com oito caracteres');
    } else if (!isLoadingCep) {
      showAlert('É necessário realizar a busca pelo cep referente ao endereço!');
    } else if (isNumber === '') {
      showAlert('Você precisa informar o número');
    } else if (isStreet === '') {
      showAlert('Você precisa informar o nome da Rua');
    } else if (isNeighborhood === '') {
      showAlert('Você precisa informar o seu Bairro');
    } else if (isCity === '') {
      showAlert('Você precisa informar o sua Cidade');
    } else if (isState === '') {
      showAlert('Você precisa informar o seu Estado');
    } else {
      const data = {
        type: "PACIENTE",
        status: true,
        name: isName,
        email: isEmail.toLowerCase(),
        gender: isGender,
        phone: isPhoneNumber,
        cpf: isCPF,
        password: isPassword,
        zipcodeAddress: isCEP,
        districtAddress: isNeighborhood,
        streetAddress: isStreet,
        complementAddress: isComplement,
        numberAddress: isNumber,
        stateAddress: isState,
        cityAddress: isCity,
        dateOfBirth: moment(isNasc, 'DD/MM/YYYY', true).format('YYYY-MM-DD')
      };

      confirmSaveUser(data);
    }
  }

  //SALVAR USUARIO NO BANCO
  const confirmSaveUser = async data => {

    try {
      const res = await registerUser(data);
      if (res.data.data !== undefined) {
        Alert.alert(
          "",
          'Paciente cadastrado com sucesso.',
          [{
            text: 'OK', onPress: async () => {
              await AsyncStorage.setItem('user', JSON.stringify(res.data.data));
              await AsyncStorage.setItem('token', res.data.token);
              Actions.reset("Main");
            }
          }],
          { cancelable: false },
        );
      } else {
        showAlert(res.data.message);
      }
    } catch (error) {
      showAlert(error.message);
    }
  }

  const changeDateNasc = nasc => {
    if (nasc.length <= 10) {
      setNasc(nasc);
    }
  }

  const chanceCep = cep => {
    setLoadingCep(false);
    setNumber('');
    setCEP(cep);
  }

  return (
    <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
      <ScrollView>
        <Header data='Registro' />
        <KeyboardAvoidingView
          behavior="padding"
          enabled={Platform.OS === 'ios'}
          style={styles.container}>
          <Item regular style={styles.input}>
            <Icon size={30} name="user" color="#4BA684" style={styles.icon} />
            <Input
              autoCapitalize="words"
              autoCompleteType="username"
              keyboardType="name-phone-pad"
              placeholderTextColor="#999"
              style={styles.textInput}
              value={isName}
              onChangeText={name => setName(name)}
              placeholder="*Nome..."
            />
          </Item>
          <Item regular style={[styles.input, { marginBottom: 20 }]}>
            <Icon size={30} name="mail" color="#4BA684" style={styles.icon} />
            <Input
              autoCapitalize="none"
              autoCompleteType="email"
              keyboardType="email-address"
              placeholderTextColor="#999"
              style={styles.textInput}
              value={isEmail}
              onChangeText={email => setMail(email)}
              placeholder="*Email..."
            />
          </Item>
          <RadioButton
            label={<Text style={styles.styleCheckBox}>MASCULINO</Text>}
            checked={isGenderM}
            value="MASCULINO"
            onSelect={handleRadioButtonGender}
          />
          <RadioButton
            label={<Text style={styles.styleCheckBox}>FEMININO</Text>}
            checked={isGenderF}
            value="FEMININO"
            onSelect={handleRadioButtonGender}
          />
          <RadioButton
            label={<Text style={styles.styleCheckBox}>OUTRO</Text>}
            checked={isGenderO}
            value="OUTRO"
            onSelect={handleRadioButtonGender}
          />
          <Item regular style={styles.input}>
            <Icon
              size={30}
              name="phone"
              color="#4BA684"
              style={styles.icon}
            />
            <TextInputMask
              style={styles.textInput}
              autoCapitalize="none"
              autoCompleteType="tel"
              keyboardType="numeric"
              placeholder="*Celular..."
              placeholderTextColor="#999"
              type={'cel-phone'}
              options={{
                maskType: 'BRL',
                withDDD: true,
                dddMask: '(99) ',
              }}
              value={isPhoneNumber}
              onChangeText={phoneNumber => setPhoneNumber(phoneNumber)}
            />
          </Item>
          <Item regular style={styles.input}>
            <Icon
              size={30}
              name="edit-3"
              color="#4BA684"
              style={styles.icon}
            />
            <TextInputMask
              style={styles.textInput}
              autoCapitalize="none"
              autoCompleteType="off"
              keyboardType="numeric"
              placeholderTextColor="#999"
              type={'cpf'}
              value={isCPF}
              placeholder="*CPF..."
              onChangeText={cpf => setCPF(cpf)}
            />
          </Item>
          <Item regular style={styles.input}>
            <Icon size={30} name="calendar" color="#4BA684" style={styles.icon} />
            <TextInputMask
              style={styles.textInput}
              placeholderTextColor="#999"
              value={isNasc}
              type={"datetime"}
              onChangeText={changeDateNasc}
              placeholder="*Data Nascimento..."
            />
          </Item>
          <Item regular style={styles.input}>
            <Icon size={30} name="key" color="#4BA684" style={styles.icon} />
            <Input
              placeholderTextColor="#999"
              value={isPassword}
              style={styles.textInput}
              secureTextEntry
              onChangeText={password => setPassword(password)}
              placeholder="*Senha..."
            />
          </Item>
          <View style={styles.styleView}>
            <View style={styles.view}>
              <Item regular style={styles.input}>
                <Icon
                  size={30}
                  name="navigation"
                  color="#4BA684"
                  style={styles.icon}
                />
                <TextInputMask
                  autoCapitalize="none"
                  style={styles.textInput}
                  autoCompleteType="postal-code"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  value={isCEP}
                  onChangeText={chanceCep}
                  placeholder="*CEP..."
                  type={"only-numbers"}
                  maxLength={8}
                />
              </Item>
            </View>
            <View style={styles.styleViewButtom}>
              {eventCep ?
                <ActivityIndicator size="large" color="#AC3335" />
                :
                <TouchableOpacity onPress={handleSeachCep}>
                  <Icon size={30} name="search" color="#48887B" />
                </TouchableOpacity>
              }
            </View>
          </View>
          {isLoadingCep &&
            <View>
              <Item regular style={styles.input}>
                <Icon
                  size={30}
                  name="edit-3"
                  color="#4BA684"
                  style={styles.icon}
                />
                <Input
                  autoCapitalize="words"
                  autoCompleteType="name"
                  style={styles.textInput}
                  keyboardType="default"
                  placeholderTextColor="#999"
                  value={isStreet}
                  onChangeText={street => setStreet(street)}
                  placeholder="*Rua..."
                />
              </Item>
              <Item regular style={styles.input}>
                <Icon
                  size={30}
                  name="navigation"
                  color="#4BA684"
                  style={styles.icon}
                />
                <TextInputMask
                  autoCapitalize="words"
                  autoCompleteType="name"
                  style={styles.textInput}
                  keyboardType="default"
                  placeholderTextColor="#999"
                  value={isNumber}
                  onChangeText={number => setNumber(number)}
                  placeholder="*Número..."
                  type={"only-numbers"}
                />
              </Item>
              <Item regular style={styles.input}>
                <Icon
                  size={30}
                  name="navigation"
                  color="#4BA684"
                  style={styles.icon}
                />
                <Input
                  autoCapitalize="words"
                  autoCompleteType="name"
                  keyboardType="default"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                  value={isComplement}
                  onChangeText={complement => setComplement(complement)}
                  placeholder="Complemento..."
                />
              </Item>
              <Item regular style={styles.input}>
                <Icon
                  size={30}
                  name="edit-3"
                  color="#4BA684"
                  style={styles.icon}
                />
                <Input
                  autoCapitalize="words"
                  autoCompleteType="name"
                  keyboardType="default"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                  value={isNeighborhood}
                  onChangeText={neighborhood => setNeighborhood(neighborhood)}
                  placeholder="*Bairro..."
                />
              </Item>
              <Item regular style={styles.input}>
                <Icon
                  size={30}
                  name="navigation"
                  color="#4BA684"
                  style={styles.icon}
                />
                <Input
                  autoCapitalize="words"
                  autoCompleteType="name"
                  keyboardType="default"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                  value={isCity}
                  onChangeText={city => setCity(city)}
                  placeholder="*Cidade..."
                />
              </Item>
              <Item regular style={styles.input}>
                <Icon
                  size={30}
                  name="edit-3"
                  color="#4BA684"
                  style={styles.icon}
                />
                <Input
                  autoCapitalize="words"
                  autoCompleteType="name"
                  keyboardType="default"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                  value={isState}
                  onChangeText={state => setState(state)}
                  placeholder="*UF..."
                />
              </Item>
            </View>}
          <TouchableOpacity
            style={[styles.styleButton, { flexDirection: "row", marginTop: 25 }]}
            onPress={handleSaveUser}>
            <Icon size={30} name="file-text" color="#FFF" style={{ paddingRight: 10 }} />
            <Text style={styles.styleButtonText}>Registrar</Text>
          </TouchableOpacity>
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity
              style={[styles.styleButton, { backgroundColor: "#AC3335", flexDirection: "row" }]}
              onPress={() => Actions.reset("Main")}>
              <Icon size={30} name="x-circle" color="#FFF" style={{ paddingRight: 10 }} />
              <Text style={styles.styleButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textInput: {
    marginLeft: 10,
    fontSize: 22,
    fontFamily: "MuseoSans-300"
  },
  styleCheckBox: {
    color: '#424242',
    fontWeight: 'bold',
    fontSize: 19,
    fontFamily: "MuseoSans-300"
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  view: {
    flex: 5,
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
  styleViewButtom: {
    marginTop: 15,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleView: {
    flex: 1,
    flexDirection: 'row',
  },
  styleButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 30,
    fontFamily: "MuseoSans-300"
  },
  styleButton: {
    height: 70,
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
});
