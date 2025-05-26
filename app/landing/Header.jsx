import SwitchLang from "./SwitchLang";

const Header = ({ lang }) => {
  return (
    <div>

      {/* <!-- Navbar goes here --> */}
      <nav style={{backgroundColor: 'rgb(255 255 255 / 27%)'}} className=" shadow-lg rounded-b-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex ">
              
                {/* <!-- Website Logo --> */}
                <a href="#" className="flex-row md:flex justify-items-center items-center py-4 px-2">                  
                    <img src="images/png/bird.png" width={30} height={30}></img>
                    <span className="font-semibold text-gray-500 text-lg">sepet.md</span>
                </a>
            </div>
            <div className="p-4 text-xs sm:text-base self-center">Все на расстоянии одного клика</div>
            <div className=" flex items-center">
              <a href="https://onelink.to/ey3df3" className="p-2 m-1 sm:p-4 sm:m-2 bg-cyan-400 text-xs sm:text-base rounded-xl text-white">
                Скачать Sepet</a>
            
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
