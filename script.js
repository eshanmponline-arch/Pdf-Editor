/* =========================================================
   SHREE SHYAM PDF EDITOR
   PDF.JS + PDF-LIB
========================================================= */


/* =========================================================
   PDF.JS
========================================================= */

import * as pdfjsLib from
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";


/* =========================================================
   PDF-LIB
========================================================= */

import {
    PDFDocument,
    rgb,
    StandardFonts
} from
"https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm";


/* =========================================================
   VARIABLES
========================================================= */

let pdfDocument = null;

let originalPdfBytes = null;

let currentScale = 1;

let selectedItem = null;

let currentTool = null;

let editedTexts = [];

let addedItems = [];


/* =========================================================
   ELEMENTS
========================================================= */

const pdfInput =
document.getElementById("pdfInput");

const imageInput =
document.getElementById("imageInput");

const pdfContainer =
document.getElementById("pdfContainer");

const message =
document.getElementById("message");

const fontSize =
document.getElementById("fontSize");

const textColor =
document.getElementById("textColor");

const zoom =
document.getElementById("zoom");

const zoomValue =
document.getElementById("zoomValue");

const addTextButton =
document.getElementById("addText");

const deleteButton =
document.getElementById("deleteBtn");

const clearButton =
document.getElementById("clearBtn");

const highlightButton =
document.getElementById("highlightBtn");

const drawButton =
document.getElementById("drawBtn");

const saveButton =
document.getElementById("saveBtn");


/* =========================================================
   OPEN PDF
========================================================= */

pdfInput.addEventListener(
"change",
async function(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    if (
        file.type !==
        "application/pdf"
    ) {

        alert(
            "कृपया केवल PDF file चुनें।"
        );

        return;
    }


    try {

        message.textContent =
            "⏳ PDF खुल रही है...";


        originalPdfBytes =
            await file.arrayBuffer();


        pdfDocument =
            await pdfjsLib
                .getDocument({
                    data: originalPdfBytes
                })
                .promise;


        pdfContainer.innerHTML =
            "";


        editedTexts = [];

        addedItems = [];

        selectedItem = null;


        message.textContent =
            "✅ PDF सफलतापूर्वक खुल गई।";


        for (
            let pageNumber = 1;
            pageNumber <=
            pdfDocument.numPages;
            pageNumber++
        ) {

            await renderPage(
                pageNumber
            );

        }

    }

    catch(error) {

        console.error(error);


        message.textContent =
            "❌ PDF खोलने में समस्या हुई।";


        alert(
            "PDF नहीं खुल सकी।"
        );

    }

});


/* =========================================================
   RENDER PAGE
========================================================= */

async function renderPage(pageNumber) {

    const page =
        await pdfDocument.getPage(
            pageNumber
        );


    const viewport =
        page.getViewport({
            scale: currentScale
        });


    const pageDiv =
        document.createElement("div");


    pageDiv.className =
        "pdf-page";


    pageDiv.dataset.page =
        pageNumber;


    pageDiv.style.width =
        viewport.width + "px";


    pageDiv.style.height =
        viewport.height + "px";


    pageDiv.style.position =
        "relative";


    /* =====================================================
       CANVAS
    ===================================================== */

    const canvas =
        document.createElement("canvas");


    const context =
        canvas.getContext("2d");


    canvas.width =
        viewport.width;


    canvas.height =
        viewport.height;


    canvas.style.width =
        viewport.width + "px";


    canvas.style.height =
        viewport.height + "px";


    await page.render({

        canvasContext:
            context,

        viewport:
            viewport

    }).promise;


    pageDiv.appendChild(
        canvas
    );


    /* =====================================================
       TEXT LAYER
    ===================================================== */

    const textLayer =
        document.createElement("div");


    textLayer.className =
        "text-layer";


    textLayer.style.position =
        "absolute";


    textLayer.style.left =
        "0";


    textLayer.style.top =
        "0";


    textLayer.style.width =
        viewport.width + "px";


    textLayer.style.height =
        viewport.height + "px";


    textLayer.style.overflow =
        "hidden";


    pageDiv.appendChild(
        textLayer
    );


    try {

        const textContent =
            await page.getTextContent();


        const textLayerInstance =
            new pdfjsLib.TextLayer({

                textContentSource:
                    textContent,

                container:
                    textLayer,

                viewport:
                    viewport

            });


        await textLayerInstance.render();


        setupTextEditing(
            textLayer,
            pageNumber,
            viewport
        );

    }

    catch(error) {

        console.error(
            "Text layer error:",
            error
        );

    }


    /* =====================================================
       ANNOTATION LAYER
    ===================================================== */

    const annotationLayer =
        document.createElement("div");


    annotationLayer.className =
        "annotation-layer";


    annotationLayer.style.position =
        "absolute";


    annotationLayer.style.left =
        "0";


    annotationLayer.style.top =
        "0";


    annotationLayer.style.width =
        "100%";


    annotationLayer.style.height =
        "100%";


    pageDiv.appendChild(
        annotationLayer
    );


    pdfContainer.appendChild(
        pageDiv
    );

}


/* =========================================================
   TEXT EDITING SETUP
========================================================= */

function setupTextEditing(
    textLayer,
    pageNumber,
    viewport
) {

    const spans =
        textLayer.querySelectorAll(
            "span"
        );


    spans.forEach(
        function(span) {

            span.dataset.originalText =
                span.textContent;


            span.dataset.page =
                pageNumber;


            span.style.cursor =
                "text";


            span.addEventListener(
                "dblclick",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    editExistingText(
                        span,
                        pageNumber,
                        viewport
                    );

                }
            );

        }
    );

}


/* =========================================================
   EDIT EXISTING PDF TEXT
========================================================= */

function editExistingText(
    span,
    pageNumber,
    viewport
) {

    if (
        span.dataset.editing ===
        "true"
    ) {

        return;

    }


    span.dataset.editing =
        "true";


    const oldText =
        span.textContent;


    const spanRect =
        span.getBoundingClientRect();


    const layerRect =
        span.parentElement
            .getBoundingClientRect();


    const left =
        spanRect.left -
        layerRect.left;


    const top =
        spanRect.top -
        layerRect.top;


    const width =
        spanRect.width;


    const height =
        spanRect.height;


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.value =
        oldText;


    input.className =
        "text-edit-box";


    input.style.position =
        "absolute";


    input.style.left =
        left + "px";


    input.style.top =
        top + "px";


    input.style.width =
        Math.max(
            width + 30,
            80
        ) + "px";


    input.style.height =
        Math.max(
            height + 8,
            25
        ) + "px";


    input.style.fontSize =
        Math.max(
            height,
            12
        ) + "px";


    input.style.fontFamily =
        "Arial, sans-serif";


    input.style.background =
        "white";


    input.style.color =
        "#000";


    input.style.border =
        "2px solid #2575fc";


    input.style.outline =
        "none";


    input.style.zIndex =
        "100";


    span.parentElement.appendChild(
        input
    );


    span.style.visibility =
        "hidden";


    input.focus();

    input.select();


    let finished =
        false;


    function finishEdit(
        saveChange = true
    ) {

        if (finished) {
            return;
        }


        finished = true;


        let newText =
            input.value;


        if (!saveChange) {

            newText =
                oldText;

        }


        span.textContent =
            newText;


        span.style.visibility =
            "visible";


        span.dataset.editing =
            "false";


        input.remove();


        /* ================================================
           SAVE EDIT INFORMATION
        ================================================ */

        saveEditedText(
            span,
            oldText,
            newText,
            pageNumber,
            viewport
        );

    }


    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                finishEdit(true);

            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                finishEdit(false);

            }

        }
    );


    input.addEventListener(
        "blur",
        function() {

            finishEdit(true);

        }
    );

}


/* =========================================================
   SAVE EDITED TEXT INFORMATION
========================================================= */

function saveEditedText(
    span,
    oldText,
    newText,
    pageNumber,
    viewport
) {

    const layer =
        span.parentElement;


    const spanRect =
        span.getBoundingClientRect();


    const layerRect =
        layer.getBoundingClientRect();


    const left =
        spanRect.left -
        layerRect.left;


    const top =
        spanRect.top -
        layerRect.top;


    const width =
        spanRect.width;


    const height =
        spanRect.height;


    const existing =
        editedTexts.find(
            function(item) {

                return (
                    item.page ===
                    pageNumber &&
                    item.span ===
                    span
                );

            }
        );


    if (existing) {

        existing.oldText =
            oldText;

        existing.newText =
            newText;

        existing.left =
            left;

        existing.top =
            top;

        existing.width =
            width;

        existing.height =
            height;

        existing.scale =
            currentScale;

    }

    else {

        editedTexts.push({

            page:
                pageNumber,

            span:
                span,

            oldText:
                oldText,

            newText:
                newText,

            left:
                left,

            top:
                top,

            width:
                width,

            height:
                height,

            scale:
                currentScale

        });

    }


    message.textContent =
        "✏️ Text edit किया गया।";

}


/* =========================================================
   ADD NEW TEXT
========================================================= */

addTextButton.addEventListener(
"click",
function() {

    if (!pdfDocument) {

        alert(
            "पहले PDF खोलें।"
        );

        return;

    }


    const page =
        document.querySelector(
            ".pdf-page"
        );


    if (!page) {
        return;
    }


    const layer =
        page.querySelector(
            ".annotation-layer"
        );


    const text =
        document.createElement(
            "div"
        );


    text.className =
        "editor-item editable-text";


    text.contentEditable =
        "true";


    text.innerText =
        "नया Text";


    text.style.position =
        "absolute";


    text.style.left =
        "50px";


    text.style.top =
        "50px";


    text.style.fontSize =
        fontSize.value +
        "px";


    text.style.color =
        textColor.value;


    text.style.background =
        "rgba(255,255,255,0.85)";


    text.style.padding =
        "3px";


    text.style.minWidth =
        "70px";


    text.style.zIndex =
        "30";


    layer.appendChild(
        text
    );


    addedItems.push({

        type:
            "text",

        pageElement:
            page,

        element:
            text

    });


    selectItem(text);


    text.focus();

});


/* =========================================================
   ADD IMAGE
========================================================= */

imageInput.addEventListener(
"change",
function(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    if (!pdfDocument) {

        alert(
            "पहले PDF खोलें।"
        );

        return;

    }


    const page =
        document.querySelector(
            ".pdf-page"
        );


    if (!page) {
        return;
    }


    const layer =
        page.querySelector(
            ".annotation-layer"
        );


    const img =
        document.createElement(
            "img"
        );


    img.className =
        "editor-item editor-image";


    img.src =
        URL.createObjectURL(
            file
        );


    img.style.position =
        "absolute";


    img.style.left =
        "50px";


    img.style.top =
        "50px";


    img.style.maxWidth =
        "250px";


    img.style.maxHeight =
        "250px";


    img.style.zIndex =
        "30";


    layer.appendChild(
        img
    );


    addedItems.push({

        type:
            "image",

        pageElement:
            page,

        element:
            img,

        file:
            file

    });


    selectItem(img);

});


/* =========================================================
   SELECT ITEM
========================================================= */

function selectItem(item) {

    document
        .querySelectorAll(
            ".editor-item"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "selected"
                );

            }
        );


    selectedItem =
        item;


    item.classList.add(
        "selected"
    );

}


/* =========================================================
   DRAG NEW ITEMS
========================================================= */

document.addEventListener(
"mousedown",
function(event) {

    const item =
        event.target.closest(
            ".editor-item"
        );


    if (!item) {
        return;
    }


    if (
        item.contentEditable ===
        "true"
    ) {

        return;

    }


    selectItem(item);


    const startX =
        event.clientX;


    const startY =
        event.clientY;


    const originalLeft =
        item.offsetLeft;


    const originalTop =
        item.offsetTop;


    function move(e) {

        item.style.left =
            originalLeft +
            (
                e.clientX -
                startX
            ) +
            "px";


        item.style.top =
            originalTop +
            (
                e.clientY -
                startY
            ) +
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


/* =========================================================
   FONT SIZE
========================================================= */

fontSize.addEventListener(
"input",
function() {

    if (!selectedItem) {
        return;
    }


    if (
        selectedItem.classList.contains(
            "editable-text"
        )
    ) {

        selectedItem.style.fontSize =
            fontSize.value +
            "px";

    }

});


/* =========================================================
   TEXT COLOR
========================================================= */

textColor.addEventListener(
"input",
function() {

    if (!selectedItem) {
        return;
    }


    if (
        selectedItem.classList.contains(
            "editable-text"
        )
    ) {

        selectedItem.style.color =
            textColor.value;

    }

});


/* =========================================================
   DELETE
========================================================= */

deleteButton.addEventListener(
"click",
function() {

    if (!selectedItem) {

        alert(
            "पहले कोई Text या Image select करें।"
        );

        return;

    }


    selectedItem.remove();


    addedItems =
        addedItems.filter(
            function(item) {

                return (
                    item.element !==
                    selectedItem
                );

            }
        );


    selectedItem =
        null;


    message.textContent =
        "🗑️ Item delete कर दिया गया।";

});


/* =========================================================
   CLEAR
========================================================= */

clearButton.addEventListener(
"click",
function() {

    document
        .querySelectorAll(
            ".editor-item"
        )
        .forEach(
            function(item) {

                item.remove();

            }
        );


    document
        .querySelectorAll(
            ".highlight-box"
        )
        .forEach(
            function(item) {

                item.remove();

            }
        );


    addedItems = [];

    selectedItem = null;


    message.textContent =
        "♻️ Added items clear कर दिए गए।";

});


/* =========================================================
   HIGHLIGHT
========================================================= */

highlightButton.addEventListener(
"click",
function() {

    if (!pdfDocument) {

        alert(
            "पहले PDF खोलें।"
        );

        return;

    }


    currentTool =
        "highlight";


    message.textContent =
        "🖍️ PDF पर mouse से drag करके Highlight बनाएं।";

});


/* =========================================================
   HIGHLIGHT DRAWING
========================================================= */

document.addEventListener(
"mousedown",
function(event) {

    if (
        currentTool !==
        "highlight"
    ) {

        return;

    }


    const layer =
        event.target.closest(
            ".annotation-layer"
        );


    if (!layer) {
        return;
    }


    const rect =
        layer.getBoundingClientRect();


    const startX =
        event.clientX -
        rect.left;


    const startY =
        event.clientY -
        rect.top;


    const box =
        document.createElement(
            "div"
        );


    box.className =
        "highlight-box";


    box.style.position =
        "absolute";


    box.style.left =
        startX + "px";


    box.style.top =
        startY + "px";


    box.style.background =
        "rgba(255,235,59,0.45)";


    box.style.border =
        "1px solid rgba(220,180,0,0.7)";


    box.style.zIndex =
        "20";


    layer.appendChild(
        box
    );


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
            Math.abs(width) +
            "px";


        box.style.height =
            Math.abs(height) +
            "px";


        if (width < 0) {

            box.style.left =
                startX +
                width +
                "px";

        }


        if (height < 0) {

            box.style.top =
                startY +
                height +
                "px";

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


        currentTool =
            null;


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


/* =========================================================
   DRAW
========================================================= */

drawButton.addEventListener(
"click",
function() {

    alert(
        "Drawing tool को अगले step में canvas drawing के साथ जोड़ा जा सकता है।"
    );

});


/* =========================================================
   ZOOM
========================================================= */

zoom.addEventListener(
"input",
async function() {

    currentScale =
        parseFloat(
            zoom.value
        );


    zoomValue.textContent =
        Math.round(
            currentScale *
            100
        ) + "%";


    if (!pdfDocument) {
        return;
    }


    pdfContainer.innerHTML =
        "";


    for (
        let pageNumber = 1;
        pageNumber <=
        pdfDocument.numPages;
        pageNumber++
    ) {

        await renderPage(
            pageNumber
        );

    }

});


/* =========================================================
   SAVE PDF
========================================================= */

saveButton.addEventListener(
"click",
async function() {

    if (!originalPdfBytes) {

        alert(
            "पहले PDF खोलें।"
        );

        return;

    }


    try {

        message.textContent =
            "⏳ Edited PDF तैयार हो रही है...";


        const pdfDoc =
            await PDFDocument.load(
                originalPdfBytes
            );


        const font =
            await pdfDoc.embedFont(
                StandardFonts.Helvetica
            );


        /* =================================================
           EDITED EXISTING TEXT
        ================================================= */

        for (
            const edit of editedTexts
        ) {

            if (
                edit.newText ===
                edit.oldText
            ) {

                continue;

            }


            const pdfPage =
                pdfDoc.getPage(
                    edit.page - 1
                );


            const pageWidth =
                pdfPage.getWidth();


            const pageHeight =
                pdfPage.getHeight();


            const pdfjsPage =
                await pdfDocument.getPage(
                    edit.page
                );


            const originalViewport =
                pdfjsPage.getViewport({
                    scale: 1
                });


            const scaleX =
                pageWidth /
                originalViewport.width;


            const scaleY =
                pageHeight /
                originalViewport.height;


            const x =
                edit.left /
                edit.scale *
                scaleX;


            const top =
                edit.top /
                edit.scale *
                scaleY;


            const width =
                edit.width /
                edit.scale *
                scaleX;


            const height =
                edit.height /
                edit.scale *
                scaleY;


            const y =
                pageHeight -
                top -
                height;


            /* =============================================
               WHITE OUT OLD TEXT
            ============================================= */

            pdfPage.drawRectangle({

                x:
                    x - 2,

                y:
                    y - 2,

                width:
                    Math.max(
                        width + 8,
                        20
                    ),

                height:
                    Math.max(
                        height + 8,
                        15
                    ),

                color:
                    rgb(
                        1,
                        1,
                        1
                    )

            });


            /* =============================================
               DRAW NEW TEXT
            ============================================= */

            pdfPage.drawText(
                edit.newText,
                {

                    x:
                        x,

                    y:
                        y + 2,

                    size:
                        Math.max(
                            height * 0.75,
                            8
                        ),

                    font:
                        font,

                    color:
                        rgb(
                            0,
                            0,
                            0
                        )

                }
            );

        }


        /* =================================================
           ADDED TEXT
        ================================================= */

        for (
            const item of addedItems
        ) {

            if (
                item.type !==
                "text"
            ) {

                continue;

            }


            const pageIndex =
                Array.from(
                    document.querySelectorAll(
                        ".pdf-page"
                    )
                ).indexOf(
                    item.pageElement
                );


            if (
                pageIndex <
                0
            ) {

                continue;

            }


            const pdfPage =
                pdfDoc.getPage(
                    pageIndex
                );


            const element =
                item.element;


            const pageRect =
                item.pageElement
                    .getBoundingClientRect();


            const elementRect =
                element
                    .getBoundingClientRect();


            const left =
                elementRect.left -
                pageRect.left;


            const top =
                elementRect.top -
                pageRect.top;


            const pdfjsPage =
                await pdfDocument.getPage(
                    pageIndex + 1
                );


            const viewport =
                pdfjsPage.getViewport({
                    scale: 1
                });


            const scaleX =
                pdfPage.getWidth() /
                viewport.width;


            const scaleY =
                pdfPage.getHeight() /
                viewport.height;


            const x =
                left /
                currentScale *
                scaleX;


            const height =
                elementRect.height /
                currentScale *
                scaleY;


            const y =
                pdfPage.getHeight() -
                (
                    top /
                    currentScale *
                    scaleY
                ) -
                height;


            const size =
                parseFloat(
                    getComputedStyle(
                        element
                    ).fontSize
                ) /
                currentScale *
                scaleY;


            pdfPage.drawText(
                element.innerText,
                {

                    x:
                        x,

                    y:
                        y,

                    size:
                        Math.max(
                            size,
                            8
                        ),

                    font:
                        font,

                    color:
                        getPdfColor(
                            getComputedStyle(
                                element
                            ).color
                        )

                }
            );

        }


        /* =================================================
           SAVE
        ================================================= */

        const newPdfBytes =
            await pdfDoc.save();


        const blob =
            new Blob(
                [
                    newPdfBytes
                ],
                {
                    type:
                        "application/pdf"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "Shree-Shyam-Edited.pdf";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        message.textContent =
            "✅ Edited PDF download हो गई।";

    }

    catch(error) {

        console.error(error);


        message.textContent =
            "❌ PDF save नहीं हो सकी।";


        alert(
            "PDF save करते समय समस्या हुई।"
        );

    }

});


/* =========================================================
   COLOR CONVERTER
========================================================= */

function getPdfColor(
    cssColor
) {

    const match =
        cssColor.match(
            /rgba?\(([^)]+)\)/
        );


    if (!match) {

        return rgb(
            0,
            0,
            0
        );

    }


    const values =
        match[1]
            .split(",")
            .map(
                Number
            );


    return rgb(

        values[0] / 255,

        values[1] / 255,

        values[2] / 255

    );

}


/* =========================================================
   INITIAL MESSAGE
========================================================= */

message.textContent =
    '📂 PDF खोलने के लिए ऊपर "PDF खोलें" दबाएँ';
