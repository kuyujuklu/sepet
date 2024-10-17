import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import { useTranslation } from "react-i18next";
import { Range, getTrackBackground } from "react-range";
import { useSetShippingWorkHoursMutation } from "../../../../api/pub/pub";

const WorkHoursInput = ({ pubID, companyID, shipping_start, shipping_end }) => {
    const { t } = useTranslation();

    const STEP = 5;
    const MIN = 0;
    const MAX = 1440;

    const [values, setValues] = useState([0,0])
    const start = values[0];
    const end = values[1];
    const startRoundedHours = parseInt(start / 60);
    const startRoundedMinutes = parseInt(start % 60);
    const endRoundedHours = parseInt(end / 60);
    const endRoundedMinutes = parseInt(end % 60);

    useEffect(() => {
        if (shipping_start === undefined || shipping_start === null || shipping_end === undefined || shipping_end === null) return;

        setValues([shipping_start, shipping_end])
    }, [shipping_start, shipping_end]);

    const [setShippingTime, { isLoading }] = useSetShippingWorkHoursMutation({
        fixedCacheKey: fixedCacheKeys.pubs.set_shipping_work_hours,
    });

    const saveInputs = () => {
        if (isNaN(+start) || isNaN(+end)) {
            return;
        }

        setShippingTime({ companyID, pubID, start, end });
    };

    return (
        <div>
            <div className="font-medium text-lg mb-2 flex items-center gap-10 flex-wrap">
                {t("admin.admin_panel.shipping.shipping_work_hours.label")}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <output style={{ marginTop: "5px" }} id="output">
                        {startRoundedHours < 10 ? "0" + startRoundedHours : startRoundedHours}:
                        {startRoundedMinutes < 10 ? "0" + startRoundedMinutes : startRoundedMinutes}
                    </output>
                    {" "}-{" "}
                    <output style={{ marginTop: "5px" }} id="output">
                        {endRoundedHours < 10 ? "0" + endRoundedHours : endRoundedHours}:
                        {endRoundedMinutes < 10 ? "0" + endRoundedMinutes : endRoundedMinutes}
                    </output>
                </div>
            </div>
            <div className="gap-2 flex flex-col items-center">
                    <Range
                        values={values}
                        step={STEP}
                        min={MIN}
                        max={MAX}
                        onChange={(values) => setValues(values)}
                        renderTrack={renderTrack(values, MIN, MAX)}
                        renderThumb={renderThumb}
                        
                    />
            </div>
            { (start !== shipping_start || end !== shipping_end) && 
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
                          <span>{isLoading ?  <BlackSpinner /> : t("admin.admin_panel.shipping.shipping_time.save") }</span>
                      </Button>
                }
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
                  colors: ["#ccc", "#548BF4", "#ccc" ],
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

export default WorkHoursInput;
