import { FlatList, View } from "native-base";
import { useEffect, useMemo, useRef } from "react";
import MenuItem from "./MenuItem";
import { Pressable, SafeAreaView } from "react-native";

const MenuList = ({ menus, selectedMenu, selectMenu }) => {
  const filteredMenus = useMemo(() => {
    let filteredMenus = menus?.filter((menu) => menu.visible === true);
    filteredMenus.sort((a, b) => a.place - b.place);
    return filteredMenus;
  }, [menus]);

  // if there is no selected menu, select the first one
  useEffect(() => {
      if(!filteredMenus) return;
      if(filteredMenus.length === 0) return;
      if(selectedMenu) return;

      selectMenu(filteredMenus[0].id);
  }, [filteredMenus, selectedMenu])

  const flatListRef = useRef(null);


  // scroll to selected menu
  useEffect(() => {
    if(!selectedMenu) return;

    const index = filteredMenus.findIndex((menu) => menu.id === selectedMenu);
    if(index === -1) return;

    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5});
    });
  }, [selectedMenu])

  return (
    <SafeAreaView style={{ paddingLeft: 10 }} edges={[]}>
      <FlatList
        ref={flatListRef}
        initialScrollIndex={0}
        initialNumToRender={menus?.length ?? 0}
        renderItem={({ item: menu }) => (
          <Pressable onPress={() => selectMenu(menu?.id)}>
            <MenuItem
              isSelected={selectedMenu === menu?.id}
              key={menu?.id}
              menu={menu}
            />
          </Pressable>
        )}
        data={filteredMenus}
        horizontal
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
      />
    </SafeAreaView>
  );
};

export default MenuList;
