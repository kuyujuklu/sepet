import { currencies } from "@/app/admin/static-data/data";
import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

const OrderPosition = ({ pub, dish, count }) => {
  const actualDishPrice =dish.sale_price ?  Math.min(dish.sale_price, dish.price) : dish.price
  const currency = currencies.find(
    (currency) => currency.id === pub?.currency_id
)?.symbol ?? "UnknownCurrency"
    return (
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <div className="w-full flex flex-wrap justify-between gap-x-10 pr-10 ">
                        <div>{dish?.name}</div>
                        <div>{count}шт.</div>
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
    );
};

export default OrderPosition;
