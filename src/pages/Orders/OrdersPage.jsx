import { Text, View } from "native-base";
import Wrapper from "../Wrapper";
import { OrderListWithAllClientOrders } from "../../widgets/Orders/OrdersList/OrderListWithAllClientOrders";
import { AnonymousProBold } from "../../constants/styles-constants";

const OrdersPage = () => {
    return (
        <Wrapper>
            <View alignItems={"center"} mt={6} mb={3} >
                <Text fontFamily={AnonymousProBold} fontSize={32}>
                    Your orders
                </Text>
            </View>
                <OrderListWithAllClientOrders />
        </Wrapper>
    );
};

export default OrdersPage;
