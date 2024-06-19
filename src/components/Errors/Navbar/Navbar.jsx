import LogoutButton from "../../../features/company/LogoutButton"
import SwitchLang from "../../../features/company/SwitchLang"

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg mb-8 rounded-xl">
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
                    <div className="w-fit m-auto flex items-start gap-4 justify-center">
                        <SwitchLang />
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navbar