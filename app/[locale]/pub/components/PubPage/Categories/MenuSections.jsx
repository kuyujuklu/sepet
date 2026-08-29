"use client";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext } from "../ThemeContextProvider";
import DishesList from "../Dishes/DishesList";

const ACCENT = "#2D7DD2";

// Replaces the old category-tile grid (each tile a full route navigation to
// its own dishes screen) and, before that, a since-scrapped accordion
// (rejected for reading like a forum FAQ). This is the Wolt/Glovo pattern
// instead: a sticky row of category pills that jump-scroll to a section,
// and every dish always visible in one continuous list underneath - no
// route hop, nothing to expand/collapse.
//
// The menu-name pill row is gone entirely now (client asked for it removed
// unconditionally), so there's no per-menu switching left in the UI - a pub
// with several real Menu records (e.g. a separate "Напитки" menu) would
// otherwise lose all of that menu's categories. Instead every visible
// category from every visible menu is shown together, ordered by each
// menu's own place first, then the category's place within it - so it
// still reads as "food menu's categories, then drinks menu's categories"
// rather than an interleaved jumble.
const MenuSections = ({ menus, categories, dishes, pub }) => {
  const themeContext = useContext(ThemeContext);
  const sectionRefs = useRef({});
  const pillRefs = useRef({});
  const [activeCategoryID, setActiveCategoryID] = useState(null);

  const shownCategories = useMemo(() => {
    if (!categories) return [];

    const menuPlace = {};
    (menus ?? []).forEach((menu) => {
      if (menu.visible) menuPlace[menu.id] = menu.place;
    });

    return categories
      .filter((category) => category.visible && category.menu_id in menuPlace)
      .sort((a, b) => {
        const menuDiff = menuPlace[a.menu_id] - menuPlace[b.menu_id];
        return menuDiff !== 0 ? menuDiff : a.place - b.place;
      });
  }, [categories, menus]);

  // `data` (and so `categories`/`menus`) gets a fresh object/array reference
  // from redux on every re-fetch - a ref keeps the scroll handler below
  // reading the current list without needing to tear down and re-attach the
  // listener every time that happens (see next effect).
  const shownCategoriesRef = useRef(shownCategories);
  shownCategoriesRef.current = shownCategories;

  useEffect(() => {
    if (shownCategories.length === 0) return;
    setActiveCategoryID((current) =>
      shownCategories.some((c) => c.id === current) ? current : shownCategories[0].id
    );
  }, [shownCategories]);

  // Highlights whichever section is currently scrolled to the top of the
  // viewport, so the pill nav tracks scrolling the same way it does in
  // Wolt/Glovo - not just on an explicit pill click. Measures section
  // positions directly on scroll rather than via IntersectionObserver's
  // `entries` payload - that only reports elements whose intersection state
  // just flipped, not every currently-intersecting element, so a fast or
  // long scroll can skip straight past a section without ever reporting it
  // and the active pill gets stuck on a stale category.
  //
  // Keyed on the category COUNT rather than the `shownCategories` array
  // itself: that array gets a new reference on every redux data refresh
  // (polling, re-fetches) even when the actual categories haven't changed,
  // which was tearing this listener down and re-attaching it constantly -
  // during that churn, scroll events could be missed entirely and the
  // active pill would get stuck.
  useEffect(() => {
    if (shownCategoriesRef.current.length === 0) return;

    const THRESHOLD = 100;

    // A handful of categories (rarely more than a couple dozen) and one
    // cheap getBoundingClientRect() each - running this straight on every
    // scroll event is fine, no rAF-throttling needed.
    const updateActive = () => {
      const cats = shownCategoriesRef.current;
      if (cats.length === 0) return;

      let current = cats[0].id;
      for (const category of cats) {
        const el = sectionRefs.current[category.id];
        if (el && el.getBoundingClientRect().top <= THRESHOLD) {
          current = category.id;
        }
      }
      setActiveCategoryID(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [shownCategories.length]);

  // The pill row scrolls horizontally too - without this, scrolling the
  // dish feed could make a later category active while its pill sits
  // off-screen to the right, with no visible indication of what's active.
  useEffect(() => {
    if (activeCategoryID == null) return;
    pillRefs.current[activeCategoryID]?.scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
  }, [activeCategoryID]);

  const scrollToCategory = (categoryID) => {
    setActiveCategoryID(categoryID);
    sectionRefs.current[categoryID]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (shownCategories.length === 0) return null;

  return (
    <div>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: themeContext.bgColor,
          padding: "10px 0",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          borderBottom: "1px solid #f1f3f5",
        }}
      >
        {shownCategories.map((category) => {
          const active = category.id === activeCategoryID;
          return (
            <button
              key={category.id}
              ref={(el) => (pillRefs.current[category.id] = el)}
              onClick={() => scrollToCategory(category.id)}
              style={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                border: "none",
                borderRadius: 999,
                padding: "8px 15px",
                fontSize: 13,
                fontWeight: active ? 700 : 600,
                background: active ? ACCENT : "#f1f3f5",
                color: active ? "#fff" : "#526070",
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 16 }}>
        {shownCategories.map((category, index) => (
          <div
            key={category.id}
            ref={(el) => (sectionRefs.current[category.id] = el)}
            data-category-id={category.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              scrollMarginTop: 60,
              paddingTop: index === 0 ? 0 : 20,
              borderTop: index === 0 ? "none" : "1px solid #f1f3f5",
            }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 700, color: themeContext.textColor, margin: 0 }}>
              {category.name}
            </h2>
            <DishesList pub={pub} dishes={dishes} categoryID={category.id} currencyID={pub?.currency_id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSections;
