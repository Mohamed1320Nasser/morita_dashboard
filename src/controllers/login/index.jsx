// import Swal from 'sweetalert2'
import { postPuplicData } from '../../constant/axiosClon'

export default {
    submitLogin: async (userName, password, remember = false) => {
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
                // Choose storage based on "Remember me" checkbox
                const storage = remember ? localStorage : sessionStorage;

                storage.setItem('token', token);
                storage.setItem('isAuthed', 'true');
                storage.setItem('user', JSON.stringify(response.data.user || {}));

                // Clear the other storage to avoid conflicts
                const otherStorage = remember ? sessionStorage : localStorage;
                otherStorage.removeItem('token');
                otherStorage.removeItem('isAuthed');
                otherStorage.removeItem('user');

                return { success: true, data: response.data };
            }

            return { success: false, error: { message: response?.msg || 'Login failed' } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
