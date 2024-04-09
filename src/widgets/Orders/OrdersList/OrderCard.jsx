import { Image, Text, View } from "native-base";
import { AnonymousProBold } from "../../../constants/styles-constants";
import { images } from "../../../app/images/images";
import Stars from "../../Pub/Stars";
import { ConvertApiTimeToLocalDayMonthYear } from "../../../shared/utils/time";

const OrderCard = ({order}) => {
    return (
        <View
            style={{ height: 90 }}
            px="5"
            borderWidth={1}
            borderColor={"#aaa"}
            rounded={"2xl"}
            w="full"
            flexDir={"row"}
        >
            <View w={"70%"} h="full" justifyContent={"space-between"}>
                <View flex={1} justifyContent={"center"} overflow={"hidden"}>
                    <Text fontSize={"19"} fontFamily={AnonymousProBold}>
                        {order?.pub_name}
                    </Text>
                </View>
                <View flex={1} justifyContent={"center"}>
                    <View flexDir={"row"} alignItems={"center"} gap={2}>
                        <View width={17} height={17}>
                            <Image
                                source={images.DishPlateBlack}
                                alt=""
                                style={{ width: "100%", height: "100%" }}
                            />
                        </View>
                        <Text fontSize={"12"}>4 positions</Text>
                    </View>
                </View>
                <View flex={1} justifyContent={"center"}>
                    <View flexDir={"row"} alignItems={"center"} gap={2}>
                        <View width={15} height={15}>
                            <Image
                                source={images.LikeDislikeBlack}
                                alt=""
                                style={{ width: "100%", height: "100%" }}
                            />
                        </View>
                        <Text fontSize={"12"}>Rate</Text>
                    </View>
                </View>
            </View>
            <View w={"90%"} h="full" justifyContent={"space-between"}>
                <View flex={1} justifyContent={"center"}>
                    <View flexDir={"row"} alignItems={"center"} gap={2}>
                        <Stars count={1} />
                        <Text fontWeight={"bold"}>4.9</Text>
                    </View>
                </View>
                <View flex={1} justifyContent={"center"}>
                    <View flexDir={"row"} alignItems={"center"} gap={2}>
                        <View width={15} height={15}>
                            <Image
                                source={images.CalendarBlack}
                                alt=""
                                style={{ width: "100%", height: "100%" }}
                            />
                        </View>
                        <Text fontSize={"12"}>{ConvertApiTimeToLocalDayMonthYear(order?.created_time)}</Text>
                    </View>
                </View>
                <View flex={1} justifyContent={"center"}>
                    <View flexDir={"row"} alignItems={"center"} gap={2}>
                        <View width={15} height={15}>
                            <Image
                                source={images.AgainBlack}
                                alt=""
                                style={{ width: "100%", height: "100%" }}
                            />
                        </View>
                        <Text fontSize={"12"}>Repeat</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default OrderCard;
