"use client"

import { useEffect } from "react"
import { useGetCompanyQuery } from "../../api/company/company"
import { useDispatch } from "react-redux"
import { requireAuthentication } from "../auth/authSlice"
import CompanyUpper from "./CompanyUpper"
import CompanyPubs from "./CompanyPubs"
import { appErrors } from "../../errors/errors"
import SwitchLang from "./SwitchLang"

const CompanyPage = () => {
  const dispatch = useDispatch()
  const {data, error} = useGetCompanyQuery({}, {refetchOnMountOrArgChange: true})

  useEffect(() => {
    console.log("this is test log")
    if (error && error.text === appErrors.unauthorized) {
        dispatch(requireAuthentication())
    }
  }, [dispatch, error])

  return (
    <div className="pb-20">
      <SwitchLang />
      <CompanyUpper />
      <CompanyPubs companyID={data?.company?.id}/>
    </div>
  )
}

export default CompanyPage