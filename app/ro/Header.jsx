import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <div>
            {/* <header className="hidden lg:flex m-auto mt-4 p-2  justify-between max-w-6xl">
    <div className="logo-nav_item md:flex">
        <a href="./index.html" className="mr-8 p-2 text-xl font-semibold">Sandex</a>
        <div className="nav-bar md:flex p-2 text-[#7F7F7F]">
            <a href="./index.html" className="m-2 mb-12 block nav-link text-2xl text-blue-500">Home</a>
            <a href="pricing.html" className="m-2 mb-12 block nav-link text-2xl">Pricing</a>
            <a href="about.html" className="m-2 mb-12 block nav-link text-2xl">About us</a>
            <a href="#" className="m-2 mb-12 block nav-link text-2xl">Contact
                <span className=" relative text-xs -left-6 -top-4 border text-red-500">coming</span>
            </a>
            <a href="#" className="m-2 mb-12 block nav-link text-2xl">Portfolio
                <span className=" relative text-xs -left-6 -top-4 border text-red-500">coming</span>
            </a>
        </div>
    </div>
    <div className=" mt-10 md:mt-0 auth md:flex">
        <span className="mr-4 p-2">
            <a href="#" id="openSignUp-1">Log in
                <span className=" relative text-xs -left-6 -top-4 border text-red-500">coming</span>
            </a>
        </span>
        <span className="openSignUp mr-4 p-3 rounded-xl text-white bg-blue-500 font-semibold ">
            <a href="#" id="openSignUp-02">Sign Up</a>
        </span>
    </div>
</header> */}



{/* <!-- <header id="burgerMenu" className="burgerMenu lg:hidden z-30 bg-[#ededed] m-auto mt-0 p-2 fixed top-0 left-0 w-full">
    <div className="logo-sign-toggle flex justify-between items-center">
        <a href="./index.html" className="mr-4 p-2 text-xl font-semibold">Sandex</a>
        <span>
            <a href="#" id="openSignUp-1" className="mr-1 p-2">Log in</a>
            <a href="#" id="openSignUp-02"
                className="openSignUp mr-1 p-3 rounded-xl text-white bg-blue-500 font-semibold ">Sign Up</a>
        </span>
        <button id="toggleBtn" className="toggleBtn p-2 px-4 border-2 rounded-xl border-black font-bold text-xl">=</button>
    </div>

</header> --> */}

{/* <!-- Navbar goes here --> */}
<nav className="bg-white shadow-lg">
    <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
            <div className="flex space-x-7">
                <div>
                    {/* <!-- Website Logo --> */}
                    <a href="#" className="flex items-center py-4 px-2">
                        {/* <!-- <img alt=""src="logo.png" alt="Logo" className="h-8 w-8 mr-2"> --> */}
                        <span className="font-semibold text-gray-500 text-lg">Sandex Terminal</span>
                    </a>
                </div>
                {/* <!-- Primary Navbar items --> */}
            
            </div>
            {/* <!-- Secondary Navbar items --> */}
            <div className=" flex items-center space-x-3">
                <a href="https://qrmenu.sandex.md/admin/auth/authentication" id="openSignUp-1" className=" py-2 px-2 font-medium text-gray-500 rounded-xl hover:bg-blue-500 hover:text-white
                    transition duration-300 ">Log
                    In</a>
                <a href="https://qrmenu.sandex.md/admin/auth/registration" id="openSignUp-02" className="  py-2 px-2 font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-400 transition
                    duration-300">Sign
                    Up</a>
            </div>
        </div>
    </div>
</nav>
        </div>
    );
};

export default Header;
