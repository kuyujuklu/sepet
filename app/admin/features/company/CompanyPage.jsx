'use client'

import { useEffect } from "react"
import { useGetCompanyQuery } from "../../api/company/company"
import { useDispatch } from "react-redux"
import { setAuthenticated } from "../auth/authSlice"
import CompanyUpper from "./CompanyUpper"
import CompanyPubs from "./CompanyPubs"

const CompanyPage = () => {
  const dispatch = useDispatch()
  const {data, error} = useGetCompanyQuery({}, {refetchOnMountOrArgChange: true})

  useEffect(() => {
    if(error) {
      dispatch(setAuthenticated(false))
    }
  }, [dispatch, error])

  return (
    <div className="pb-20">
      <CompanyUpper />
      <CompanyPubs companyID={data?.company?.id}/>
    </div>
  )
}

export default CompanyPage