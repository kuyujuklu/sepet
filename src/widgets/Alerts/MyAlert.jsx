import { Alert, CloseIcon, HStack, IconButton, Text } from "native-base";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useDispatch } from "react-redux";
import { removeAlert } from "../../features/store/alerts/alertSlice";

const MyAlert = ({ status, title, delay, id }) => {
    const dispatch = useDispatch();
    const [expired, setExpired] = useState(false);

    const expirationAnimation = useRef(new Animated.Value(0)).current;
    const slideAnimation = useRef(new Animated.Value(0)).current;

    const remove = () => {
        dispatch(removeAlert(id));
    };

    useEffect(() => {
        Animated.timing(slideAnimation, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
        }).start();
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setExpired(true);
        }, delay);
    }, [delay]);

    useEffect(() => {
        if (!expired) return;

        Animated.timing(expirationAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
        }).start();

        setTimeout(() => {
            remove();
        }, 1000);
    }, [expired]);

    return (
        <Animated.View
            style={{
                position: "relative",
                opacity: expirationAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                }),
                left: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-100%", "0%"],
                }),
                zIndex: 100
            }}
        >
            <Alert
                w="100%"
                status={status}
                key={"success"}
                variant={"solid"}
                colorScheme={"success"}
                maxW={"350"}
            >
                {/* Header */}
                <HStack
                    flexShrink={1}
                    space={2}
                    justifyContent="space-between"
                    w="100%"
                >
                    <HStack
                        space={2}
                        flexShrink={1}
                        alignItems={"center"}
                        flex={1}
                    >
                        <Alert.Icon mt="" mr={"3"} size={4} />
                        <Text
                            fontSize="sm"
                            color="white"
                            textBreakStrategy="simple"
                            p="2"
                            maxW={"80%"}
                        >
                            {title}
                        </Text>
                    </HStack>
                    <IconButton
                        onPress={remove}
                        variant="unstyled"
                        _focus={{
                            borderWidth: 0,
                        }}
                        icon={<CloseIcon size="3" />}
                        _icon={{
                            color: "white",
                        }}
                    />
                </HStack>
            </Alert>
        </Animated.View>
    );
};

export default MyAlert;
