import { currencies } from "@/static-data/data";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { PencilIcon, TrashIcon } from "./icons";

const OrderPosition = ({
  pub,
  dish,
  count,
  deletePosition,
  fixedPrice,
  isEditingPrice,
  onStartEditPrice,
  onCancelEditPrice,
  onSavePrice,
  isSavingPrice,
}) => {
  const { t } = useTranslation();
  const [draftPrice, setDraftPrice] = useState(fixedPrice);

  // Re-seed the draft whenever editing (re)starts or the real price changes
  // under it (e.g. a save just landed) - not on every render, so typing
  // isn't fought.
  useEffect(() => {
    if (isEditingPrice) setDraftPrice(fixedPrice);
  }, [isEditingPrice, fixedPrice]);

  const currency =
    currencies.find((currency) => currency.id === pub?.currency_id)?.symbol ??
    "UnknownCurrency";

  return (
    <div className="flex gap-2 items-start w-full">
      <div className="flex-grow min-w-0">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-ink truncate">{dish?.name}</div>
            {dish.ingredients && (
              <div className="text-[12.5px] text-muted truncate">{dish.ingredients}</div>
            )}
          </div>
          <div className="text-[12.5px] text-muted flex-shrink-0 pt-0.5">
            {count} {t("admin.admin_panel.order_page.order_position.pieces_shortcut")}.
          </div>
        </div>

        {isEditingPrice ? (
          <div className="flex gap-2 items-center flex-wrap mt-2">
            <input
              type="number"
              className="h-9 w-24 px-3 rounded-lg text-[14px] font-semibold outline-none"
              style={{ border: "1.5px solid #2D7DD2", boxShadow: "0 0 0 3px #e8f1fb" }}
              value={draftPrice}
              autoFocus
              onChange={(e) => setDraftPrice(e.target.value)}
            />
            <span className="text-[13px] text-muted">{currency}</span>
            {isSavingPrice ? (
              <BlackSpinner />
            ) : (
              <button
                className="text-[12.5px] font-semibold"
                style={{ color: "#2D7DD2" }}
                disabled={draftPrice === "" || isNaN(+draftPrice)}
                onClick={() => onSavePrice(draftPrice)}
              >
                {t("admin.admin_panel.shipping.shipping_time.save")}
              </button>
            )}
            <button
              className="text-[12.5px] font-semibold text-muted-2"
              onClick={onCancelEditPrice}
            >
              {t("admin.admin_panel.order_page.cancel_edit_button")}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[14px] font-medium text-ink">
              {fixedPrice} {currency}
            </span>
            <button
              className="flex items-center gap-1 text-[12px] font-medium"
              style={{ color: "#2D7DD2" }}
              onClick={onStartEditPrice}
            >
              <PencilIcon stroke="#2D7DD2" />
              {t("admin.admin_panel.order_page.edit_price_link")}
            </button>
          </div>
        )}
      </div>

      <button
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-muted-2 hover:text-status-notdone"
        onClick={deletePosition}
        aria-label="delete"
      >
        <TrashIcon />
      </button>
    </div>
  );
};

export default OrderPosition;
