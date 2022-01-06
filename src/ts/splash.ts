import "../css/splash.css";
/* eslint-disable */
import * as copyData from "../../assets/static/splash/copy.json";
import * as webGLData from "playa-core/assets/webGL.json";
import * as portBGData from "../../assets/static/splash/loaderPortBG.png";
import * as landBGData from "../../assets/static/splash/loaderLandBG.png";
// @ts-ignore
const logoData = importAll(require.context("!file-loader!../../assets/static/splash/logos/", false, /\.png$/));

const PORTRAIT_LOGO_BASE: string = "loaderPortGameLogo";
const LANDSCAPE_LOGO_BASE: string = "loaderLandGameLogo";
const DEFAULT_STRING: string = "default";
const FILE_EXTENSION: string = ".png";

const container: HTMLElement | null = document.querySelector("#progress");
const logo: HTMLElement | null = document.querySelector("#logo");
const body: HTMLElement | null = document.querySelector("body");

//Set up event to change the loading text and loading bar progress amount based on received "message", effectly creates a loading effect
window.addEventListener(
    "message",
    (message) => {
        if (container && message.data && message.data.loaded) {
            const progressBar: HTMLElement | null = document.getElementById("prog-span");
            if (progressBar) progressBar.setAttribute("style", `width: ${message.data.loaded}%`);
            container.innerHTML = `${message.data.loaded}%`;
        }
    },
    false,
);

onResize();

// Resize event to draw the relevant background
window.addEventListener("resize", () => {
    onResize();
}, false);

function onResize(): void{
    const logoImg = window.innerWidth > window.innerHeight ? loadLogo(LANDSCAPE_LOGO_BASE) : loadLogo(PORTRAIT_LOGO_BASE);
    if (logo) logo.setAttribute("src", logoImg);

    const bgImg = window.innerWidth > window.innerHeight ? landBGData.default : portBGData.default;
    if (body) body.setAttribute("style", "background-image: url('"+bgImg+"');");
    // if (logo) logo.setAttribute("src", loadLogo(LOGO_BASE));

    //Set HTML document body based in window height and width to determine landcape of portait bg
    // const bgImg = window.innerWidth > window.innerHeight ? landBGData.default : portBGData.default;
    // if(body) body.setAttribute("style", "background-image: url('" + bgImg + "')")
}

/**
 * Find the location based log
 */
function loadLogo(baseFileName: string): any{
    // Grab the language and skincode
    const language: string | null = getParameterByName("language");
    const skincode: string | null = getParameterByName("skincode");
    
    /* 
        For testing, language and skincode can be changed by adding ?language=en_us&skincode=36 (for example) in the URL
        It appears the Framework default is language = en and skincode = 251
        You should not specify 'default' in the URL params, as it is down to the client to 
        use default in the case of a 'missing' locale or skincode
    */

    // Specify the order of preference for logos
    // Logo file name should follow the following pattern
    // <base name>.<locale>.<skincode>
    // 1. Logo name with language and skincode
    // 2. Logo name with language and default
    // 3. Logo name with language
    // 4. Logo name with default and skincode
    // 5. Logo name with default and default
    // 6. Logo name with default
    // 7. Logo name
    let outLogo: any = null;
    const locArr: string[] = [
        baseFileName+"."+language+"."+skincode+FILE_EXTENSION,
        baseFileName+"."+language+"."+DEFAULT_STRING+FILE_EXTENSION,
        baseFileName+"."+language+FILE_EXTENSION,
        baseFileName+"."+DEFAULT_STRING+"."+skincode+FILE_EXTENSION,
        baseFileName+"."+DEFAULT_STRING+"."+DEFAULT_STRING+FILE_EXTENSION,
        baseFileName+"."+DEFAULT_STRING+FILE_EXTENSION,
        baseFileName+FILE_EXTENSION
    ];

    // Run through the order of priority, as soon as we find a valid logo file, use it
    locArr.forEach((elem: string) => {
        if (logoData.hasOwnProperty(elem)){
            if (outLogo === null){
                outLogo = elem;
            }            
        }
    });

    // If we haven't found a valid logo, throw an error
    if (outLogo === null){
        throw new Error("No splash logo found");
    }
    
    // Return the matching reference in logoData
    return logoData[outLogo];
}

function loadTranslation(): void {
    if (isWebGLPresent) {
        const language: string | null = getParameterByName("language");
        if (language && (copyData as any).default[language] !== undefined) {
            const copyright: HTMLElement | null = document.getElementById("copyright");
            if (copyright) copyright.innerHTML = (copyData as any).default[language];
        }
    }
}

function getParameterByName(name: string): string | null {
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(window.location.href); //parsing/searching the current page address (URL) based on regular expression
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let supported: boolean | undefined;

/**
 * Determines whether webgl supported is
 * @returns true if webgl supported
 */
function isWebGLSupported(): boolean {
    if (typeof supported === "undefined") {
        supported = (function supported() {
            const contextOptions = {
                stencil: true,
                failIfMajorPerformanceCaveat: true,
            };
            try {
                if (!window.WebGLRenderingContext) {
                    return false;
                }
                const canvas = document.createElement("canvas");
                let gl: any =
                    canvas.getContext("webgl", contextOptions) ||
                    canvas.getContext("experimental-webgl", contextOptions);
                const success = !!(gl && gl.getContextAttributes().stencil);
                if (gl) {
                    const loseContext = gl.getExtension("WEBGL_lose_context");
                    if (loseContext) {
                        loseContext.loseContext();
                    }
                }
                gl = null;
                return success;
            } catch (e) {
                return false;
            }
        })();
    }
    return supported;
}

const isWebGLPresent: boolean = isWebGLSupported();
if (!isWebGLPresent) {
    const progressBar: HTMLElement | null = document.getElementById("prog-span");
    const logo: HTMLElement | null = document.querySelector("#logo");
    const copyright: HTMLElement | null = document.getElementById("copyright");
    const stripesBar: HTMLElement | null = document.getElementById("stripes-bar");
    const progressCandy: HTMLElement | null = document.getElementById("progress-candy");
    if (container && progressBar && logo && copyright && stripesBar && progressCandy) {
        container.style.visibility = "hidden";

        progressBar.style.visibility = "hidden";

        logo.style.visibility = "hidden";

        copyright.style.visibility = "hidden";

        stripesBar.style.visibility = "hidden";

        progressCandy.style.visibility = "hidden";
    }

    const language: string | null = getParameterByName("language");
    let webGLMessage: HTMLElement | null = document.getElementById("webGLMessage");

    if (language && (webGLData as any).default[language] !== undefined && webGLMessage) {
        webGLMessage.innerHTML = (webGLData as any).default[language];
    }
}

function importAll(r): any {
    return r.keys().reduce((acc, next) => { acc[next.replace("./", "")] = r(next); return acc; }, {});
}

loadTranslation();