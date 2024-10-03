/* eslint-disable react-hooks/exhaustive-deps */
import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import RNPicker from "rn-modal-picker";
import { Actions } from 'react-native-router-flux';
import { findAllSpecialties, findAllUsersBySpecialty } from '../../services/api';
import defaultLogo from '../../img/default-user.jpg';
import styles from '../../styles/Styles';
import safeAreaStyles from '../../styles/SafeAreaStyles';
import Header from '../../template/Header';
import getRNDraftJSBlocks from 'react-native-draftjs-render';
import Icon from 'react-native-vector-icons/Feather';

export default () => {
  const [specialty, setSpecialty] = useState({ id: "0", name: "Selecionar" });
  const [specialties, setSpecialties] = useState([]);
  const [usersBySpecialty, setUsersBySpecialty] = useState([]);
  const [modalVisible, setModalVisible] = useState(null);

  useEffect(() => {
    carregarUser();
    findAllSpecialties().then(res => setSpecialties(res));
  }, []);

  const carregarUser = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user === null) {
        Actions.reset("Main");
      }
    } catch (e) {
      Actions.reset("Main");
    }
  }

  const selectValueSpeciality = (_, spec) => {
    setSpecialty(spec);
    findAllUsersBySpecialty(spec.id).then(res => setUsersBySpecialty(res));
  }

  const customStyles = StyleSheet.flatten({
    unstyled: {
      fontSize: 21,
      fontWeight: 'normal',
      fontFamily: "MuseoSans-300",
      marginLeft: 15,
    },
  });


  const itensOfList = ({ item }) => {
    const contentState = JSON.parse(item.curriculum);
    const blocks = getRNDraftJSBlocks({ contentState, customStyles });

    const logoUser = item.img ? { uri: `${item.img}` } : defaultLogo;

    const userBySpecialty = {
      name: item.name,
      id: item.id,
      img: item.img
    };

    return (
      <View style={style.viewInfo}>
        <View style={style.viewUser}>
          <Image style={style.imgUser} source={logoUser} />
          <View style={{ flex: 2 }}>
            <Text style={[styles.viewListItemText, { marginLeft: 20 }]}>{item.name}</Text>
            <Text style={[styles.viewListItemText, style.txt2]}>{item.number}</Text>
          </View>
          <TouchableOpacity style={[styles.viewListItemButton, style.btn]}
            onPress={() => Actions.Schedule({ specialty, userBySpecialty })}>
            <Text style={style.txtBtn}>Agendar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.viewListItemButton, style.btn, style.btnView]}
          onPress={() => setModalVisible(item.id)}>
          <Icon size={25} name="eye" color="#fff" />
          <Text style={[style.txtBtn, { paddingLeft: 10 }]}>Visualizar Currículo</Text>
        </TouchableOpacity>
        <Modal isVisible={modalVisible == item.id}
          //onBackdropPress={closeModal}
          style={styles.styleModal}>
          <View style={{ flex: 1, paddingTop: 10 }}>
            <Icon style={styles.btnIconModal} onPress={() => setModalVisible(null)} name="x-circle" />
            <Text style={style.txt3}>Quem sou eu ?</Text>
            <Image style={[styles.imgAvatar, { marginTop: 15, marginBottom: 15 }]} source={logoUser} />
            <ScrollView style={style.scrollViewBody}>
              {blocks}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  return (

    <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
      <ScrollView>
        <Header data='Agendamento' />
        <View style={style.view}>
          <Text style={[styles.txtCombo, style.txt]}>Selecione a Especialidade:</Text>
          {specialties.length == 0 ?
            <ActivityIndicator style={{ alignSelf: "center" }} size="large" color="#AC3335" />
            :
            <RNPicker
              dataSource={specialties}
              dummyDataSource={specialties}
              defaultValue={false}
              showSearchBar={true}
              disablePicker={false}
              changeAnimation="none"
              searchBarPlaceHolder="Pesquisar....."
              showPickerTitle={true}
              searchBarContainerStyle={styles.searchBarContainerStyle}
              pickerStyle={styles.pickerStyle}
              itemSeparatorStyle={styles.itemSeparatorStyle}
              pickerItemTextStyle={styles.listTextViewStyle}
              selectedLabel={specialty.name}
              placeHolderLabel="Selecionar"
              selectLabelTextStyle={styles.selectPlaceHolderLabelTextStyle}
              placeHolderTextStyle={styles.selectPlaceHolderLabelTextStyle}
              selectedValue={selectValueSpeciality}
            />
          }
        </View>
        {specialty.name !== "Selecionar" && usersBySpecialty.length > 0 &&
          <View style={style.view}>
            <Text style={[styles.txtCombo, style.txt, { marginBottom: 15 }]}>Selecione o Profissional:</Text>
            <FlatList data={usersBySpecialty}
              renderItem={itensOfList}
              keyExtractor={item => item.id}
            />
          </View>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  view: {
    marginTop: 25
  },
  txt: {
    fontWeight: "normal",
    fontSize: 25,
    marginBottom: 25,
  },
  txt2: {
    fontWeight: "normal",
    fontSize: 17,
    marginLeft: 20
  },
  txt3: {
    color: "#000",
    fontWeight: 'bold',
    fontFamily: "MuseoSans-300",
    fontSize: 25,
    marginBottom: 15,
    marginTop: 5,
    textAlign: "center"
  },
  viewInfo: {
    height: 190,
    backgroundColor: "#D6DCDA",
    margin: 10,
    borderRadius: 30,
    padding: 15,
    justifyContent: "space-between"
  },
  viewUser: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 10
  },
  scrollViewBody: {
    height: 0,
  },
  imgUser: {
    resizeMode: "contain",
    height: 60,
    width: 60,
    marginLeft: 10
  },
  txtBtn: {
    color: "#fff",
    fontWeight: 'bold',
    fontFamily: "MuseoSans-300",
    fontSize: 20,
  },
  btn: {
    backgroundColor: '#48887B',
    height: 40,
    width: "30%",
    marginRight: 5,
  },
  btnView: {
    flexDirection: "row",
    width: "75%",
    backgroundColor: "#00408C"
  }
});