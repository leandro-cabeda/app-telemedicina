import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Image,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Alert,
    ScrollView,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import storage from '@react-native-firebase/storage';
import { findUserById, updateUser } from '../../../services/api';
import ImagePicker from 'react-native-image-picker';
import logo from '../../../img/logo-acao-positiva-h.png';
import defaultLogo from '../../../img/default-user.jpg';
import safeAreaStyles from '../../../styles/SafeAreaStyles';
import styles from '../../../styles/Styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../../template/Header';
import LogoTipo from "../../../template/LogoTipo";


export default () => {
    const [userById, setUserById] = useState(null);
    const [userAttendancePlan, setUserAttendancePlan] = useState(false);

    useEffect(() => {
        carregarUser();
    }, []);

    const carregarUser = async () => {

        try {
            const user = JSON.parse(await AsyncStorage.getItem('user'));

            if (user !== null) {
                const userById = await findUserById(user);
                if (userById.data.data !== null) {
                    setUserById(userById.data.data);
                } else {
                    alert("Alerta", "Ocorreu falha ao buscar os dados do usuário!");
                }
            } else {
                Actions.reset("Main");
            }

        } catch (e) {
            Actions.reset("Main");
        }
    }

    const alert = (title, message) => {

        Alert.alert(
            title,
            message,
            [{
                text: 'OK'
            }],
            { cancelable: false },
        );
    }

    const SpecialtiesAttendancePlan = () =>
        userById?.virtualAttendancePlan?.specialties.map(spec => {
            if (spec.status) {
                return <Text style={{
                    marginLeft: 40,
                    fontSize: 14,
                    fontFamily: "MuseoSans-300"
                }}>
                    {spec.specialtyName}
                </Text>
            }
        });

    const logoUser = userById?.img ? { uri: `${userById?.img}` } : defaultLogo;

    const storageFirebase = file => storage().ref(`imagensUsuario/${file}`);

    const uploadImg = async res => {
        console.log('res: ', res)
        if (!res.didCancel) {
            const file = res.fileName.split(".")[0];
            const ext = res.fileName.split(".")[1].toLowerCase();

            if (ext == "jpg" || ext == "png") {

                const storageRef = storageFirebase(file);
                const firebaseImgRef = await storageRef.putString(res.data, "base64", { contentType: res.type });

                if (firebaseImgRef.error) {
                    return alert("Alerta de Erro!", "Ocorreu o seguinte erro ao enviar imagem: " + firebaseImgRef.error.message);
                }

                const data = {
                    _id: userById?._id,
                    img: await storageRef.getDownloadURL(),
                    imgName: file,
                }
                const response = await updateUser(data);
                if (response.data.data !== null) {
                    await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
                    carregarUser();
                } else {
                    alert("Alerta", "Ocorreu falha ao atualizar a imagem do usuário!");
                }

            } else {
                alert("Alerta !", "Extensão de imagem inválido! Só são aceitos extensões ('jpg' e 'png')");
            }

        } else if (res.error) {
            alert("Alerta de Erro!", "Ocorreu o seguinte erro ao carregar imagem: " + res.error);
        }
    }

    const addOrUpdateImageUser = () => {

        ImagePicker.showImagePicker({
            title: 'Selecione a opção de foto',
            customButtons: [
                { name: 'camera', title: 'Tirar Foto' },
                { name: 'galeria', title: 'Escolher Foto' }
            ],
            takePhotoButtonTitle: null,
            chooseFromLibraryButtonTitle: null,
        }, response => {

            const selectButton = response.customButton;

            if (response.error) {
                alert("Alerta de Erro!", "Ocorreu o seguinte erro ao clicar na imagem: " + response.error);
            } else if (selectButton == "camera") {
                // Launch Camera:
                ImagePicker.launchCamera({
                    maxHeight: 2000,
                    maxWidth: 2000,
                    quality: 1,
                    rotation: 360,
                    storageOptions: {
                        skipBackup: true, // Estando "true", não realiza backup no cloud
                        path: 'images', // Criar a pasta "images" no mobile e salvará partir dela
                    },
                }, res => {
                    uploadImg(res);
                });

            } else if (selectButton == "galeria") {
                // Open Image Library:
                ImagePicker.launchImageLibrary({}, res => {
                    uploadImg(res);
                });
            }
        });
    }

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        Actions.reset("Main");
    }

    return (

        <SafeAreaView style={safeAreaStyles.safeAreaStyle}>
            <ScrollView>
                <Header data='Perfil Usuário' />
                {!userById ?
                    <ActivityIndicator style={{ alignSelf: "center", marginTop:100 }} size="large" color="#AC3335" />
                    :
                    <>
                        <View style={style.viewPart}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={addOrUpdateImageUser}>
                                <Text style={[styles.imgTitle, style.imgTitle]}>Alterar</Text>
                                <Image style={styles.imgAvatar} source={logoUser} />
                            </TouchableOpacity>
                            <Text style={style.txtTitle}>Olá {userById?.name?.split(" ")[0]}</Text>
                        </View>
                        <View style={styles.viewPart}>
                            <View style={styles.viewInfo}>
                                <Icon style={{ flex: 1 }} size={25} name="info" />
                                <Text style={[styles.viewInfoText, { fontSize: 20 }]}>{userById?.name}</Text>
                            </View>
                            <View style={styles.viewInfo}>
                                <Icon style={{ flex: 1 }} size={25} name="id-card-o" />
                                <Text style={[styles.viewInfoText, { fontSize: 20 }]}>{userById?.cpf}</Text>
                            </View>
                            <View style={styles.viewInfo}>
                                <Icon style={{ flex: 1 }} size={25} name="envelope" />
                                <Text style={[styles.viewInfoText, { fontSize: 20 }]}>{userById?.email}</Text>
                            </View>
                            <View style={styles.viewInfo}>
                                <Icon style={{ flex: 1 }} size={25} name="phone" />
                                <Text style={[styles.viewInfoText, { fontSize: 20 }]}>{userById?.phone}</Text>
                            </View>
                        </View>
                        {userById?.attendancePlan &&
                            <>
                                <TouchableOpacity style={[style.styleButton, { marginTop: 30 },
                                !userAttendancePlan && { marginBottom: 50 }]}
                                    onPress={() => setUserAttendancePlan(!userAttendancePlan)}>
                                    <Icon size={35} name="user-md" color="#fff" />
                                    <Text style={[style.txtTitle2, { marginRight: 70 }]}>Meu Plano</Text>
                                </TouchableOpacity>
                                {userAttendancePlan &&
                                    <View style={[styles.viewPart, style.viewPartPlan]}>
                                        <Text style={styles.viewInfoText2}>Nome Plano: {userById?.virtualAttendancePlan?.planName}</Text>
                                        <Text style={styles.viewInfoText2}>Nº Atendimento(s) Mensal: {userById?.virtualAttendancePlan?.attendanceNumber}</Text>
                                        <View>
                                            <Text style={[styles.viewInfoText2, { marginBottom: 10 }]}>Especialidade(s):</Text>
                                            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                                                {SpecialtiesAttendancePlan()}
                                            </View>
                                        </View>
                                        <TouchableOpacity style={style.btnHiperLink} onPress={() => Actions.AttendancePlan()}>
                                            <Icon size={18} name="edit" color="#0193BC" />
                                            <Text style={style.txtHiperLink}>Alterar plano</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </>
                        }
                        <View style={[{ marginBottom: 20 }, !userById?.attendancePlan && { marginTop: 30 }]}>
                            <Text style={style.txt}>Solicitar Alteração ou Exclusão dos Dados?</Text>
                            <TouchableOpacity style={[style.styleButton, { backgroundColor: "#FEFEFE" }]}
                                onPress={() => { }}>
                                <Icon size={35} name="question" color="#000" />
                                <Text style={[style.txtTitle2, { color: "#000", marginRight: 95 }]}>Solicitar</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[style.styleButton, { backgroundColor: "#FEFEFE", marginBottom: 20 }]}
                            onPress={() => { }}>
                            <Icon size={35} name="comment-o" color="#000" />
                            <Text style={[style.txtTitle2, { color: "#000", marginRight: 35 }]}>Fale Conosco</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[style.styleButton, { backgroundColor: "#AC3335", marginBottom: 30 }]}
                            onPress={() => Alert.alert(
                                'Aviso!',
                                'Deseja mesmo sair?',
                                [
                                    {
                                        text: 'Não',
                                        style: 'cancel',
                                    },
                                    { text: 'Sim', onPress: () => handleLogout() },
                                ],
                                { cancelable: false },
                            )
                            }>
                            <Icon size={35} name="sign-out" color="#fff" />
                            <Text style={[style.txtTitle2, { marginRight: 40 }]}>Sair da Conta</Text>
                        </TouchableOpacity>
                        <Image style={styles.imgLogo2} source={logo} />
                        <LogoTipo styleValue={{ marginTop: 30 }} />
                    </>
                }
            </ScrollView>
        </SafeAreaView>
    );
}

const style = StyleSheet.create({
    viewPart: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 25,
    },
    viewPartPlan: {
        marginTop: -10,
        flexWrap: "wrap"
    },
    txtTitle: {
        textAlign: "left",
        fontSize: 26,
        fontWeight: 'bold',
        color: "#000",
        fontFamily: "MuseoSans-300",
        flex: 1,
        marginLeft: -5
    },
    txtTitle2: {
        fontSize: 28,
        fontWeight: 'bold',
        color: "#fff",
        fontFamily: "MuseoSans-300",
    },
    styleButton: {
        flexDirection: "row",
        backgroundColor: "#48887B",
        height: 50,
        justifyContent: "space-evenly",
        alignItems: "center",
        borderRadius: 10,
        width: "85%",
    },
    btnHiperLink: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        marginLeft: 40,
        width: "35%",
        borderBottomWidth: 1,
        borderColor: "#0193BC"
    },
    txtHiperLink: {
        fontSize: 18,
        fontFamily: "MuseoSans-300",
        color: "#0193BC",
        fontWeight: "bold",
    },
    txt: {
        fontSize: 15,
        color: "#000",
        fontFamily: "MuseoSans-300",
        paddingLeft: 12,
        fontWeight: 'bold',
    },
    imgTitle: {
        color: "#fff",
        backgroundColor: "#000",
        borderRadius: 15,
        marginVertical: 18,
        fontFamily: "MuseoSans-300",
        width: "40%",
        alignSelf: "center"
    }
});