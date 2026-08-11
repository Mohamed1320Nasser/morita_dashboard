import toast, { Toaster } from "react-hot-toast";

const toastStyle = {
  borderRadius: "10px",
  background: "#333",
  color: "#fff",
  fontSize: "14px",
};

// Callers pass either a plain message or an object such as
// { message, type: 'success' }, and some pass a second "success" argument.
// Read both so a successful save does not appear as a red error, and an
// object never renders as "[object Object]".
export const notify = (input, type) => {
  const isObject = input && typeof input === "object";
  const message = isObject
    ? input.message || input.error || JSON.stringify(input)
    : `${input}`;
  const kind = type || (isObject ? input.type : undefined);

  return kind === "success"
    ? toast.success(message, { style: toastStyle })
    : toast.error(message, { style: toastStyle });
};