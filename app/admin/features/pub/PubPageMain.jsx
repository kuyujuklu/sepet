import React, { useContext } from 'react'
import { ThemeContext } from './PubPage';
import MenuList from './Menus/MenuList';

const PubPageMain = () => {
  const themeContext = useContext(ThemeContext);
    
  return (
    <div 
        className='py-4'
        style={{
            color: themeContext.textColor,
        }}
    >
        <MenuList />
    </div>
  )
}

export default PubPageMain