import SomethingWentWrong from "@/app/shared-components/Errors/SomethingWentWrong";

import StoreProvider from "../../store/StoreProvider";
import ThemeContextProvider from "./ThemeContextProvider";
import DataToStateUploader from "./DataToStateUploader";
import ThemeWrapperForPubPage from "./ThemeWrapperForPubPage";
import SelectLocationPopup from "../Location/SelectLocationPopup";

function PubPage({ pubName, data, children }) {
  // Belt-and-suspenders: layout.js's getPubInfo already turns a 404/failed
  // fetch into `data === null`, which the parent handles - but should
  // `data.pub` ever come back falsy some other way, rendering nothing (the
  // old behavior) is a silent blank page with zero feedback. Show the same
  // error screen every other "couldn't load this pub" path already uses.
  if (data?.pub?.expired || !data?.pub) return <SomethingWentWrong />;

  return (
    <StoreProvider>
      <ThemeContextProvider>
        <div>
          <DataToStateUploader data={data} pubName={pubName} />
          <ThemeWrapperForPubPage data={data}>{children}</ThemeWrapperForPubPage>
        </div>
        <SelectLocationPopup />
      </ThemeContextProvider>
    </StoreProvider>
  );
}

export default PubPage;
