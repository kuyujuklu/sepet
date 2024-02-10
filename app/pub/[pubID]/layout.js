import SomethingWentWrong from "@/app/shared-components/Errors/SomethingWentWrong";
import { getPubInfo } from "../api/pub";
import PubPage from "../components/PubPage/PubPage";


export default async function PubWithMenusLayout({ children, params }) {
    let data = await getPubInfo(params?.pubID);

    if (!data) {
        return (
            <div>
                <SomethingWentWrong />
            </div>
        );
    }
    return (
        <PubPage
            data={data}
            pub={data.pub}
            downPanelData={data}
            hasDownPanel={true}
        >
            {children}
        </PubPage>
    );
}
