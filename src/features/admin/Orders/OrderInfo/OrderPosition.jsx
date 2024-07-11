import { currencies } from "@/static-data/data";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const OrderPosition = ({ pub, dish, count, deletePosition }) => {
  const {t} = useTranslation()
  const actualDishPrice =dish.sale_price ?  Math.min(dish.sale_price, dish.price) : dish.price
  const currency = currencies.find(
    (currency) => currency.id === pub?.currency_id
)?.symbol ?? "UnknownCurrency"


    return (
      <div className="flex gap-2 items-center">
            <Accordion className="w-full">
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <div className="w-full flex flex-wrap justify-between gap-x-10 pr-10 ">
                        <div>{dish?.name}</div>
                        <div>{count}{t("admin.admin_panel.order_page.order_position.pieces_shortcut")}.</div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="flex gap-3">
                    {dish.price > actualDishPrice && <strike className="text-red-600">{dish.price}</strike>}
                    <span>{actualDishPrice} {" "}{currency}</span>

                  </div>
                  <span className="text-red-400">{dish.ingredients}</span>
                </AccordionDetails>
            </Accordion>
                <Button
                    variant="contained"
                    sx={{
                        color: "white",
                        bgcolor:"transparent",
                        height: 50,
                        width: 50,
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        padding: ".7rem 1rem",
                        borderRadius: "10px",
                        ":hover": {
                            bgcolor: "transparent"
                        },
                    }}
                    onClick={deletePosition}
                >
                    <img src="/static/admin/images/svg/trash-can-red.svg" />
                </Button>
      </div>
    );
};

export default OrderPosition;
