import toast, { Toaster } from "react-hot-toast";
import PulseLoader from "react-spinners/PulseLoader";

export const Loader = () => {
    toast((t) => (
        <span className="loadingToast">
            <PulseLoader size={6} color="#1B3250" />
            Processing The Data.
        </span>
    ))
}
