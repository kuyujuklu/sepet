import { useEffect } from "react";
import Menu from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import CreateMenuButton from "./CreateMenuButton";
import { useGetMenusQuery } from "@/app/admin/api/menu/menu";
import { selectCompanyID } from "../../company/companySlice";
import { selectPubID } from "../pubSlice";
import { selectMenuID, setMenuID } from "./menuSlice";

const MenuList = () => {
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);
    const selectedMenuID = useSelector(selectMenuID);

    const {
        data: menuData,
        error,
    } = useGetMenusQuery({ pubID, companyID });

    useEffect(() => {
        //TODO: handle error
    }, [error]);

    useEffect(() => {
        if(!menuData?.menus || menuData?.menus?.length === 0) {
            return
        }

        //checing if there is selected menu and it exists
        if(selectedMenuID && menuData.menus.find(menu => menu.id === selectedMenuID)) {
            return
        }

        dispatch(setMenuID(menuData.menus.toSorted((a, b) => a.place - b.place)[0].id))
    }, [dispatch, menuData, selectedMenuID])

    return (
        <div className="flex flex-wrap gap-6">
            {menuData?.menus?.toSorted((a, b) => a.place - b.place).map((menu) => (
                <div key={menu.id} className="flex gap-6">
                    <CreateMenuButton place={menu.place} />
                    <Menu key={menu.id} menu={menu} />
                </div>
            ))}
            <CreateMenuButton place={menuData?.menus?.length + 1} />
        </div>
    );
};

export default MenuList;
