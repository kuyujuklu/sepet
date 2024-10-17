import React from 'react'
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import SwitchLang from '../company/SwitchLang';
import LogoutButton from '../company/LogoutButton';

const CourierHeader = ({courierID, courierName}) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate()

  return (
    
                    <nav className="bg-white shadow-lg mb-8 rounded-xl pb-2 sm:pb-0">
                        <div className="max-w-6xl mx-auto px-4">

                            <div className="flex flex-col sm:flex-row items-center justify-between">

                                <div className="flex space-x-7">
                                    <div className="pb-2 px-2">
                                        <h1 className="text-2xl flex justify-center items-center gap-5 text-gray-800 mt-4">
                                            <NavLink to="/courier/profile">
                                                <div style={{ width: 35, height: 35 }}>
                                                    <img src="/static/admin/images/svg/home-black.svg" alt="lkajsdf" />
                                                </div>
                                            </NavLink>
                                            <div>
                                                <span className="font-bold">{courierName || "No name"} - ID {courierID}</span>{" "}
                                            </div>
                                        </h1>
                                    </div>
                                </div>

                                <div className=" flex justify-start space-x-3">
                                    <div className="w-fit flex justify-start items-center gap-4">
                                        <SwitchLang />
                                        <LogoutButton />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </nav>
    );
};

export default CourierHeader
