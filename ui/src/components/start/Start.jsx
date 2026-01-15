import StartTitleBar from "./StartTitleBar";
import StartLogo from "./StartLogo";
import StartSidebar from "./StartSidebar";
import StartOptions from "./options/StartOptions";

const Start = () => {
    return (
        <div className="h-screen bg-offwhite flex flex-col font-sans">
            <StartTitleBar />
            <div className="flex-1 flex flex-row items-center justify-start overflow-auto">
                <StartSidebar />
                <div className="flex-1 flex flex-col items-center justify-start">
                    <StartLogo />
                    <StartOptions />
                </div>
            </div>
        </div>
    );
};

export default Start;
