import Map from "./Map";
import { selectShipping } from "./shippingSlice";
import { useSelector } from "react-redux";
import TimeInput from "./TimeInput";
import { useTranslation } from "react-i18next";
import DeliveryPriceInput from "./DeliveryPriceInput";
import WorkHoursInput from "./WorkHoursInput";
import FreeDeliveryPriceInput from "./FreeDeliveryPriceInput";
import MinOrderPriceInput from "./MinOrderPriceInput";
import ReadOnlyPriceRows from "./ReadOnlyPriceRows";
import ReadOnlyHours from "./ReadOnlyHours";
import { Card, SectionLabel, SoonCard, LockedCard, StatusRow } from "@/components/design/Card";
import PageHeader from "@/components/design/PageHeader";
import { NetworkIcon, CalendarPauseIcon, SearchIcon, SplitIcon } from "./icons";
import { deliveryTypes } from "../../../../static-data/data";

const Inputs = ({ pub }) => {
  const { t } = useTranslation();
  const shipping = useSelector(selectShipping);

  const shippingChecked = !!pub?.shipping?.available;

  // Zones/prices/hours are only self-service for a pub running its own
  // courier(s). A pub on the shared delivery service shares zones/pricing
  // with every other pub in that network - editing them independently here
  // would silently drift them out of sync with what the network (managed
  // from the superadmin panel) expects, so those sections go read-only and
  // route changes through the admin's bulk-copy tool instead.
  //
  // Availability, delivery type, and commission all used to be editable
  // right here, but moved to the superadmin's "Настройки заведений" screen
  // (see AdministrationPubSettings.jsx) - they're platform-level calls, not
  // day-to-day pub operations, so this screen just displays their current
  // value for transparency.
  const isNetworkManaged = pub?.shipping?.delivery_type === deliveryTypes.deliveryService;

  return (
    <div className="mt-4 mb-20">
      <div style={{ maxWidth: "620px" }} className="m-auto mb-10 flex flex-col gap-3.5 px-4">

        <PageHeader title={t("admin.admin_panel.shipping.headline")} backTo={`/admin/pub/${pub?.id}`} />

        <LockedCard>
          <StatusRow
            value={
              shippingChecked
                ? t("admin.admin_panel.shipping.delivery_enabled")
                : t("admin.admin_panel.shipping.delivery_disabled")
            }
          />
          <StatusRow
            label={t("admin.admin_panel.shipping.shipping_delivery_type.headline")}
            value={
              isNetworkManaged
                ? t("admin.delivery_types.delivery_service")
                : t("admin.delivery_types.own")
            }
          />
          <StatusRow
            label={t("admin.admin_panel.shipping.shipping_add_commission_to_dish_prices.headline")}
            value={
              pub?.shipping?.add_commission_to_dish_prices
                ? t("admin.admin_panel.shipping.commission_enabled")
                : t("admin.admin_panel.shipping.commission_disabled")
            }
          />
        </LockedCard>

        {shippingChecked && (
          <>
            {isNetworkManaged && (
              <div
                className="rounded-2xl flex gap-3 items-start p-4"
                style={{ background: "#e8f1fb", border: "1px solid #cfe0f5" }}
              >
                <NetworkIcon stroke="#2D7DD2" className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13.5px] font-semibold" style={{ color: "#1f63ab" }}>
                    {t("admin.admin_panel.shipping.network_managed.title")}
                  </div>
                  <div className="text-[12px] text-muted mt-0.5">
                    {t("admin.admin_panel.shipping.network_managed.description")}
                  </div>
                </div>
              </div>
            )}

            {isNetworkManaged ? (
              <LockedCard label={t("admin.admin_panel.shipping.shipping_time.label")}>
                <ReadOnlyHours
                  shipping_time_from={pub?.shipping?.shipping_time_from}
                  shipping_time_to={pub?.shipping?.shipping_time_to}
                  workHours={pub?.shipping?.shipping_work_hours_for_week}
                />
              </LockedCard>
            ) : (
              <Card>
                <TimeInput
                  shipping_time_from={pub?.shipping?.shipping_time_from}
                  shipping_time_to={pub?.shipping?.shipping_time_to}
                  companyID={pub?.company_id}
                  pubID={pub?.id}
                />
                <hr style={{ border: "none", borderTop: "1px solid #e4e9ee" }} />
                <WorkHoursInput
                  companyID={pub?.company_id}
                  workHours={pub?.shipping?.shipping_work_hours_for_week}
                  pubID={pub?.id}
                />
              </Card>
            )}

            {isNetworkManaged && (
              <SoonCard
                icon={CalendarPauseIcon}
                title={t("admin.admin_panel.shipping.soon.scheduled_closure_title")}
                desc={t("admin.admin_panel.shipping.soon.scheduled_closure_desc")}
              />
            )}

            {/* Delivery zones map - Map.jsx renders its own headline */}
            <Card>
              <Map pub={pub} readOnly={isNetworkManaged} />
            </Card>

            {/* Delivery price input */}
            {isNetworkManaged ? (
              <LockedCard label={t("admin.admin_panel.shipping.shipping_price.headline")}>
                <ReadOnlyPriceRows
                  prices={shipping?.shipping_prices}
                  shapes={shipping?.shapes}
                />
              </LockedCard>
            ) : (
              <Card>
                <SectionLabel>
                  {t("admin.admin_panel.shipping.shipping_price.headline")}
                </SectionLabel>
                <DeliveryPriceInput
                  companyID={pub?.company_id}
                  pubID={pub?.id}
                  deliveryPrices={shipping?.shipping_prices}
                  shapes={shipping?.shapes}
                />
              </Card>
            )}

            {isNetworkManaged ? (
              <LockedCard label={t("admin.admin_panel.shipping.shipping_free_delivery_prices.headline")}>
                <ReadOnlyPriceRows
                  prices={shipping?.shipping_free_delivery_prices}
                  shapes={shipping?.shapes}
                />
              </LockedCard>
            ) : (
              <Card>
                <SectionLabel>
                  {t("admin.admin_panel.shipping.shipping_free_delivery_prices.headline")}
                </SectionLabel>
                <FreeDeliveryPriceInput
                  companyID={pub?.company_id}
                  pubID={pub?.id}
                  deliveryPrices={shipping?.shipping_free_delivery_prices}
                  shapes={shipping?.shapes}
                />
              </Card>
            )}

            {!isNetworkManaged && (
              <Card>
                <SectionLabel>
                  {t("admin.admin_panel.shipping.shipping_min_order_prices.headline")}
                </SectionLabel>
                <MinOrderPriceInput
                  companyID={pub?.company_id}
                  pubID={pub?.id}
                  minOrderPrices={shipping?.shipping_min_order_prices}
                  shapes={shipping?.shapes}
                />
              </Card>
            )}

            <SoonCard
              icon={SearchIcon}
              title={t("admin.admin_panel.shipping.soon.zone_lookup_title")}
              desc={t("admin.admin_panel.shipping.soon.zone_lookup_desc")}
            />
            <SoonCard
              icon={SplitIcon}
              title={t("admin.admin_panel.shipping.soon.free_delivery_split_title")}
              desc={t("admin.admin_panel.shipping.soon.free_delivery_split_desc")}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Inputs;
