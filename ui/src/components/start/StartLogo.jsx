import Logo from "../icons/Logo.jsx";
import release from "../../../../release.json";

const StartLogo = () => {
    return (
        <div className="h-72 flex flex-col items-center justify-center">
            <div className="mb-6">
                <Logo strokeWidth={10} size={100} />
            </div>
            <span className="text-4xl font-bold  mb-2 font-syne text-black">
                Chalk
            </span>
            {release.version && (
                <p className="text-sm text-black/50">{release.version}</p>
            )}
            {release.releaseNotes && (
                <p className="text-[10px] mb-16 text-black/50">
                    {release.releaseNotes}
                </p>
            )}
        </div>
    );
};

export default StartLogo;
