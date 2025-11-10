import toast, { Toaster } from "react-hot-toast";

export const notify = (err) =>
toast.error(`${err}`, {
  style: {
    borderRadius: "10px",
    background: "#333",
    color: "#fff",
    fontSize:"14px"
  },
});