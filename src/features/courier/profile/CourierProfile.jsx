import { useEffect, useMemo, useState } from "react";
import CourierProfileInputs from "./CourierProfileInputs";
import {
  useGetCourierQuery,
  useUpdateCourierMutation,
} from "../../../api/courier/courier";
import BlackSpinner from "../../../components/loaders/BlackSpinner";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { genders, orderPaymentTypes, orderStatuses } from "../../../static-data/data";
import CourierProfileImage from "./CourierProfileImage";
import { useSelector, useDispatch } from "react-redux";
import {
  errorKeys,
  setReceivingError,
} from "../../errorHandlers/errorHandlerSlice";
import { fixedCacheKeys } from "../../../api/fixedCacheKeys";
import { selectCourierOrders } from "../courier-orders/courierOrdersSlice";
import { GetUtcDateFromApiTime } from "../../../utils/time";
import { Card, SectionLabel, SoonChip } from "@/components/design/Card";
import SwitchLang from "../../company/SwitchLang";
import LogoutButton from "../../company/LogoutButton";
import { CashIcon } from "../icons";

const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const CourierProfile = ({ courierID }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [gender, setGender] = useState(genders.male);
  const [location, setLocation] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("")

  const {
    data: courierInfo,
    error: courierInfoError,
    isLoading: courierInfoIsLoading,
  } = useGetCourierQuery();

  //Check if is unauthorized
  useEffect(() => {
    if (!courierInfoError) return;
    dispatch(
      setReceivingError({
        errorKey: errorKeys.get_courier_info,
        error: courierInfoError,
      })
    );
  }, [courierInfoError, dispatch]);

  const localInputsHaveChanges = useMemo(() => {
    if (!courierInfo || !courierInfo.courier) return false;

    if (
      courierInfo.courier.full_name === name &&
      courierInfo.courier.phone_number === phone &&
      courierInfo.courier.birth_date === birthDate &&
      courierInfo.courier.gender === gender &&
      courierInfo.courier.location === location &&
      courierInfo.courier.telegram_username === telegramUsername
    ) {
      return false;
    }

    return true;
  }, [birthDate, courierInfo, gender, location, name, phone, telegramUsername]);

  const [lastCourierInfoFromApi, setLastCourierInfoFromApi] = useState(null);

  useEffect(() => {
    if (!courierInfo || !courierInfo.courier) return;

    const c = courierInfo.courier;

    if (c.full_name && c.full_name !== lastCourierInfoFromApi?.full_name) setName(c.full_name);
    if (c.phone_number && c.phone_number !== lastCourierInfoFromApi?.phone_number) setPhone(c.phone_number);
    if (c.gender && c.gender !== lastCourierInfoFromApi?.gender) setGender(c.gender);
    if (c.location && c.location !== lastCourierInfoFromApi?.location) setLocation(c.location);
    if (c.telegram_username && c.telegram_username !== lastCourierInfoFromApi?.telegram_username) setTelegramUsername(c.telegram_username);

    if (c.location && c.location !== lastCourierInfoFromApi?.location){
      if (c.birth_date === "0001-01-01") setBirthDate("2000-01-01");
      else setBirthDate(c.birth_date);
    }

    setLastCourierInfoFromApi(courierInfo.courier)
  }, [courierInfo, lastCourierInfoFromApi]);

  const [saveCourier, { isLoading: isSaveCourierLoading }] =
    useUpdateCourierMutation({
      fixedCacheKey: fixedCacheKeys.courier.update_courier_info,
    });

  const saveInputs = () => {
    const telegUser = telegramUsername.replace("@", "")
    const data = {
      fullName: name,
      phoneNumber: phone,
      gender: gender,
      birthDate: birthDate,
      location: location,
      telegramUsername: telegUser,
    };

    saveCourier({ courierID, data });
  };

  // Earnings/cash-on-hand - computed client-side over this courier's own
  // orders, the same way Home.jsx already aggregates its dashboard stats
  // from the already-loaded orders array (no new backend endpoint needed:
  // the WS GET_ALL payload already contains every order this courier has
  // ever reserved, see courierrepo.go's GetAllCourierOrders).
  const rawOrders = useSelector(selectCourierOrders);
  const myOrders = useMemo(
    () => (rawOrders ?? []).filter((o) => o.courier_info?.reserver_courier_id === courierID),
    [rawOrders, courierID]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = dayKey(now);
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    let earningsToday = 0;
    let earningsWeek = 0;
    let ordersWeek = 0;
    let cashOnHand = 0;

    for (const order of myOrders) {
      const created = GetUtcDateFromApiTime(order.created_time);
      const reward = order.courier_info?.courier_reward ?? 0;

      if (order.status === orderStatuses.completed) {
        if (dayKey(created) === todayKey) earningsToday += reward;
        if (created >= weekAgo) {
          earningsWeek += reward;
          ordersWeek += 1;
        }
      }

      if (
        order.status !== orderStatuses.completed &&
        order.status !== orderStatuses.canceled &&
        order.payment_type === orderPaymentTypes.cash
      ) {
        cashOnHand += order.total_dishes_price_without_commission ?? 0;
      }
    }

    const activeCashOrdersCount = myOrders.filter(
      (o) =>
        o.status !== orderStatuses.completed &&
        o.status !== orderStatuses.canceled &&
        o.payment_type === orderPaymentTypes.cash
    ).length;

    return { earningsToday, earningsWeek, ordersWeek, cashOnHand, activeCashOrdersCount };
  }, [myOrders]);

  const balance = isNaN(+courierInfo?.courier?.balance) ? 0 : +courierInfo?.courier?.balance;

  return (
    <div className="w-full flex flex-col items-center" style={{ background: "#f5f7fa" }}>
      <div className="w-full flex flex-col gap-3.5 px-4 py-4 pb-2" style={{ maxWidth: 560 }}>

        <Card>
          <SectionLabel>{t("courier.balance.headline")}</SectionLabel>
          <div className="text-[32px] font-bold text-ink num leading-none">{balance.toFixed(2)} Lei</div>
          <div className="flex gap-2.5 mt-1">
            <div className="flex-grow flex items-center justify-center gap-2 h-[42px] rounded-xl text-white font-bold text-[13.5px]" style={{ background: "#2D7DD2" }}>
              {t("courier.balance.request_payout")}
              <SoonChip />
            </div>
            <div className="flex items-center justify-center h-[42px] px-4 rounded-xl font-semibold text-[13.5px]" style={{ background: "#f2f4f6", color: "#526070" }}>
              {t("courier.balance.history")}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2.5">
          <Card style={{ padding: 14, gap: 4 }}>
            <div className="text-[17px] font-bold text-ink num">{stats.earningsToday.toFixed(0)}</div>
            <div className="text-[10.5px] text-muted-2">{t("courier.balance.today")}</div>
          </Card>
          <Card style={{ padding: 14, gap: 4 }}>
            <div className="text-[17px] font-bold text-ink num">{stats.earningsWeek.toFixed(0)}</div>
            <div className="text-[10.5px] text-muted-2">{t("courier.balance.week")}</div>
          </Card>
          <Card style={{ padding: 14, gap: 4 }}>
            <div className="text-[17px] font-bold text-ink num">{stats.ordersWeek}</div>
            <div className="text-[10.5px] text-muted-2">{t("courier.balance.orders_week")}</div>
          </Card>
        </div>

        {stats.cashOnHand > 0 && (
          <Card row>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(242,153,74,.12)" }}>
                <CashIcon style={{ color: "#f2994a" }} />
              </div>
              <div>
                <div className="text-[13px] text-muted">{t("courier.balance.cash_on_hand")}</div>
                <div className="text-[17px] font-bold text-ink num">{stats.cashOnHand.toFixed(2)} Lei</div>
              </div>
            </div>
            <div className="text-[11.5px] text-muted-2 text-right" style={{ maxWidth: 100 }}>
              {t("courier.balance.cash_on_hand_desc", { count: stats.activeCashOrdersCount })}
            </div>
          </Card>
        )}

        <SectionLabel className="mt-1 px-0.5">{t("courier.courier_profile_inputs.headline")}</SectionLabel>
        <Card>
          <CourierProfileInputs
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            gender={gender}
            setGender={setGender}
            location={location}
            setLocation={setLocation}
            telegramUsername={telegramUsername}
            setTelegramUsername={setTelegramUsername}
          />
          {localInputsHaveChanges && (
            <div className="w-full flex justify-end">
              <Button
                variant="contained"
                sx={{
                  color: "white",
                  bgcolor: "#2D7DD2",
                  fontSize: ".7rem",
                  fontWeight: "medium",
                  padding: ".5rem 1.5rem",
                  borderRadius: "10px",
                  ":hover": { bgcolor: "#1f63ab" },
                }}
                onClick={saveInputs}
              >
                <span>
                  {courierInfoIsLoading || isSaveCourierLoading ? (
                    <BlackSpinner />
                  ) : (
                    t("admin.admin_panel.shipping.shipping_time.save")
                  )}
                </span>
              </Button>
            </div>
          )}

          <div className="m-auto w-fit mt-1">
            <CourierProfileImage
              courierID={courierID}
              courierImageFileName={courierInfo?.courier?.image_file_name}
            />
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div className="flex items-center justify-between gap-2.5 px-4 py-3.5" style={{ borderBottom: "1px solid #f0f2f5" }}>
            <span className="text-[13.5px] font-medium text-ink">{t("courier.balance.language")}</span>
            <SwitchLang />
          </div>
          <div className="px-4 py-3.5">
            <LogoutButton />
          </div>
        </Card>

      </div>
    </div>
  );
};

export default CourierProfile;
