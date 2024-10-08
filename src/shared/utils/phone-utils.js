export function trimPhone(phone) {
  if (!phone) return;
  try {
    phone.toString();
  } catch {
    return "";
  }

  phone = phone.replaceAll(" ", "");
  phone = phone.replaceAll("-", "");
  phone = phone.replaceAll("(", "");
  phone = phone.replaceAll(")", "");
  phone = phone.replaceAll(",", "");
  phone = phone.replaceAll(".", "");

  return phone;
}
