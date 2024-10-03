import axios from 'axios';
import moment from 'moment';

let res = null;
let data = null;

const service = axios.create({
  //baseURL: 'https://api.acaopositiva.dnsgecloud.com/'
  baseURL: 'http://192.168.0.117:9098/'
});

const setClientToken = token => {
  service.interceptors.request.use(function (config) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

const loginUser = async data => await service.post('login', data);

const registerUser = async data => await service.post('signup', data);

const updateUser = async data => await service.put('users/' + data._id, data);

const generateTokenTeleAppointment = async data => await service.post('teleAppointments/generateToken/', data);

const updateTeleAppointment = async data => await service.put('teleAppointments/' + data.id, data);

const findUserById = async data => await service.get('users/' + data._id);

const searchCep = async cep => await axios.get("https://viacep.com.br/ws/" + parseInt(cep) + "/json");

const findAllAttendancePlans = async () => {
  res = await service.get('attendancePlans');
  data = res.data.data;
  return !data ?
    [] :
    data.length == 0 ? [] : data.map(plan => {

      if (plan.status) {
        return {
          id: plan._id,
          name: plan.planName,
          specialties: plan.specialties,
          attendanceNumber: plan.attendanceNumber,
          price: plan.planPrice,
          minimumContract: plan.minimumContract,
          examAcess: plan.selfExamAccess,
          attendanceTime: plan.attendanceTime
        }
      }
    });
};
const findAllSpecialties = async () => {
  res = await service.get('specialties');
  data = res.data.data;
  return !data ?
    [] :
    data.length == 0 ? [] : data.map(spec => {
      return {
        id: spec._id,
        name: spec.specialtyName
      }
    })
};

const findAllUsersBySpecialty = async specialityId => {
  res = await service.get(`users/bySpecialty/${specialityId}`);
  data = res.data.data;
  return !data ?
    [] :
    data.length == 0 ? [] : data.map(user => {
      return {
        id: user._id,
        name: user.name,
        curriculum: user.curriculum,
        img: user.img,
        number: user.numberCouncil,
      }
    })
}

const saveSchedule = async data => {
  res = await service.post('teleAppointments', data);
  return res.data;
}

const findHoursByUserProf = async data => {
  res = await service.get('teleAppointments/availablesbyProfessionalAndDate/'
    + data.profId + '/' + data.dateSchedule);

  data = res.data.data;
  return !data ?
    [] :
    data.length == 0 ? [] : data.map((obj, index) => {
      const dataTimeNow = moment.utc().subtract(3, "hours");
      const dateTime = moment(obj.dateTime);

      if (dataTimeNow <= dateTime) {
        return {
          id: `${(index + 1)}`,
          name: obj.hour,
          dateTime
        }
      }
    }).filter(ob => ob !== undefined);
}

const findPendingByUserPatient = async data => {
  res = await service.get(`teleAppointments/pendingByUserIdAndType/${data._id}/PACIENTE`);
  data = res.data.data;

  return !data ?
    {
      pendencies: [],
      status: false
    } :
    {
      pendencies: data.length == 0 ? [] : dataModify(data),
      status: data.length == 0 ? false : true
    }
}

const dataModify = data => data.map(d => {
  return {
    id: d._id,
    profName: d.professional.name,
    specialty: d.specialty.specialtyName,
    dateHour: moment.utc(d.startDate).format("DD/MM/YYYY HH:mm"),
    startDate: d.startDate,
    endDate: d.endDate,
    number: d.professional.numberCouncil,
    img: d.professional.img
  }
});

export {
  setClientToken,
  loginUser,
  findAllSpecialties,
  findAllUsersBySpecialty,
  saveSchedule,
  findHoursByUserProf,
  findPendingByUserPatient,
  findAllAttendancePlans,
  searchCep,
  registerUser,
  updateUser,
  findUserById,
  updateTeleAppointment,
  generateTokenTeleAppointment
};
