// Logo lockup shown above the auth card. Was rendering an `<image>` tag
// (an SVG element, invalid in plain HTML) instead of `<img>`, so the logo
// silently never painted - fixed as part of restyling this to the ink/muted
// token set the rest of the admin panel now uses.
const Header = () => {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/static/admin/images/png/qr-logo-512x512.png"
        width={40}
        height={40}
        alt="Sepet Admin"
        className="rounded-xl flex-shrink-0"
      />
      <span className="text-[19px] font-bold text-ink">Sepet Admin</span>
    </div>
  );
};

export default Header;
