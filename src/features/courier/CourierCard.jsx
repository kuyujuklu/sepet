import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { openCourierInfoPopup } from './popups/courierInfoPopupSlice';

const CourierCard = ({ courier }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const openCourierPopup = () => {
    dispatch(openCourierInfoPopup({ courier }));
  };

  return (
    <button
      type="button"
      onClick={openCourierPopup}
      className="text-[14.5px] font-semibold text-ink text-left hover:underline"
    >
      {courier?.full_name || t("admin.admin_panel.order_page.order_courier_info.no_name")}
    </button>
  );
};

export default CourierCard;
