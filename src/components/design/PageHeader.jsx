import { useNavigate } from "react-router-dom";

// Shared secondary-page header - back chevron + title (+ optional subtitle
// and a right-side slot for a status pill etc.) - matches the Main/
// PubSettingsMobile canvas mockups' header convention, reused across every
// screen one level below Home (Orders, order detail, Settings, Shipping,
// the pub picker) instead of each page inventing its own back affordance.
const PageHeader = ({ title, subtitle, onBack, backTo, right, className = "" }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) return onBack();
        if (backTo) return navigate(backTo);
        navigate(-1);
    };

    return (
        <div
            className={`flex items-center bg-white rounded-2xl ${className}`}
            style={{
                gap: 12,
                border: "1px solid #e4e9ee",
                boxShadow: "0 1px 2px rgba(20,30,45,.04)",
                padding: "14px 18px",
            }}
        >
            <button
                type="button"
                onClick={handleBack}
                aria-label="back"
                style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, display: "flex" }}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c2733" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#1c2733" }} className="truncate">
                    {title}
                </div>
                {subtitle && (
                    <div className="num" style={{ fontSize: 12.5, color: "#526070" }}>
                        {subtitle}
                    </div>
                )}
            </div>
            {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </div>
    );
};

export default PageHeader;
