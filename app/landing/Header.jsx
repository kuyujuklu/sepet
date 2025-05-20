import SwitchLang from "./SwitchLang";

const Header = ({ lang }) => {
  return (
    <div>

      {/* <!-- Navbar goes here --> */}
      <nav className="bg-white shadow-lg rounded-b-xl">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <div>
                {/* <!-- Website Logo --> */}
                <a
                  href="#"
                  className="flex items-center py-4 px-2"
                >
                  {/* <!-- <img alt=""src="logo.png" alt="Logo" className="h-8 w-8 mr-2"> --> */}
                  <span className="font-semibold text-gray-500 text-lg">
                    Sandex Terminal
                                    </span>
                </a>
              </div>
              {/* <!-- Primary Navbar items --> */}
            </div>
            {/* <!-- Secondary Navbar items --> */}
            <div className=" flex items-center space-x-3">
              <SwitchLang lang={lang} />
              <a
                href="/admin/company"
                id="openSignUp-1"
                className=" py-2 px-2 font-medium text-gray-500 rounded-xl hover:bg-blue-500 hover:text-white
                    transition duration-300 "
              >
                Log In
                            </a>
              <a
                href="/admin/auth/registration"
                id="openSignUp-02"
                className="  py-2 px-2 font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-400 transition
                    duration-300"
              >
                Sign Up
                            </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
