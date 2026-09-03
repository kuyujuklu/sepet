import AdministrationNav from "./AdministrationNav";
import PushCampaignCompose from "./pushCampaigns/PushCampaignCompose";
import PushCampaignHistory from "./pushCampaigns/PushCampaignHistory";
import usePageTitle from "@/hooks/usePageTitle";

const AdministrationPush = () => {
  usePageTitle("Пуши");

  return (
    <>
      <AdministrationNav />
      <div className="mx-auto w-full max-w-[620px] flex flex-col gap-3.5" style={{ padding: "16px 16px 40px" }}>
        <PushCampaignCompose />
        <PushCampaignHistory />
      </div>
    </>
  );
};

export default AdministrationPush;
