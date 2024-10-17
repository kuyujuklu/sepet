import React from "react";
import { useTranslation } from "react-i18next";
import { useUploadCourierImageMutation } from "../../../api/courier/courier";
import BlackSpinner from "../../../components/loaders/BlackSpinner";
import { fixedCacheKeys } from "../../../api/fixedCacheKeys";

const CourierProfileImage = ({
  courierID,
  courierImageFileName,
  withUploadButton = true,
}) => {
  const { t } = useTranslation();

  const [uploadImage, { isLoading: uploadImageIsLoading }] =
    useUploadCourierImageMutation({
      fixedCacheKey: fixedCacheKeys.courier.update_courier_image,
    });

  const handleFileChange = (e) => {
    if (!e.target.files || e.target.files.length < 1) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    uploadImage({
      courierID: courierID,
      data: formData,
    });
  };

  return (
    <div
      style={{ zIndex: 20, width: 300, aspectRatio: 1 }}
      className="relative w-full border rounded-xl flex items-center justify-center overflow-hidden"
    >
      {courierImageFileName && (
        <img
          src={`/api-static/images/courier/${courierImageFileName}`}
          alt="dish"
          style={{
            margin: 10,
            position: "absolute",
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {withUploadButton && (
        <>
          {uploadImageIsLoading ? (
            <BlackSpinner />
          ) : (
            <div style={{ zIndex: 25 }}>
              <label
                htmlFor={`courier-image-input-${courierID}`}
                className="w-fit bg-white flex gap-2 items-center border rounded-3xl py-2 px-4 cursor-pointer bg-dark-700 text-dark-700"
              >
                <img
                  src={"/static/admin/images/svg/plus-black.svg"}
                  alt="plus"
                  width={17}
                  height={17}
                />
                <span>
                  {courierImageFileName
                    ? t("admin.images.update")
                    : t("admin.images.upload")}{" "}
                  {t("admin.images.image")}
                </span>
                <input
                  id={`courier-image-input-${courierID}`}
                  type="file"
                  onInput={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourierProfileImage;
