// import Swal from 'sweetalert2'
import { postPuplicData } from '../../constant/axiosClon'

export default {
    submitLogin: async (userName, password) => {
        const data = {
            email: userName,
            password: password,
        }
        try {
            const response = await postPuplicData('/auth/admin/login', data);

            // Normalize backend response shape
            const isOk = response && response.error === false && response.status === 200;
            const token = response?.data?.token;

            if (isOk && token) {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('isAuthed', 'true');
                sessionStorage.setItem('user', JSON.stringify(response.data.user || {}));
                return { success: true, data: response.data };
            }

            return { success: false, error: { message: response?.msg || 'Login failed' } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
