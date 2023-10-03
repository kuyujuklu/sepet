const SomethingWentWrong = () => {
    return (
        <div 
            style={{ 
                height: "80vh",
                maxWidth: 600 
            }}
            className="m-auto text-center border border-gray-300 rounded-2xl shadow-xl p-10 mt-10"
        >
            <div className="flex flex-col items-center justify-center pt-20">
                <span style={{fontSize: 30}}>😞</span>
                <h1 className="text-xl font-medium">
                    К сожалению что-то пошло не так. Попробуйте перезагрузить
                    страницу или повторите попытку позже...
                </h1>
            </div>
        </div>
    );
};


export default SomethingWentWrong