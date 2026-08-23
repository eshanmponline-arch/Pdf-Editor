import * as pdfjsLib from
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";


let pdfDocument = null;
let currentScale = 1;
let selectedItem = null;
let currentTool = null;


const pdfInput = document.getElementById("pdfInput");
const imageInput = document.getElementById("imageInput");
const pdfContainer = document.getElementById("pdfContainer");
const message = document.getElementById("message");
const fontSize = document.getElementById("fontSize");
const textColor = document.getElementById("textColor");
const zoom = document.getElementById("zoom");
const zoomValue = document.getElementById("zoomValue");


/* =========================
   OPEN PDF
========================= */

pdfInput.addEventListener("change", async function(event) {

    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
        alert("कृपया केवल PDF file चुनें।");
        return;
    }

    try {

        message.textContent = "⏳ PDF खुल रही है...";

        const arrayBuffer = await file.arrayBuffer();

        pdfDocument = await pdfjsLib.getDocument({
            data: arrayBuffer
        }).promise;

        pdfContainer.innerHTML = "";

        message.textContent =
            "✅ PDF सफलतापूर्वक खुल गई।";

        for (
            let pageNumber = 1;
            pageNumber <= pdfDocument.numPages;
            pageNumber++
        ) {
            await renderPage(pageNumber);
        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "❌ PDF खोलने में समस्या हुई।";

        alert("PDF नहीं खुल सकी।");

    }

});


/* =========================
   RENDER PAGE
========================= */

async function renderPage(pageNumber) {

    const page = await pdfDocument.getPage(pageNumber);

    const viewport = page.getViewport({
        scale: currentScale
    });

    const pageDiv = document.createElement("div");

    pageDiv.className = "pdf-page";
    pageDiv.dataset.page = pageNumber;


    const canvas = document.createElement("canvas");

    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;


    pageDiv.appendChild(canvas);


    const annotationLayer =
        document.createElement("div");

    annotationLayer.className =
        "annotation-layer";


    pageDiv.appendChild(annotationLayer);

    pdfContainer.appendChild(pageDiv);
}


/* =========================
   ADD TEXT
========================= */

document.getElementById("addText")
.addEventListener("click", function() {

    if (!pdfDocument) {
        alert("पहले PDF खोलें।");
        return;
    }

    const page =
        document.querySelector(".pdf-page");

    if (!page) return;

    const layer =
        page.querySelector(".annotation-layer");


    const text =
        document.createElement("div");

    text.className =
        "editor-item editable-text";

    text.contentEditable = true;

    text.innerText = "नया Text";


    text.style.fontSize =
        fontSize.value + "px";

    text.style.color =
        textColor.value;

    text.style.left = "50px";
    text.style.top = "50px";


    layer.appendChild(text);

    selectItem(text);

    text.focus();

});


/* =========================
   ADD IMAGE
========================= */

imageInput.addEventListener(
"change",
function(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    if (!pdfDocument) {
        alert("पहले PDF खोलें।");
        return;
    }


    const page =
        document.querySelector(".pdf-page");

    const layer =
        page.querySelector(".annotation-layer");


    const img =
        document.createElement("img");

    img.className =
        "editor-item editor-image";

    img.src =
        URL.createObjectURL(file);


    img.style.left = "50px";
    img.style.top = "50px";


    layer.appendChild(img);

    selectItem(img);

});


/* =========================
   SELECT ITEM
========================= */

function selectItem(item) {

    document
        .querySelectorAll(".editor-item")
        .forEach(function(element) {

            element.classList.remove("selected");

        });


    selectedItem = item;

    item.classList.add("selected");
}


/* =========================
   DRAG ITEMS
========================= */

document.addEventListener(
"mousedown",
function(event) {

    const item =
        event.target.closest(".editor-item");

    if (!item) return;

    selectItem(item);


    const startX = event.clientX;
    const startY = event.clientY;

    const originalLeft =
        item.offsetLeft;

    const originalTop =
        item.offsetTop;


    function move(e) {

        item.style.left =
            originalLeft +
            (e.clientX - startX) +
            "px";

        item.style.top =
            originalTop +
            (e.clientY - startY) +
            "px";
    }


    function stop() {

        document.removeEventListener(
            "mousemove",
            move
        );

        document.removeEventListener(
            "mouseup",
            stop
        );
    }


    document.addEventListener(
        "mousemove",
        move
    );

    document.addEventListener(
        "mouseup",
        stop
    );

});


/* =========================
   FONT SIZE
========================= */

fontSize.addEventListener(
"input",
function() {

    if (!selectedItem) return;

    if (
        selectedItem.classList.contains(
            "editable-text"
        )
    ) {

        selectedItem.style.fontSize =
            fontSize.value + "px";
    }

});


/* =========================
   TEXT COLOR
========================= */

textColor.addEventListener(
"input",
function() {

    if (!selectedItem) return;

    if (
        selectedItem.classList.contains(
            "editable-text"
        )
    ) {

        selectedItem.style.color =
            textColor.value;
    }

});


/* =========================
   DELETE
========================= */

document.getElementById("deleteBtn")
.addEventListener("click", function() {

    if (!selectedItem) {

        alert(
            "पहले कोई Text या Image select करें।"
        );

        return;
    }

    selectedItem.remove();

    selectedItem = null;

});


/* =========================
   CLEAR
========================= */

document.getElementById("clearBtn")
.addEventListener("click", function() {

    document
        .querySelectorAll(".editor-item")
        .forEach(function(item) {
            item.remove();
        });

    document
        .querySelectorAll(".highlight-box")
        .forEach(function(item) {
            item.remove();
        });

    selectedItem = null;

});


/* =========================
   HIGHLIGHT
========================= */

document.getElementById("highlightBtn")
.addEventListener("click", function() {

    if (!pdfDocument) {
        alert("पहले PDF खोलें।");
        return;
    }

    currentTool = "highlight";

    message.textContent =
        "🖍️ PDF पर mouse से drag करके Highlight बनाएं।";

});


/* =========================
   DRAW
========================= */

document.getElementById("drawBtn")
.addEventListener("click", function() {

    if (!pdfDocument) {
        alert("पहले PDF खोलें।");
        return;
    }

    alert(
        "Drawing सुविधा अगले version में और बेहतर की जा सकती है।"
    );

});


/* =========================
   HIGHLIGHT
========================= */

document.addEventListener(
"mousedown",
function(event) {

    if (currentTool !== "highlight") return;

    const layer =
        event.target.closest(".annotation-layer");

    if (!layer) return;


    const rect =
        layer.getBoundingClientRect();


    const startX =
        event.clientX - rect.left;

    const startY =
        event.clientY - rect.top;


    const box =
        document.createElement("div");

    box.className =
        "highlight-box";


    box.style.left =
        startX + "px";

    box.style.top =
        startY + "px";


    layer.appendChild(box);


    function move(e) {

        const width =
            e.clientX -
            rect.left -
            startX;

        const height =
            e.clientY -
            rect.top -
            startY;


        box.style.width =
            Math.abs(width) + "px";

        box.style.height =
            Math.abs(height) + "px";


        if (width < 0) {
            box.style.left =
                (startX + width) + "px";
        }

        if (height < 0) {
            box.style.top =
                (startY + height) + "px";
        }

    }


    function stop() {

        document.removeEventListener(
            "mousemove",
            move
        );

        document.removeEventListener(
            "mouseup",
            stop
        );

        currentTool = null;

        message.textContent =
            "✅ Highlight जोड़ दिया गया।";
    }


    document.addEventListener(
        "mousemove",
        move
    );

    document.addEventListener(
        "mouseup",
        stop
    );

});


/* =========================
   ZOOM
========================= */

zoom.addEventListener(
"input",
async function() {

    currentScale =
        parseFloat(zoom.value);


    zoomValue.textContent =
        Math.round(currentScale * 100) +
        "%";


    if (!pdfDocument) return;


    pdfContainer.innerHTML = "";


    for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
    ) {

        await renderPage(pageNumber);
    }

});


/* =========================
   SAVE
========================= */

document.getElementById("saveBtn")
.addEventListener("click", function() {

    alert(
        "अभी Save PDF बटन तैयार है। Edited PDF को वास्तव में download कराने के लिए pdf-lib export जोड़ना होगा।"
    );

});
