import React, { useEffect } from "react";
import MenuList from "./MenuList";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";

const MenuListForPub = ({ pubID, selectedMenu, selectMenu }) => {
  const {
    data: pubData,
    error: pubError,
    pubIsLoading,
  } = useGetPubInfoQuery({ pubID }, { skip: !pubID });

  useEffect(() => {
    if(pubData) console.log("pubData in menu list for pub list: ", pubData?.menus);
  }, [pubData])

  useEffect(() => {
    if (pubError) console.log("pubError in categories list: ", pubError);
  }, [pubError]);

  return (
    <MenuList
      selectedMenu={selectedMenu}
      selectMenu={(menuID) => selectMenu(menuID)}
      menus={pubData?.menus || []}
    />
  );
};

export default MenuListForPub;
