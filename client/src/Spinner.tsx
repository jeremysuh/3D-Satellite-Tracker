import SpinnerSVG from "./spinner.svg";

interface SpinnerInterface {
    isVisible: boolean;
}

const Spinner = ({ isVisible }: SpinnerInterface) => {
    return (
        <div>
            <object
                type="image/svg+xml"
                data={SpinnerSVG}
                style={{ position: "absolute", zIndex: 1, bottom: "10vh", right: "45vw", width: "10vw", visibility: isVisible ? "visible" : "hidden" }}
            >
                svg-animation
            </object>
        </div>
    );
};

export { Spinner };
