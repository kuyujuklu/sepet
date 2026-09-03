import { useEffect } from "react";

const BRAND = "Sepet Admin";

// Sets the browser tab title to "Sepet Admin - <title>" while the calling
// page is mounted, and restores the previous title on unmount so navigating
// away (e.g. back to a parent route that sets its own title) doesn't leave
// a stale one behind. Pass a falsy title to show the bare brand name.
const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${BRAND} - ${title}` : BRAND;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default usePageTitle;
