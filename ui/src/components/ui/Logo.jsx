import chalkSvg from "../../assets/images/chalk.svg";
const Logo = ({ size = 150, strokeColor = "black" }) => {
    return (
        <img
            src={chalkSvg}
            alt="Chalk logo"
            style={{
                width: size,
                height: size,
                filter: strokeColor !== "black" ? `brightness(0) saturate(100%) invert(${strokeColor === "white" ? "100" : "0"}%)` : "none"
            }}
        />
    );
};

export default Logo;
