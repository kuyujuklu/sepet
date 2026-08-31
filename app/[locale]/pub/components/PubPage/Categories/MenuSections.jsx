"use client";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext } from "../ThemeContextProvider";
import DishesList from "../Dishes/DishesList";

const ACCENT = "#2D7DD2";
const HITS_SECTION_ID = "hits-and-sales";
const MAX_HITS = 5;
const SCROLL_OFFSET = 60;
const SCROLL_DURATION = 450;

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
  const pillRowRef = useRef(null);
  const [activeSectionID, setActiveSectionID] = useState(null);

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

  // A pub-specific version of the home page's "Хиты продаж". "Hit" here
  // means actually ordered a lot (orders_count), not the is_hit flag - that
  // flag is set by hand elsewhere and isn't necessarily true popularity.
  // "Discount" means an active one is really on the dish (a real sale_price
  // under price, the strikethrough the client sees), not a hunch. Ranked by
  // orders_count so real bestsellers lead; a real discount qualifies a dish
  // for the section even at zero orders, so a new promo isn't buried under
  // unrelated bestsellers.
  const featuredDishes = useMemo(() => {
    if (!dishes) return [];

    const hasRealDiscount = (dish) => !!dish.sale_price && dish.sale_price > 0 && dish.sale_price < dish.price;
    const isRealHit = (dish) => (dish.orders_count ?? 0) > 0;

    return dishes
      .filter((dish) => dish.visible && dish.available !== false)
      .filter((dish) => isRealHit(dish) || hasRealDiscount(dish))
      .slice()
      .sort((a, b) => (b.orders_count ?? 0) - (a.orders_count ?? 0))
      .slice(0, MAX_HITS);
  }, [dishes]);

  const hitsDishIDs = useMemo(() => featuredDishes.map((dish) => dish.id), [featuredDishes]);

  // The "ХИТ" badge shown wherever a dish appears - only the ones that
  // actually earned their spot by real orders, not the ones that only made
  // the featured section via a discount (that already shows for itself, as
  // the struck-through price - it doesn't need "ХИТ" on top of it too).
  const hitBadgeDishIDs = useMemo(
    () => new Set(featuredDishes.filter((dish) => (dish.orders_count ?? 0) > 0).map((dish) => dish.id)),
    [featuredDishes]
  );

  // The pill row and the section list both iterate this - a synthetic
  // first entry for the hits section (when there's anything to put in it),
  // followed by every real category. `dishIDs` on the hits entry is what
  // tells the render loop below to pass DishesList a pre-picked list
  // instead of a categoryID to filter by.
  const sections = useMemo(() => {
    const real = shownCategories.map((category) => ({ id: category.id, name: category.name, categoryID: category.id, dishIDs: null }));
    if (hitsDishIDs.length === 0) return real;
    return [{ id: HITS_SECTION_ID, name: "Хиты и скидки", categoryID: null, dishIDs: hitsDishIDs }, ...real];
  }, [shownCategories, hitsDishIDs]);

  // `data` (and so `categories`/`menus`/`dishes`) gets a fresh object/array
  // reference from redux on every re-fetch - a ref keeps the scroll handler
  // below reading the current list without needing to tear down and
  // re-attach the listener every time that happens (see next effect).
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  // A programmatic scroll (from clicking a pill) fires the same window
  // scroll events an organic scroll does. Without this flag, the scroll
  // listener below was fighting the click: it kept recomputing "current
  // section" against the feed's mid-animation, transiently-wrong geometry,
  // flipping the active pill back and forth (the reported "дёргается") and,
  // since the active pill auto-centers itself in the row (further down),
  // shifting the row under the client's finger right as they tried to tap
  // a different pill - reading as a tap that missed or needed a second try.
  //
  // Driven by hand with rAF/window.scrollTo rather than
  // scrollIntoView({behavior:"smooth"}) - iOS Safari reportedly stalls that
  // animation mid-flight and sometimes ignores it on tap entirely, and
  // either way there's no reliable "it's done" callback from it, which is
  // exactly what this flag needs to clear at the right time instead of
  // guessing with a timeout.
  const isProgrammaticScrollRef = useRef(false);
  const scrollTokenRef = useRef(0);

  useEffect(() => {
    if (sections.length === 0) return;
    setActiveSectionID((current) =>
      sections.some((s) => s.id === current) ? current : sections[0].id
    );
  }, [sections]);

  // Highlights whichever section is currently scrolled to the top of the
  // viewport, so the pill nav tracks scrolling the same way it does in
  // Wolt/Glovo - not just on an explicit pill click. Measures section
  // positions directly on scroll rather than via IntersectionObserver's
  // `entries` payload - that only reports elements whose intersection state
  // just flipped, not every currently-intersecting element, so a fast or
  // long scroll can skip straight past a section without ever reporting it
  // and the active pill gets stuck on a stale category.
  //
  // Keyed on the section COUNT rather than the `sections` array itself:
  // that array gets a new reference on every redux data refresh (polling,
  // re-fetches) even when the actual categories haven't changed, which was
  // tearing this listener down and re-attaching it constantly - during that
  // churn, scroll events could be missed entirely and the active pill would
  // get stuck.
  useEffect(() => {
    if (sectionsRef.current.length === 0) return;

    const THRESHOLD = 100;

    // A handful of sections (rarely more than a couple dozen) and one cheap
    // getBoundingClientRect() each - running this straight on every scroll
    // event is fine, no rAF-throttling needed.
    const updateActive = () => {
      if (isProgrammaticScrollRef.current) return;

      const list = sectionsRef.current;
      if (list.length === 0) return;

      let current = list[0].id;
      for (const section of list) {
        const el = sectionRefs.current[section.id];
        if (el && el.getBoundingClientRect().top <= THRESHOLD) {
          current = section.id;
        }
      }
      setActiveSectionID(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [sections.length]);

  // The pill row scrolls horizontally too - without this, scrolling the
  // dish feed could make a later section active while its pill sits
  // off-screen to the right, with no visible indication of what's active.
  //
  // A plain scrollLeft write, not scrollIntoView - on iOS Safari,
  // scrollIntoView (even "instant") firing on every organic-scroll-driven
  // category change reportedly stalls the page's own vertical touch-scroll
  // gesture right as it fires, which is the "magnetizes, then the category
  // switches" feeling. Assigning scrollLeft directly is a plain property
  // write, not a scroll gesture of its own, so there's nothing for Safari
  // to arbitrate against the finger still on the glass.
  useEffect(() => {
    if (activeSectionID == null) return;
    const pillEl = pillRefs.current[activeSectionID];
    const containerEl = pillRowRef.current;
    if (!pillEl || !containerEl) return;

    const targetScrollLeft = pillEl.offsetLeft - (containerEl.clientWidth - pillEl.offsetWidth) / 2;
    containerEl.scrollLeft = Math.max(0, targetScrollLeft);
  }, [activeSectionID]);

  const scrollToSection = (sectionID) => {
    setActiveSectionID(sectionID);

    const el = sectionRefs.current[sectionID];
    if (!el) return;

    // A newer click invalidates any animation already in flight - its own
    // step() checks this same token and just stops scheduling itself once
    // it no longer matches, so the two never fight over window.scrollTo.
    const token = ++scrollTokenRef.current;
    isProgrammaticScrollRef.current = true;

    const startY = window.scrollY;
    const targetY = Math.max(0, el.getBoundingClientRect().top + startY - SCROLL_OFFSET);
    const distance = targetY - startY;
    const startTime = performance.now();

    const step = (now) => {
      if (scrollTokenRef.current !== token) return;

      const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        isProgrammaticScrollRef.current = false;
      }
    };

    requestAnimationFrame(step);
  };

  if (sections.length === 0) return null;

  return (
    <div>
      <div
        ref={pillRowRef}
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
          // iOS Safari has a known stutter where a sticky element's own
          // repaint briefly stalls the page's momentum scroll right as it
          // sticks - promoting it to its own compositor layer is the usual
          // workaround.
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
      >
        {sections.map((section) => {
          const active = section.id === activeSectionID;
          return (
            <button
              key={section.id}
              ref={(el) => (pillRefs.current[section.id] = el)}
              onClick={() => scrollToSection(section.id)}
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
              {section.id === HITS_SECTION_ID ? `★ ${section.name}` : section.name}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingTop: 16 }}>
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={(el) => (sectionRefs.current[section.id] = el)}
            data-section-id={section.id}
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
              {section.name}
            </h2>
            <DishesList pub={pub} dishes={dishes} categoryID={section.categoryID} dishIDs={section.dishIDs} hitBadgeDishIDs={hitBadgeDishIDs} currencyID={pub?.currency_id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSections;
