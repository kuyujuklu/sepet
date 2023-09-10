import { getPubInfo } from "../api/pub";
import PubPage from "../components/PubPage/PubPage";

export default async function PubWithMenusLayout({ children, params }) {
    const data = await getPubInfo(params?.pubID);
    
    return (
        <PubPage data={data} pub={data.pub} downPanelData={data} hasDownPanel={true} >
            {children}            
        </PubPage>
    );
}