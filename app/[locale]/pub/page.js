import { redirect } from "next/navigation";

// /{locale}/pub with no pubID isn't a real screen - it rendered a blank div.
// Not linked from anywhere in the app, but a stray/truncated URL should
// still land somewhere real instead of a blank page.
const Page = () => {
  redirect("/");
};

export default Page;
