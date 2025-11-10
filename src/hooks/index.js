export const formatDate = (dateString) => {
  if (!dateString) return "";

  // Create a date object from the ISO string
  const date = new Date(dateString);

  // Format the date to YYYY-MM-DDThh:mm format required by datetime-local input
  // padStart ensures we always have 2 digits for month, day, hours, and minutes
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
