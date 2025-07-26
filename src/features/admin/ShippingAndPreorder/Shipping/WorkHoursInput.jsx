import { Button } from "@mui/material";
import { useEffect, useState, useMemo, useCallback } from "react";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import { useTranslation } from "react-i18next";
import { Range, getTrackBackground } from "react-range";
import { useSetShippingWorkHoursMutation } from "../../../../api/pub/pub";

const WorkHoursForWeekInput = ({ pubID, companyID, workHours }) => {
  const { t } = useTranslation();

  const [setShippingTime, { isLoading }] = useSetShippingWorkHoursMutation({
    fixedCacheKey: fixedCacheKeys.pubs.set_shipping_work_hours,
  });

  const [monday, setMonday] = useState({ start: 0, end: 0 })
  const [tuesday, setTuesday] = useState({ start: 0, end: 0 })
  const [wednesday, setWednesday] = useState({ start: 0, end: 0 })
  const [thursday, setThursday] = useState({ start: 0, end: 0 })
  const [friday, setFriday] = useState({ start: 0, end: 0 })
  const [saturday, setSaturday] = useState({ start: 0, end: 0 })
  const [sunday, setSunday] = useState({ start: 0, end: 0 })

  useEffect(() => {
    console.log("WORK HOURS", workHours)
    if (workHours?.length !== 7) {
      return;
    }
    console.log("WADAFAK")

    setMonday(
      (prev) => {
        if (prev.start !== workHours[0].start || prev.end !== workHours[0].end) {
          console.log("Setting Monday: ", { ...workHours[0] })
          return { ...workHours[0] }
        }
        return prev
      }
    )
    setTuesday(
      (prev) => {
        if (prev.start !== workHours[1].start || prev.end !== workHours[1].end) {
          return { ...workHours[1] }
        }
        return prev
      }
    )
    setWednesday(
      (prev) => {
        console.log("Setting Wednesday: ", { ...workHours[0] })
        if (prev.start !== workHours[2].start || prev.end !== workHours[2].end) {
          return { ...workHours[2] }
        }
        return prev
      }
    )
    setThursday(
      (prev) => {
        if (prev.start !== workHours[3].start || prev.end !== workHours[3].end) {
          return { ...workHours[3] }
        }
        return prev
      }
    )
    setFriday(
      (prev) => {
        if (prev.start !== workHours[4].start || prev.end !== workHours[4].end) {
          return { ...workHours[4] }
        }
        return prev
      }
    )
    setSaturday(
      (prev) => {
        if (prev.start !== workHours[5].start || prev.end !== workHours[5].end) {
          return { ...workHours[5] }
        }
        return prev
      }
    )
    setSunday(
      (prev) => {
        if (prev.start !== workHours[6].start || prev.end !== workHours[6].end) {
          return { ...workHours[6] }
        }
        return prev
      }
    )
  }, [workHours, setMonday, setTuesday, setWednesday, setThursday, setFriday, setSaturday, setSunday])

  const hasChanges = useMemo(() => {
    if (workHours?.length !== 7) return false;

    return monday.start !== workHours[0].start || monday.end !== workHours[0].end ||
      tuesday.start !== workHours[1].start || tuesday.end !== workHours[1].end ||
      wednesday.start !== workHours[2].start || wednesday.end !== workHours[2].end ||
      thursday.start !== workHours[3].start || thursday.end !== workHours[3].end ||
      friday.start !== workHours[4].start || friday.end !== workHours[4].end ||
      saturday.start !== workHours[5].start || saturday.end !== workHours[5].end ||
      sunday.start !== workHours[6].start || sunday.end !== workHours[6].end
  }, [monday, tuesday, wednesday, thursday, friday, saturday, sunday, workHours])

  const saveInputs = useCallback(() => {

    if (!hasChanges) return;

    setShippingTime({
      pubID,
      companyID,
      workHours: [
        { start: monday.start, end: monday.end },
        { start: tuesday.start, end: tuesday.end },
        { start: wednesday.start, end: wednesday.end },
        { start: thursday.start, end: thursday.end },
        { start: friday.start, end: friday.end },
        { start: saturday.start, end: saturday.end },
        { start: sunday.start, end: sunday.end },
      ]

    })


  }, [monday, tuesday, wednesday, thursday, friday, saturday, sunday, hasChanges, setShippingTime, companyID, pubID]);

  return <>
    {t("admin.admin_panel.shipping.shipping_work_hours.label")}
    <div>
      <WorkHoursInput
        day={"Понедeл"}
        shipping_start={monday.start}
        shipping_end={monday.end}
        setHours={setMonday}
      />
      <WorkHoursInput
        day={"Вторник"}
        shipping_start={tuesday.start}
        shipping_end={tuesday.end}
        setHours={setTuesday}
      />
      <WorkHoursInput
        day={"Среда"}
        shipping_start={wednesday.start}
        shipping_end={wednesday.end}
        setHours={setWednesday}
      />
      <WorkHoursInput
        day={"Четверг"}
        shipping_start={thursday.start}
        shipping_end={thursday.end}
        setHours={setThursday}
      />
      <WorkHoursInput
        day={"Пятница"}
        shipping_start={friday.start}
        shipping_end={friday.end}
        setHours={setFriday}
      />
      <WorkHoursInput
        day={"Суббота"}
        shipping_start={saturday.start}
        shipping_end={saturday.end}
        setHours={setSaturday}
      />
      <WorkHoursInput
        day={"Воскреc"}
        shipping_start={sunday.start}
        shipping_end={sunday.end}
        setHours={setSunday}
      />
    </div>

    {
      hasChanges &&
      <Button
        variant="contained"
        sx={{
          marginTop: "10px",
          color: "white",
          bgcolor: "#3b82f6",
          fontSize: ".7rem",
          fontWeight: "medium",
          padding: ".2rem 1rem",
          borderRadius: "10px",
          width: "fit-content%",
          ":hover": {
            bgcolor: "#2563eb",
          },
        }}
        onClick={saveInputs}
      >
        <span>{isLoading ? <BlackSpinner /> : t("admin.admin_panel.shipping.shipping_time.save")}</span>
      </Button>
    }
  </>
}

export default WorkHoursForWeekInput

const WorkHoursInput = ({ day, shipping_start, shipping_end, setHours }) => {

  const { t } = useTranslation();

  const STEP = 5;
  const MIN = 0;
  const MAX = 1440;

  const [values, setValues] = useState([0, 1])
  const start = values[0];
  const end = values[1];
  const startRoundedHours = parseInt(start / 60);
  const startRoundedMinutes = parseInt(start % 60);
  const endRoundedHours = parseInt(end / 60);
  const endRoundedMinutes = parseInt(end % 60);

  useEffect(() => {
    if (shipping_start === undefined || shipping_start === null || shipping_end === undefined || shipping_end === null) return;

    setValues([+shipping_start, +shipping_end])
  }, [shipping_start, shipping_end]);

  const onFinalChange = useCallback(() => {
    if (!values || values.length !== 2) return;

    if ((+values[0]) !== +shipping_start || (+values[1]) !== +shipping_end) {
      console.log("Setting hours: ", {
        start: +values[0],
        end: +values[1]
      });
      setHours({
        start: +values[0],
        end: +values[1]
      })
    }

  }, [values, setHours, shipping_start, shipping_end])


  return (
    <div style={{}} className="font-medium text-lg mb-2 flex items-center gap-8 flex-wrap">
      <div>
        <span class="">{day}</span>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <output style={{}} id="output">
            {startRoundedHours < 10 ? "0" + startRoundedHours : startRoundedHours}:
            {startRoundedMinutes < 10 ? "0" + startRoundedMinutes : startRoundedMinutes}
          </output>
          {" "}-{" "}
          <output style={{}} id="output">
            {endRoundedHours < 10 ? "0" + endRoundedHours : endRoundedHours}:
            {endRoundedMinutes < 10 ? "0" + endRoundedMinutes : endRoundedMinutes}
          </output>
        </div>
      </div>
      <div style={{ flex: 1 }} className="gap-2 flex flex-col items-center ml-8">
        <Range
          values={values}
          step={STEP}
          min={MIN}
          max={MAX}
          onFinalChange={onFinalChange}

          onChange={(values) => setValues(values)}

          renderTrack={renderTrack(values, MIN, MAX)}
          renderThumb={renderThumb}

        />
      </div>
    </div>
  );
};

const renderTrack = (values, MIN, MAX) => ({ props, children }) => (
  <div
    onMouseDown={props.onMouseDown}
    onTouchStart={props.onTouchStart}
    style={{
      ...props.style,
      height: "36px",
      display: "flex",
      width: "100%",
    }}
  >
    <div
      ref={props.ref}
      style={{
        height: "5px",
        width: "100%",
        borderRadius: "4px",
        background: getTrackBackground({
          values: values,
          colors: ["#ccc", "#548BF4", "#ccc"],
          min: MIN,
          max: MAX,
        }),
        alignSelf: "center",
      }}
    >
      {children}
    </div>
  </div>
)

const renderThumb = ({ props, isDragged }) => (
  <div
    {...props}
    key={props.key}
    style={{
      ...props.style,
      height: "42px",
      width: "42px",
      borderRadius: "4px",
      backgroundColor: "#FFF",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0px 2px 6px #AAA",
    }}
  >
    <div
      style={{
        height: "16px",
        width: "5px",
        backgroundColor: isDragged
          ? "#548BF4"
          : "#CCC",
      }}
    />
  </div>
)

