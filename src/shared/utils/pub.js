export const isPubOpened = (pub) => {
  const now = new Date();
  const currentDayTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const isDeliveryAvailable =
    pub?.shipping?.available &&
    currentDayTimeInMinutes > pub?.shipping?.shipping_work_start &&
    currentDayTimeInMinutes < pub?.shipping?.shipping_work_end;
  return isDeliveryAvailable;
};
