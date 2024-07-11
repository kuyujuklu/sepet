import SomethingWentWrong from "@/app/shared-components/Errors/SomethingWentWrong";
import CreateOrderPopup from "../Order/CreateOrderPopup";

import StoreProvider from "../../store/StoreProvider";
import ThemeContextProvider from "./ThemeContextProvider";
import DataToStateUploader from "./DataToStateUploader";
import ThemeWrapperForPubPage from "./ThemeWrapperForPubPage";

function PubPage({ data, children, hasDownPanel, downPanelData }) {
    if (data?.pub?.expired) return <SomethingWentWrong />;

    return (
        <StoreProvider>
            <ThemeContextProvider data={data}>
            {
                data?.pub && (
                    <div>
                        <DataToStateUploader data={data} />
                        {/* wrapper */}
                        <ThemeWrapperForPubPage data={data} hasDownPanel={hasDownPanel} downPanelData={downPanelData} >{children}</ThemeWrapperForPubPage>
                    </div>
                )
            }
                <CreateOrderPopup />
            </ThemeContextProvider>
        </StoreProvider>
    );
}

export default PubPage;
