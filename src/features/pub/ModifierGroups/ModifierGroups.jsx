"use client";
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Button } from "@mui/material";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { ThemeContext, PubColorContext } from "../PubPage";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import WhiteSpinner from "@/components/loaders/WhiteSpinner";
import {
  useGetModifierGroupsQuery,
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
  useDeleteModifierGroupMutation,
} from "@/api/modifiers/modifiers";

const labelClassName = "text-xs sm:text-base text-gray-500 font-medium";

const emptyOption = () => ({ name: "", price_delta: 0 });

// Create/edit form - same shape for both, distinguished by whether a
// groupID was passed in.
const ModifierGroupForm = ({ companyID, pubID, groupID, initialGroup, onDone, onCancel }) => {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);

  const [name, setName] = useState(initialGroup?.name ?? "");
  const [options, setOptions] = useState(
    initialGroup?.options?.length
      ? initialGroup.options.map((o) => ({ name: o.name, price_delta: o.price_delta }))
      : [emptyOption()]
  );

  const [createGroup, { isLoading: isCreating }] = useCreateModifierGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateModifierGroupMutation();
  const isLoading = isCreating || isUpdating;

  const setOptionField = (index, field, value) => {
    setOptions((prev) =>
      prev.map((option, i) => (i === index ? { ...option, [field]: value } : option))
    );
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim() || !companyID || !pubID) return;

    const cleanOptions = options
      .filter((option) => option.name.trim())
      .map((option) => ({ name: option.name, price_delta: Number(option.price_delta) || 0 }));

    const data = { name, options: cleanOptions };

    if (groupID) {
      await updateGroup({ companyID, pubID, groupID, data });
    } else {
      await createGroup({ companyID, pubID, data });
    }

    onDone();
  };

  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-lg border"
      style={{ borderColor: themeContext.textColor }}
    >
      <InputWithLabel
        label={t("admin.modifier_groups.group_name")}
        labelClassName={labelClassName}
        labelStyle={{ marginBottom: ".1rem" }}
        value={name}
        setValue={setName}
      />

      <div className="flex flex-col gap-3">
        <span className={labelClassName}>{t("admin.modifier_groups.options")}</span>
        {options.map((option, index) => (
          <div key={index} className="flex items-end gap-2">
            <InputWithLabel
              label={t("admin.modifier_groups.option_name")}
              labelClassName={labelClassName}
              labelStyle={{ marginBottom: ".1rem" }}
              value={option.name}
              setValue={(value) => setOptionField(index, "name", value)}
              wrapperStyle={{ flexGrow: 1 }}
            />
            <InputWithLabel
              label={t("admin.modifier_groups.price_delta")}
              labelClassName={labelClassName}
              labelStyle={{ marginBottom: ".1rem" }}
              value={option.price_delta}
              setValue={(value) => setOptionField(index, "price_delta", value)}
              wrapperStyle={{ width: "90px" }}
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="text-red-500 text-sm font-medium pb-2 px-1"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOptions((prev) => [...prev, emptyOption()])}
          className="text-sm font-medium self-start"
          style={{ color: themeContext.textColor }}
        >
          + {t("admin.modifier_groups.add_option_button")}
        </button>
      </div>

      <div className="flex gap-3 justify-center mt-2">
        <Button
          variant="outlined"
          sx={{ color: themeContext.textColor, borderColor: themeContext.textColor }}
          onClick={onCancel}
        >
          {t("admin.modifier_groups.cancel_button")}
        </Button>
        <Button
          variant="contained"
          sx={{ color: "white", bgcolor: "rgb(31 41 55)", ":hover": { bgcolor: "rgb(17 24 39)" } }}
          onClick={handleSave}
        >
          {isLoading ? <WhiteSpinner /> : t("admin.modifier_groups.save_button")}
        </Button>
      </div>
    </div>
  );
};

const ModifierGroupCard = ({ group, companyID, pubID, onEdit }) => {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const [deleteGroup, { isLoading }] = useDeleteModifierGroupMutation();

  const handleDelete = () => {
    if (!window.confirm(t("admin.modifier_groups.delete_confirm"))) return;
    deleteGroup({ companyID, pubID, groupID: group.id });
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg border" style={{ borderColor: themeContext.textColor }}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{group.name}</span>
        <div className="flex gap-3">
          <button type="button" onClick={onEdit} className="text-sm font-medium" style={{ color: themeContext.textColor }}>
            {t("admin.modifier_groups.edit_button")}
          </button>
          <button type="button" onClick={handleDelete} disabled={isLoading} className="text-sm font-medium text-red-500">
            {t("admin.modifier_groups.delete_button")}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.options.map((option) => (
          <span
            key={option.id}
            className="text-xs px-2 py-1 rounded-full border"
            style={{ borderColor: themeContext.textColor }}
          >
            {option.name}
            {option.price_delta !== 0 &&
              ` (${option.price_delta > 0 ? "+" : ""}${option.price_delta})`}
          </span>
        ))}
        {group.options.length === 0 && (
          <span className="text-xs text-gray-500">{t("admin.modifier_groups.no_options")}</span>
        )}
      </div>
    </div>
  );
};

const ModifierGroups = () => {
  const { t } = useTranslation();
  const pubID = useSelector(selectPubID);
  const companyID = useSelector(selectCompanyID);
  const themeContext = useContext(ThemeContext);
  const pubColor = useContext(PubColorContext);

  const { data } = useGetModifierGroupsQuery(
    { companyID, pubID },
    { skip: !companyID || !pubID }
  );
  const groups = data?.modifier_groups ?? [];

  const [creating, setCreating] = useState(false);
  const [editingGroupID, setEditingGroupID] = useState(null);

  return (
    <div style={{ color: themeContext.textColor }}>
      <NavLink
        to={`/admin/pub/${pubID}/edit_menu`}
        className="text-xs sm:text-sm font-medium underline"
        style={{ color: themeContext.textColor }}
      >
        {t("admin.modifier_groups.back_link")}
      </NavLink>
      <h1 className="font-bold text-xl mb-1 mt-3">{t("admin.modifier_groups.headline")}</h1>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">
        {t("admin.modifier_groups.description")}
      </p>

      {!creating && editingGroupID === null && (
        <div className="text-center mb-4">
          <Button
            variant="contained"
            sx={{
              color: themeContext.textColor,
              bgcolor: "transparent",
              fontSize: ".7rem",
              fontWeight: "medium",
              padding: ".7rem 1rem",
              border: "1px solid " + themeContext.textColor,
              borderRadius: "10px",
              width: "100%",
              ":hover": {
                color: themeContext.bgColor,
                border: "1px solid " + pubColor,
                bgcolor: pubColor,
              },
            }}
            onClick={() => setCreating(true)}
          >
            {t("admin.modifier_groups.add_group_button")}
          </Button>
        </div>
      )}

      {creating && (
        <div className="mb-4">
          <ModifierGroupForm
            companyID={companyID}
            pubID={pubID}
            onDone={() => setCreating(false)}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {groups.map((group) =>
          editingGroupID === group.id ? (
            <ModifierGroupForm
              key={group.id}
              companyID={companyID}
              pubID={pubID}
              groupID={group.id}
              initialGroup={group}
              onDone={() => setEditingGroupID(null)}
              onCancel={() => setEditingGroupID(null)}
            />
          ) : (
            <ModifierGroupCard
              key={group.id}
              group={group}
              companyID={companyID}
              pubID={pubID}
              onEdit={() => setEditingGroupID(group.id)}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ModifierGroups;
