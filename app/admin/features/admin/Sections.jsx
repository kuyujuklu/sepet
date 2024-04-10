import { NavLink } from "react-router-dom";
import FoodShippingImage from "@/public/images/png/food-shipping.png";
import MenuInPhone from "@/public/images/png/menu-in-phone.png";
import OrdersPhoneImage from "@/public/images/png/orders_in_phone.png";
import Image from "next/image";
import PinPubsGeolocation from "./PinPubsGeolocation";

const Sections = ({ pub }) => {
    return (
        <div
            style={{ maxWidth: "1000px" }}
            className="m-auto flex justify-center flex-wrap gap-10"
        >
            {pub && (
                <>
                    <PinPubsGeolocation />

                    <NavLink
                        to={`/admin/pub/${pub.id}/shipping`}
                        style={{ display: "block", width: "250px" }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "300px",
                                maxWidth: "250px",
                                transition: "all .3s ease-in-out",
                            }}
                            className="flex flex-col justify-center relative border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
                        >
                            <span className="text-center text-xl font-bold">
                                Food shipping
                            </span>
                            <div
                                className="relative"
                                style={{ flex: "1 0 90%" }}
                            >
                                <Image
                                    fill
                                    src={FoodShippingImage}
                                    alt="food shipping image"
                                    style={{ objectFit: "scale-down" }}
                                />
                            </div>
                        </div>
                    </NavLink>
                    <NavLink
                        to={`/admin/company/pub/${pub.id}/`}
                        style={{ display: "block", width: "250px" }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "300px",
                                maxWidth: "250px",
                                transition: "all .3s ease-in-out",
                            }}
                            className="flex flex-col justify-between relative border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
                        >
                            <span className="text-center text-xl font-bold">
                                Edit menu
                            </span>
                            <div
                                className="relative"
                                style={{ flex: "1 1 100%" }}
                            >
                                <Image
                                    fill
                                    src={MenuInPhone}
                                    alt="food shipping image"
                                    style={{ objectFit: "scale-down" }}
                                />
                            </div>
                        </div>
                    </NavLink>
                    <NavLink
                        to={`/admin/pub/${pub.id}/orders`}
                        style={{ display: "block", width: "250px" }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "300px",
                                maxWidth: "250px",
                                transition: "all .3s ease-in-out",
                            }}
                            className="flex flex-col justify-between relative border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer"
                        >
                            <span className="text-center text-xl font-bold">
                                Orders
                            </span>
                            <div
                                className="relative"
                                style={{ flex: "1 1 100%" }}
                            >
                                <Image
                                    fill
                                    src={OrdersPhoneImage}
                                    alt="food shipping image"
                                    style={{ objectFit: "scale-down" }}
                                />
                            </div>
                        </div>
                    </NavLink>
                </>
            )}
        </div>
    );
};

export default Sections;
