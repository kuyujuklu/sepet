import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { deliveryTypes } from "../../../../static-data/data";
import { useUpdateDeliveryTypeMutation } from "../../../../api/pub/pub";
import BlackSpinner from "../../../../components/loaders/BlackSpinner";
import Select from "../../../../components/Inputs/Select";
import { fixedCacheKeys } from "../../../../api/fixedCacheKeys";

const DeliveryTypeInput = ({ companyID, pubID, deliveryType, onSaved }) => {
  const { t } = useTranslation();
  const [localDeliveryType, setLocalDeliveryType] = useState(deliveryTypes.Own);

  const [
    updateDeliveryType,
    { data: updateDeliveryTypeData, error: updateDeliveryTypeError, isLoading },
  ] = useUpdateDeliveryTypeMutation({fixedCacheKey: fixedCacheKeys.pubs.set_delivery_type});

  useEffect(() => {
    if (!deliveryType) return;
    setLocalDeliveryType(deliveryType);
  }, [deliveryType]);

  const saveDeliveryType = (value) => {
    if(!value) return;

    updateDeliveryType({companyID, pubID, deliveryType: value}).finally(() => {
      onSaved?.();
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Select
          selectClassName={"text-xs sm:text-sm"}
          value={localDeliveryType}
          values={[
            {
              text: t("admin.delivery_types.own"),
              value: deliveryTypes.own,
            },
            {
              text: t("admin.delivery_types.delivery_service"),
              value: deliveryTypes.deliveryService,
            },
          ]}
          setValue={saveDeliveryType}
        />
        {isLoading && <BlackSpinner />}
      </div>
      <span className="text-xs text-gray-400">
        {localDeliveryType === deliveryTypes.deliveryService
          ? t("admin.delivery_types.delivery_service_hint")
          : t("admin.delivery_types.own_hint")}
      </span>
    </div>
  );
};

export default DeliveryTypeInput;
