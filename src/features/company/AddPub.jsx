"use client"
import { useGetCompanyQuery } from "../../api/company/company"
import { useDispatch } from "react-redux";
import { openCreatePubPopup } from "../pub/pubSlice";

const AddPub = () => {
  const dispatch = useDispatch();
  const {data} = useGetCompanyQuery()


  const handleClick = () => {
    if(!data?.company?.id)
      return

    dispatch(openCreatePubPopup(data.company.id));
  }

  return (
    <div
        onClick={handleClick}
        style={{
            minHeight: "220px",
            width: "100%",
            maxWidth: "200px",
            transition: "all .2s ease-in-out",
        }}
        className="border p-6 rounded-lg shadow-xl hover:shadow-2xl cursor-pointer flex justify-center items-center"
    >
        <img src="/static/admin/images/svg/plus-in-circle-black.svg" alt="add" width={60} height={60} />
    </div>
  )
}

export default AddPub