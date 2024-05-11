import dev from "./dev";
import prod from "./prod";

export const ENV = process.env.EXPO_PUBLIC_IS_DEV ? dev : prod;
