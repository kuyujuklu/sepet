import SomethingWentWrong from "@/app/shared-components/Errors/SomethingWentWrong";
import { getPubInfo } from "../api/pub";
import PubPage from "../components/PubPage/PubPage";
import initTranslations from "@/app/i18n";
import TransProvider from "../components/TransProvider";

export async function generateMetadata(
    {params, searchParams},
    parent
) {
    const pubID = params.pubID;
    let pubData = await getPubInfo(pubID);
    if(!pubData) {
        return {
            title: params.locale === "ru" ? "Неизвестное заведение" : "Restaurant necunoscut",
            description: params.locale === "ru" ? "Неизвестный ресторан, введите url_name правильно" : "Restaurant necunoscut, introduceți corect url_name"
        }
    }

    return {
        title: params.locale === "ru" ? `${pubData.pub.name} меню` : `${pubData.pub.name} меню`,
        description: params.locale === "ru" ? `${pubData.pub.name} ресторан. Заказть еду в молдове. Онлайн меню` : `Restaurant ${pubData.pub.name}. Comandă mâncare în Moldova. Meniu online`
    }
}

async function PubWithMenusLayout({ children, params }) {
    let data = await getPubInfo(params?.pubID);
    if (!data) {
        return (
            <div>
                <SomethingWentWrong />
            </div>
        );
    }

    const { t, resources } = await initTranslations(params.locale, ['translation']);


    return (
        <TransProvider locale={params?.locale} namespaces={['translation']} resources={resources} >
            <PubPage
                data={data}
                pub={data.pub}
                downPanelData={data}
                hasDownPanel={true}
                locale={params?.locale}
            >
                {children}
            </PubPage>
        </TransProvider>
    );
}

export default PubWithMenusLayout