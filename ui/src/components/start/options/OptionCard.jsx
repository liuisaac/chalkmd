const OptionCard = ({
    title,
    description,
    buttonText,
    onClick,
    primary = false,
}) => {
    return (
        <div className="flex items-center justify-between py-4 px-5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors group">
            <div className="flex flex-col items-start pr-4">
                <h3 className="text-[15px] text-gray-900">{title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">
                    {description}
                </p>
            </div>
            <button
                onClick={onClick}
                className={`px-6 py-2 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap ${
                    primary
                        ? "bg-offpurple hover:bg-offpurple text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
            >
                {buttonText}
            </button>
        </div>
    );
};

export default OptionCard;
