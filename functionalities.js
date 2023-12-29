var shape = "line";

var shapes = document.getElementsByClassName("shape");

for (let j = 0; j < shapes.length; j++) {
    shapes[j].addEventListener("click", function () {
        shape = shapes[j].id;
    });
}

const svgEditor = document.getElementById("editor");

var color = document.getElementById("color"), newColor = "black", fillColor = "black";
color.addEventListener("change", function () {
    newColor = color.value;
    fillColor = color.value;
});

var spinner = document.getElementById("spinner"), newLineWidth = 3;
spinner.addEventListener("change", function () {
    newLineWidth = spinner.value;
});

const svgPoint = (svgDocument, x, y) => {
    const point = new DOMPoint(x, y);
    point.x = x;
    point.y = y;
    return point.matrixTransform(svgDocument.getScreenCTM().inverse());
};

function showContextMenu(e) {
    e.preventDefault();

    const divEdit = document.createElement("div");
    divEdit.id = "edit";
    divEdit.style.position = "absolute";
    divEdit.style.top = `${e.clientY}px`;
    divEdit.style.left = `${e.clientX}px`;
    document.body.appendChild(divEdit);

    const btnDelete = createButton("Delete");
    const btnColor = createButton("Change Color");
    const btnStroke = createButton("Change Line Stroke");
    const btnRotate = createButton("Rotate");
    const btnCancel = createButton("Cancel");
    const btnMove = createButton("Move");

    divEdit.appendChild(btnMove);
    divEdit.appendChild(btnColor);
    divEdit.appendChild(btnStroke);
    divEdit.appendChild(btnRotate);
    divEdit.appendChild(btnDelete);
    divEdit.appendChild(btnCancel);

    btnMove.addEventListener('click', () => {
        document.body.removeChild(divEdit);
    });

    btnDelete.addEventListener('click', () => {
        document.body.removeChild(divEdit);
    });

    btnColor.addEventListener('click', () => {
        document.body.removeChild(divEdit);
    });

    btnStroke.addEventListener('click', () => {
        document.body.removeChild(divEdit);
    });

    btnRotate.addEventListener('click', () => {
        document.body.removeChild(divEdit);
    });

    btnCancel.addEventListener('click', () => {
        document.body.removeChild(divEdit);
    });

    divEdit.addEventListener('mouseleave', () => {
        document.body.removeChild(divEdit);
    });
}

function createButton(text) {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.style.display = "block";
    button.style.width = "100%";
    button.style.marginBottom = "5px";
    return button;
}

function changingShapeProperties(shape) {
    shape.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e);

        const buttons = document.querySelectorAll("#edit button");
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                switch (button.innerHTML) {
                    case "Delete":
                        svgEditor.removeChild(shape);

                        break;

                    case "Change Color":
                        const colorInput = document.createElement("input");
                        colorInput.type = "color";
                        colorInput.style.position = "absolute";
                        colorInput.style.top = `${e.clientY}px`;
                        colorInput.style.left = `${e.clientX}px`;
                        colorInput.style.opacity = 0;

                        colorInput.addEventListener("input", (event) => {
                            const selectedColor = event.target.value;
                            if (shape.tagName === 'line') {
                                shape.style.stroke = selectedColor;
                            } else {
                                shape.style.fill = selectedColor;
                            }
                        });

                        document.body.appendChild(colorInput);
                        colorInput.click();

                        break;

                    case "Change Line Stroke":
                        const dialog = document.createElement("div");
                        dialog.innerHTML =
                            `<input type="number" id="strokeInput" placeholder="Enter line thickness"/>
                             <button id="confirmStroke">OK</button>`;

                        dialog.style.position = "absolute";
                        dialog.style.top = `${e.clientY}px`;
                        dialog.style.left = `${e.clientX}px`;
                        document.body.appendChild(dialog);

                        const inputStroke = document.getElementById("strokeInput");
                        inputStroke.focus();

                        const confirmButton = document.getElementById("confirmStroke");
                        confirmButton.addEventListener("click", () => {
                            const newStrokeWidth = inputStroke.value;

                            if (newStrokeWidth !== "") {
                                shape.setAttribute("style", "stroke-width: " + newStrokeWidth);
                                document.body.removeChild(dialog);
                            }
                        });

                        break;

                    case "Rotate":
                        const bbox = shape.getBBox();
                        const centerX = bbox.x + bbox.width / 2;
                        const centerY = bbox.y + bbox.height / 2;

                        const currentTransform = shape.getAttribute("transform") || "";
                        const rotation = `rotate(90 ${centerX} ${centerY})`;
                        shape.setAttribute("transform", currentTransform + " " + rotation);

                        break;

                    case "Move":
                        let initialX, initialY;
                        let offsetX, offsetY;

                        if (shape.tagName === 'rect') {
                            const bbox = shape.getBBox();
                            initialX = bbox.x + bbox.width / 2;
                            initialY = bbox.y + bbox.height / 2;

                            offsetX = e.clientX - initialX;
                            offsetY = e.clientY - initialY;
                        } else if (shape.tagName === 'circle' || shape.tagName === 'ellipse') {
                            initialX = parseFloat(shape.getAttribute('cx'));
                            initialY = parseFloat(shape.getAttribute('cy'));

                            offsetX = e.clientX - initialX;
                            offsetY = e.clientY - initialY;
                        } else {
                            const points = shape.getAttribute('points').split(' ');
                            const pointValues = points.map(point => point.split(',').map(Number));

                            let totalX = 0,
                                totalY = 0;

                            pointValues.forEach(([x, y]) => {
                                totalX += x;
                                totalY += y;
                            });

                            initialX = totalX / pointValues.length;
                            initialY = totalY / pointValues.length;

                            offsetX = e.clientX - initialX;
                            offsetY = e.clientY - initialY;
                        }

                        const moveShape = (event) => {
                            let dx, dy;

                            if (shape.tagName === 'rect') {
                                dx = event.clientX - offsetX;
                                dy = event.clientY - offsetY;

                                shape.setAttribute('x', dx - shape.getBBox().width / 2);
                                shape.setAttribute('y', dy - shape.getBBox().height / 2);
                            } else if (shape.tagName === 'circle' || shape.tagName === 'ellipse') {
                                dx = event.clientX - offsetX;
                                dy = event.clientY - offsetY;

                                shape.setAttribute('cx', dx);
                                shape.setAttribute('cy', dy);
                            } else {
                                const points = shape.getAttribute('points');
                                const pointArray = points.split(' ');

                                const [initX, initY] = pointArray[0].split(',').map(Number);

                                dx = event.clientX - offsetX;
                                dy = event.clientY - offsetY;

                                const updatedPoints = pointArray.map(point => {
                                    const [x, y] = point.split(',').map(Number);
                                    return `${x + dx - initX},${y + dy - initY}`;
                                });

                                const newPoints = updatedPoints.join(' ');
                                shape.setAttribute('points', newPoints);
                            }
                        }

                        const endMoveShape = () => {
                            svgEditor.removeEventListener('mousemove', moveShape);
                            svgEditor.removeEventListener('mouseup', endMoveShape);
                        }

                        svgEditor.addEventListener('mousemove', moveShape);
                        svgEditor.addEventListener('mouseup', endMoveShape);

                        break;

                    default:

                        break;
                }
            });
        });
    });
}

let lineStart = null;
let lineShapeSVG = null;
let isDrawingGeometricalForm;

function isDrawingGeometricalShape(shape) {
    return shape !== "line";
}

function startDrawLine(leftClickEvent) {
    if (isDrawingGeometricalForm == false) {
        if (lineStart === null) {
            lineStart = svgPoint(svgEditor, leftClickEvent.clientX, leftClickEvent.clientY);
            lineShapeSVG = document.createElementNS("http://www.w3.org/2000/svg", "line");
            lineShapeSVG.setAttribute('class', 'drawing');
            lineShapeSVG.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
            lineShapeSVG.setAttribute('x1', lineStart.x);
            lineShapeSVG.setAttribute('y1', lineStart.y);
            lineShapeSVG.setAttribute('x2', lineStart.x);
            lineShapeSVG.setAttribute('y2', lineStart.y);
            svgEditor.appendChild(lineShapeSVG);
        } else {
            const end = svgPoint(svgEditor, leftClickEvent.clientX, leftClickEvent.clientY);
            lineShapeSVG.setAttribute('x2', end.x);
            lineShapeSVG.setAttribute('y2', end.y);
            lineStart = null;
        }
    }
}

function continueDrawLine(mouseMoveEvent) {
    if (isDrawingGeometricalForm === false && lineStart !== null) {
        const end = svgPoint(svgEditor, mouseMoveEvent.clientX, mouseMoveEvent.clientY);
        lineShapeSVG.setAttribute('x2', end.x);
        lineShapeSVG.setAttribute('y2', end.y);
    }
}

svgEditor.addEventListener('click', startDrawLine);
svgEditor.addEventListener('mousemove', continueDrawLine);

svgEditor.addEventListener('mousedown', (mouseDownEvent) => {
    let shapeSvg = document.createElementNS("http://www.w3.org/2000/svg", shape);
    let start = svgPoint(svgEditor, mouseDownEvent.clientX, mouseDownEvent.clientY);
    isDrawingGeometricalForm = isDrawingGeometricalShape(shape);

    switch (shape) {

        case "rect":
            const drawRectangle = (event) => {
                const point = svgPoint(svgEditor, event.clientX, event.clientY);
                const width = Math.abs(point.x - start.x);
                const height = Math.abs(point.y - start.y);

                if (point.x > start.x) {
                    point.x = start.x;
                }

                if (point.y > start.y) {
                    point.y = start.y;
                }

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('x', point.x);
                shapeSvg.setAttribute('y', point.y);
                shapeSvg.setAttribute('width', width);
                shapeSvg.setAttribute('height', height);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawRectangle = () => {
                svgEditor.removeEventListener('mousemove', drawRectangle);
                svgEditor.removeEventListener('mouseup', endDrawRectangle);
            }

            svgEditor.addEventListener('mousemove', drawRectangle);
            svgEditor.addEventListener('mouseup', endDrawRectangle);

            changingShapeProperties(shapeSvg);

            break;

        case "circle":
            const drawCircle = (event) => {
                const point = svgPoint(svgEditor, event.clientX, event.clientY);
                const radiusX = Math.abs(point.x - start.x) / 2,
                    radiusY = Math.abs(point.y - start.y) / 2

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('cx', point.x);
                shapeSvg.setAttribute('cy', point.y);
                shapeSvg.setAttribute('r', Math.max(radiusX, radiusY));
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawCircle = () => {
                svgEditor.removeEventListener('mousemove', drawCircle);
                svgEditor.removeEventListener('mouseup', endDrawCircle);
            }

            svgEditor.addEventListener('mousemove', drawCircle);
            svgEditor.addEventListener('mouseup', endDrawCircle);

            changingShapeProperties(shapeSvg);

            break;

        case "ellipse":
            const drawEllipse = (event) => {
                const point = svgPoint(svgEditor, event.clientX, event.clientY),
                    radiusX = Math.abs(point.x - start.x) / 2,
                    radiusY = Math.abs(point.y - start.y) / 2,
                    centerX = (point.x + start.x) / 2,
                    centerY = (point.y + start.y) / 2

                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('cx', centerX);
                shapeSvg.setAttribute('cy', centerY);
                shapeSvg.setAttribute('rx', radiusX);
                shapeSvg.setAttribute('ry', radiusY);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawEllipse = () => {
                svgEditor.removeEventListener('mousemove', drawEllipse);
                svgEditor.removeEventListener('mouseup', endDrawEllipse);
            }

            svgEditor.addEventListener('mousemove', drawEllipse);
            svgEditor.addEventListener('mouseup', endDrawEllipse);

            changingShapeProperties(shapeSvg);

            break;
    }
});

svgEditor.addEventListener('mousedown', (mouseDownEvent) => {
    let shapeSvg = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
    let start = svgPoint(svgEditor, mouseDownEvent.clientX, mouseDownEvent.clientY);
    isDrawingGeometricalForm = isDrawingGeometricalShape(shape);

    switch (shape) {

        case "echilateral":
            const drawEquilateralTriangle = (event) => {
                const end = svgPoint(svgEditor, event.clientX, event.clientY);
                const sideLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

                const vertex1 = { x: start.x, y: start.y - sideLength };
                const vertex2 = { x: start.x + (Math.sqrt(3) / 2) * sideLength, y: start.y + sideLength / 2 };
                const vertex3 = { x: start.x - (Math.sqrt(3) / 2) * sideLength, y: start.y + sideLength / 2 };

                const vertices = vertex1.x + "," + vertex1.y + " " + vertex2.x + "," + vertex2.y + " " + vertex3.x + "," + vertex3.y;

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('points', vertices);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawEquilateralTriangle = () => {
                svgEditor.removeEventListener('mousemove', drawEquilateralTriangle);
                svgEditor.removeEventListener('mouseup', endDrawEquilateralTriangle);
            }

            svgEditor.addEventListener('mousemove', drawEquilateralTriangle);
            svgEditor.addEventListener('mouseup', endDrawEquilateralTriangle);

            changingShapeProperties(shapeSvg);

            break;

        case "isosceles":
            const drawIsoscelesTriangle = (event) => {
                const end = svgPoint(svgEditor, event.clientX, event.clientY);
                const baseLength = Math.abs(end.x - start.x);

                const vertex1 = { x: start.x, y: start.y };
                const vertex2 = { x: start.x + baseLength, y: start.y };
                const vertex3 = { x: start.x + baseLength / 2, y: start.y - 2 * baseLength };

                const vertices = vertex1.x + "," + vertex1.y + " " + vertex2.x + "," + vertex2.y + " " + vertex3.x + "," + vertex3.y;

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('points', vertices);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawIsoscelesTriangle = () => {
                svgEditor.removeEventListener('mousemove', drawIsoscelesTriangle);
                svgEditor.removeEventListener('mouseup', endDrawIsoscelesTriangle);
            }

            svgEditor.addEventListener('mousemove', drawIsoscelesTriangle);
            svgEditor.addEventListener('mouseup', endDrawIsoscelesTriangle);

            changingShapeProperties(shapeSvg);

            break;

        case "right_isosceles":
            const drawRightIsoscelesTriangle = (event) => {
                const end = svgPoint(svgEditor, event.clientX, event.clientY);
                const baseLength = Math.abs(end.x - start.x);

                const vertex1 = { x: start.x, y: start.y };
                const vertex2 = { x: start.x + baseLength, y: start.y };
                const vertex3 = { x: start.x + baseLength / 2, y: start.y - baseLength / 2 };

                const vertices = vertex1.x + "," + vertex1.y + " " + vertex2.x + "," + vertex2.y + " " + vertex3.x + "," + vertex3.y;

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('points', vertices);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawRightIsoscelesTriangle = () => {
                svgEditor.removeEventListener('mousemove', drawRightIsoscelesTriangle);
                svgEditor.removeEventListener('mouseup', endDrawRightIsoscelesTriangle);
            }

            svgEditor.addEventListener('mousemove', drawRightIsoscelesTriangle);
            svgEditor.addEventListener('mouseup', endDrawRightIsoscelesTriangle);

            changingShapeProperties(shapeSvg);

            break;

        case "right":
            const drawRightTriangle = (event) => {
                const end = svgPoint(svgEditor, event.clientX, event.clientY);

                const vertex1 = { x: start.x, y: start.y };
                const vertex2 = { x: end.x, y: start.y };
                const vertex3 = { x: start.x, y: end.y };

                const vertices = vertex1.x + "," + vertex1.y + " " + vertex2.x + "," + vertex2.y + " " + vertex3.x + "," + vertex3.y;

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('points', vertices);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawRightTriangle = () => {
                svgEditor.removeEventListener('mousemove', drawRightTriangle);
                svgEditor.removeEventListener('mouseup', endDrawRightTriangle);
            }

            svgEditor.addEventListener('mousemove', drawRightTriangle);
            svgEditor.addEventListener('mouseup', endDrawRightTriangle);

            changingShapeProperties(shapeSvg);

            break;

        case "rhomb":
            const drawRhomb = (event) => {
                const end = svgPoint(svgEditor, event.clientX, event.clientY);
                const sideLength = Math.abs(end.x - start.x);

                const vertex1 = { x: start.x, y: start.y - 2 * sideLength };
                const vertex2 = { x: start.x + sideLength, y: start.y };
                const vertex3 = { x: start.x, y: start.y + 2 * sideLength };
                const vertex4 = { x: start.x - sideLength, y: start.y };

                const vertices = vertex1.x + "," + vertex1.y + " " + vertex2.x + "," + vertex2.y + " " + vertex3.x + "," + vertex3.y + " " + vertex4.x + "," + vertex4.y;

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('points', vertices);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawRhomb = () => {
                svgEditor.removeEventListener('mousemove', drawRhomb);
                svgEditor.removeEventListener('mouseup', endDrawRhomb);
            }

            svgEditor.addEventListener('mousemove', drawRhomb);
            svgEditor.addEventListener('mouseup', endDrawRhomb);

            changingShapeProperties(shapeSvg);

            break;

        case "hexagon":
            const drawHexagon = (event) => {
                const end = svgPoint(svgEditor, event.clientX, event.clientY);
                const sideLength = Math.abs(end.x - start.x);

                const vertex1 = { x: start.x, y: start.y - sideLength };
                const vertex2 = { x: start.x + (Math.sqrt(3) / 2) * sideLength, y: start.y - sideLength / 2 };
                const vertex3 = { x: start.x + (Math.sqrt(3) / 2) * sideLength, y: start.y + sideLength / 2 };
                const vertex4 = { x: start.x, y: start.y + sideLength };
                const vertex5 = { x: start.x - (Math.sqrt(3) / 2) * sideLength, y: start.y + sideLength / 2 };
                const vertex6 = { x: start.x - (Math.sqrt(3) / 2) * sideLength, y: start.y - sideLength / 2 };

                const vertices = vertex1.x + "," + vertex1.y + " " + vertex2.x + "," + vertex2.y + " " + vertex3.x + "," + vertex3.y + " " + vertex4.x + "," + vertex4.y + " " + vertex5.x + "," + vertex5.y + " " + vertex6.x + "," + vertex6.y;

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('points', vertices);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawHexagon = () => {
                svgEditor.removeEventListener('mousemove', drawHexagon);
                svgEditor.removeEventListener('mouseup', endDrawHexagon);
            }

            svgEditor.addEventListener('mousemove', drawHexagon);
            svgEditor.addEventListener('mouseup', endDrawHexagon);

            changingShapeProperties(shapeSvg);

            break;

        case "square":
            const drawSquare = (event) => {
                const end = svgPoint(svgEditor, event.clientX, event.clientY);
                const sideLength = Math.abs(end.x - start.x);

                const vertex1 = { x: start.x, y: start.y };
                const vertex2 = { x: start.x + sideLength, y: start.y };
                const vertex3 = { x: start.x + sideLength, y: start.y + sideLength };
                const vertex4 = { x: start.x, y: start.y + sideLength };

                const vertices = vertex1.x + "," + vertex1.y + " " + vertex2.x + "," + vertex2.y + " " + vertex3.x + "," + vertex3.y + " " + vertex4.x + "," + vertex4.y;

                shapeSvg.setAttribute('class', 'drawing');
                shapeSvg.setAttribute('style', 'stroke:' + newColor + ";stroke-width:" + newLineWidth);
                shapeSvg.setAttribute('points', vertices);
                svgEditor.appendChild(shapeSvg);
            }

            const endDrawSquare = () => {
                svgEditor.removeEventListener('mousemove', drawSquare);
                svgEditor.removeEventListener('mouseup', endDrawSquare);
            }

            svgEditor.addEventListener('mousemove', drawSquare);
            svgEditor.addEventListener('mouseup', endDrawSquare);

            changingShapeProperties(shapeSvg);

            break;
    }
});

var drawnShapes = [];
let btnUndo = document.getElementById("undo");
let btnRedo = document.getElementById("redo");

svgEditor.addEventListener('mousedown', function () {
    if (drawnShapes.length > 0) {
        drawnShapes = [];
        btnRedo.disabled = true;
    }

    if (svgEditor.childElementCount > 0) {
        btnUndo.disabled = false;
    } else {
        btnUndo.disabled = true;
    }
});

btnUndo.addEventListener("click", function () {
    if (svgEditor.childElementCount > 0 && btnUndo.disabled === false) {
        drawnShapes.push(svgEditor.lastChild);
        svgEditor.removeChild(svgEditor.lastChild);

        if (svgEditor.childElementCount === 0) {
            btnUndo.disabled = true;
        }

        btnRedo.disabled = false;
    }

    if (drawnShapes.length > 0) {
        btnRedo.disabled = false;
    } else {
        btnRedo.disabled = true;
    }
});

btnRedo.addEventListener("click", function () {
    if (drawnShapes.length > 0) {
        svgEditor.appendChild(drawnShapes.pop());

        if (svgEditor.childElementCount === 0) {
            btnUndo.disabled = true;
        }

        if (drawnShapes.length === 0) {
            btnRedo.disabled = true;
        }

        btnUndo.disabled = false;
    }
});

let btnSaveSVG = document.getElementById('saveSVG');
let btnSavePNG = document.getElementById('savePNG');
let btnSaveJPEG = document.getElementById('saveJPEG');

btnSaveSVG.addEventListener('click', function () {
    const svgContent = document.querySelector('svg');
    const data = (new XMLSerializer()).serializeToString(svgContent);

    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'imageSVG.svg';
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

btnSavePNG.addEventListener('click', function () {
    const svgContent = document.querySelector('svg');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = svgContent.clientWidth;
    canvas.height = svgContent.clientHeight;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = (new XMLSerializer()).serializeToString(svgContent);

    const img = new Image();
    img.onload = function () {
        context.drawImage(img, 0, 0);

        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'imagePNG.png';
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(data);
});

btnSaveJPEG.addEventListener('click', function () {
    const svgContent = document.querySelector('svg');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = svgContent.clientWidth;
    canvas.height = svgContent.clientHeight;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = (new XMLSerializer()).serializeToString(svgContent);

    const img = new Image();
    img.onload = function () {
        context.drawImage(img, 0, 0);

        const url = canvas.toDataURL('image/jpeg', 0.8);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'imageJPEG.jpeg';
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(data);
});

function saveDrawing() {
    const svgContent = document.querySelector('svg');
    const drawingData = (new XMLSerializer()).serializeToString(svgContent);
    localStorage.setItem('savedDrawing', drawingData);
}

function loadDrawing() {
    const savedDrawing = localStorage.getItem('savedDrawing');

    if (savedDrawing) {
        const svgEditor = document.getElementById('editor');
        svgEditor.insertAdjacentHTML('beforeend', savedDrawing);
    }
}

window.addEventListener('load', loadDrawing);
window.addEventListener('beforeunload', saveDrawing);