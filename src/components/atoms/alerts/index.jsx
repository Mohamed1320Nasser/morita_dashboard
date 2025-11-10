import Swal from 'sweetalert2'

export const ForberidenAlert = () => {
    let timerInterval;
    Swal.fire({
        title: "Your Session is Expired",
        html: "please login again",
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            sessionStorage.clear();
            location.href = "/login";
        }
    });
}