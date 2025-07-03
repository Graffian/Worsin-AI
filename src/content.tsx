import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ContentPage from "./contentPage";

const root = document.createElement("div")
root.id = "_extension_ui"
document.body.append(root)

createRoot(document.getElementById("_extension_ui")!).render(
    <StrictMode>
        <ContentPage/>
    </StrictMode>
)