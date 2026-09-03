import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon } from "./icons";

// Restyled text field for the auth pages only - same validate-on-submit,
// then-live logic as components/Inputs/Input.jsx, kept as a separate
// component rather than reskinning that one globally since it's still used
// as-is elsewhere (AddDishToOrderPopup, DeleteClientAccount).
const AuthField = ({
  label,
  icon: Icon,
  type = "text",
  value,
  setValue,
  validators,
  validationDependencies,
  name,
  autoComplete,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  const depsStr = JSON.stringify(validationDependencies);

  useEffect(() => {
    let deps;
    try {
      deps = JSON.parse(depsStr);
    } catch (e) {
      return;
    }
    if (!deps) return;
    if (!deps.requireValidation) return;
    if (!validators || validators.length === 0) return;

    for (const validator of validators) {
      const err = validator(value);
      if (err) {
        setError(err);
        return;
      }
    }
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsStr, validators]);

  const handleChange = (e) => {
    const next = e.target.value;
    if (!validators || validators.length === 0) {
      setError("");
      setValue(next);
      return;
    }
    for (const validator of validators) {
      const err = validator(next);
      if (err) {
        setValue(next);
        setError(err);
        return;
      }
    }
    setValue(next);
    setError("");
  };

  return (
    <div>
      {label && <div className="text-[13px] font-medium text-ink mb-1.5">{label}</div>}
      <div
        className="flex items-center rounded-xl"
        style={{
          border: `1.5px solid ${error ? "#e0483a" : "#e4e9ee"}`,
          background: "#fff",
          height: 46,
          paddingLeft: 14,
          paddingRight: isPassword ? 6 : 14,
        }}
      >
        {Icon && <Icon className="flex-shrink-0 text-muted-2" style={{ marginRight: 10 }} />}
        <input
          type={isPassword && revealed ? "text" : type}
          name={name}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="flex-grow min-w-0 bg-transparent outline-none text-[14.5px] text-ink placeholder:text-muted-2"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="flex-shrink-0 flex items-center justify-center text-muted-2 hover:text-muted"
            style={{ width: 36, height: 36 }}
            tabIndex={-1}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <div className="text-[12px] mt-1.5" style={{ color: "#e0483a" }}>
          {t(error)}
        </div>
      )}
    </div>
  );
};

export default AuthField;
