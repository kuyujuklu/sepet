import React, { useEffect } from "react";
import MenuList from "./MenuList";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";

const MenuListForPub = ({ menus, selectedMenu, selectMenu }) => {
  
  return (
    <MenuList
      selectedMenu={selectedMenu}
      selectMenu={(menuID) => selectMenu(menuID)}
      menus={menus || []}
    />
  );
};

export default MenuListForPub;
