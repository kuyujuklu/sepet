import SomethingWentWrong from "@/app/shared-components/Errors/SomethingWentWrong";
import { getPubInfo } from "../api/pub";
import PubPage from "../components/PubPage/PubPage";
import initTranslations from "@/app/i18n";
import TransProvider from "../components/TransProvider";

export async function generateMetadata({ params }) {
  const pubID = params.pubID;
  let pubData = await getPubInfo(pubID);
  if (!pubData) {
    return {
      title: params.locale === "ru" ? "Неизвестное заведение" : "Restaurant necunoscut",
      description: params.locale === "ru" ? "Неизвестный ресторан, введите url_name правильно" : "Restaurant necunoscut, introduceți corect url_name"
    }
  }

  const title = params.locale === "ru" ? `${pubData.pub.name} меню` : `Meniu ${pubData.pub.name}`;
  const description = params.locale === "ru"
    ? `${pubData.pub.name} ресторан. Заказть еду в молдове. Онлайн меню`
    : `Restaurant ${pubData.pub.name}. Comandă mâncare în Moldova. Meniu online`;

  // The pub's own cover photo, so a shared pub link (the main way these
  // spread - WhatsApp, Instagram) unfurls with that place's actual food
  // instead of the generic site banner every other page falls back to.
  const images = pubData.pub.bg_image_file_name
    ? [{ url: `/api-static/images/pubs/bgs/${pubData.pub.bg_image_file_name}`, alt: pubData.pub.name }]
    : undefined;

  return {
    title,
    description,
    openGraph: { title, description, images, type: "website" },
    twitter: { card: "summary_large_image", title, description, images },
  }
}

async function PubWithMenusLayout({ children, params }) {
  let data = await getPubInfo(params?.pubID);
  if (!data) {
    console.log("NOOOOOO DATAAAA")

    return (
      <div>
        <SomethingWentWrong />
      </div>
    );
  }

  const { resources } = await initTranslations(params.locale, ['translation']);


  return (
    <TransProvider locale={params?.locale} namespaces={['translation']} resources={resources} >
      <PubPage
        pubName={params?.pubID}
        data={data}
        pub={data.pub}
        locale={params?.locale}
      >
        {children}
      </PubPage>
    </TransProvider>
  );
}

export default PubWithMenusLayout
