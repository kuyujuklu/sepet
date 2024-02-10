const Header = ({ name }) => {
    return (
        <h1 className="text-2xl text-center text-gray-800 mt-4">
            <span className="font-medium">Admin Panel </span>{" "}
            <span className="font-bold">{name}</span>{" "}
        </h1>
    );
};

export default Header;
