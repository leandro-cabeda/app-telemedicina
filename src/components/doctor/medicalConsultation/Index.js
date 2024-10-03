import React, { useEffect } from 'react';
import JitsiMeet, { JitsiMeetView } from 'react-native-jitsi-meet';
import { Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { updateTeleAppointment, generateTokenTeleAppointment } from '../../../services/api';

const Index = ({ teleAppointment }) => {

  const avatar = 'https://uybor.uz/borless/uybor/img/user-images/no-avatar.png';
  useEffect(() => {
    handleInitCall();
    return () => JitsiMeet.endCall();
  }, []);

  const handleInitCall = () => {

    setTimeout(async () => {

      const token = await generateToken();
      const url = `https://webrtc1.dnsgecloud.com/${teleAppointment.teleAppointmentId}?jwt=${token}`;
      const userInfo = {
        email: teleAppointment.email,
        displayName: teleAppointment.name,
        avatar: teleAppointment.img || avatar,
      };
      JitsiMeet.call(url, userInfo);
      /* Você também pode usar o JitsiMeet.audioCall (url) para chamadas apenas de áudio */
      /* Você pode terminar programaticamente a chamada com JitsiMeet.endCall () */
    }, 1000);

  }

  const onConferenceTerminated = nativeEvent => {

    Alert.alert(
      'Alerta !!!',
      'Deseja mesmo encerrar a chamada?',
      [
        {
          text: 'Não', onPress: () => {
            handleInitCall();
          },
          style: 'cancel',
        },
        {
          text: 'Sim', onPress: async () => {
            const dataTeleAppointment = {
              id: teleAppointment.teleAppointmentId,
              status: "Realizado"
            }
            const res = await updateTeleAppointment(dataTeleAppointment);
            if (res.data.status === "success") {
              Actions.reset('Main');
            } else {
              handleInitCall();
            }
          }
        },
      ],
      { cancelable: false },
    );

  }

  const onConferenceJoined = nativeEvent => {
    /* Conference joined event */
    //console.log(nativeEvent)
  }

  const onConferenceWillJoin = nativeEvent => {
    /* Conference will join event */
    //console.log(nativeEvent)
  }


  const generateToken = async () => {

    const data = {
      user: {
        img: teleAppointment.img || avatar,
        name: teleAppointment.name,
        email: teleAppointment.email,
        id: teleAppointment.id
      },
      teleAppointment: {
        _id: teleAppointment.teleAppointmentId,
        endDate: teleAppointment.endDate,
      }
    }

    const res = await generateTokenTeleAppointment(data);
    return res.data.data;
  }


  return (
    <JitsiMeetView
      onConferenceTerminated={onConferenceTerminated}
      onConferenceJoined={onConferenceJoined}
      onConferenceWillJoin={onConferenceWillJoin}
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
      }}
    />
  )
}

export default Index;