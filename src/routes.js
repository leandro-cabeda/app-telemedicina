import React from 'react';
import { ActionConst, Router, Scene, Stack } from 'react-native-router-flux';
import { StatusBar, Platform } from 'react-native';

/* TODOS */
import Main from './components/Main';
import Register from './components/all/register/Index';
import Login from './components/all/login/Index';
import Notification from './components/all/notification/Notification';

/*PLANO DE ATENDIMENTO */
import AttendancePlan from './components/attendancePlan/plan/AttendancePlan';

/* DOUTORES */
import MedicalConsultationDoctor from './components/doctor/medicalConsultation/Index';

/* PACIENTES*/
import Home from './components/patient/Home';
import Schedule from './components/patient/schedule/Index';
import SchedulePendency from './components/patient/schedule/Pendency';

/* Usuários*/
import UserConfig from './components/user/config/UserConfig';

export default () => (
  <>
    <StatusBar
      backgroundColor="#546C8C"
      barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      hidden={false}
      
    />
    <Router>
      <Stack key="root">
        <Scene
          hideNavBar
          key="Main"
          component={Main}
          initial
          type={ActionConst.RESET}
        />
        <Scene hideNavBar key="Register" component={Register} />
        <Scene hideNavBar key="Login" component={Login} />
        <Scene
          hideNavBar
          key="UserConfig"
          component={UserConfig}
        />
        <Scene
          hideNavBar
          key="Home"
          component={Home}
        />
        <Scene
          hideNavBar
          key="Schedule"
          component={Schedule}
        />
        <Scene
          hideNavBar
          key="SchedulePendency"
          component={SchedulePendency}
        />
        <Scene
          hideNavBar
          key="MedicalConsultationDoctor"
          component={MedicalConsultationDoctor}
        />
        <Scene
          hideNavBar
          key="AttendancePlan"
          component={AttendancePlan}
        />
        <Scene
          hideNavBar
          key="Notification"
          component={Notification}
        />
      </Stack>
    </Router>
  </>
);
