var SQRT2 = Math.sqrt(2);
var SQRT3 = Math.sqrt(3);
var TETRA_Q = SQRT2 / 3;
var TETRA_R = 1.0 / 3;
var TETRA_S = SQRT2 / SQRT3;
var TETRA_T = 2 * SQRT2 / 3;
var GOLDEN_MEAN = (Math.sqrt(5)+1)/2;

var tetrahedronVertices = [
    glMatrix.vec3.fromValues(-TETRA_S, -TETRA_Q, -TETRA_R),
    glMatrix.vec3.fromValues(TETRA_S, -TETRA_Q, -TETRA_R),
    glMatrix.vec3.fromValues(0, TETRA_T, -TETRA_R),
    glMatrix.vec3.fromValues(0, 0, 1)
];

var tetrahedronFaces = 
[
    [tetrahedronVertices[0], tetrahedronVertices[2], tetrahedronVertices[1]],
    [tetrahedronVertices[0], tetrahedronVertices[1], tetrahedronVertices[3]],
    [tetrahedronVertices[0], tetrahedronVertices[3], tetrahedronVertices[2]],
    [tetrahedronVertices[3], tetrahedronVertices[1], tetrahedronVertices[2]]
];

var octahedronVertices = [
    glMatrix.vec3.fromValues(0, 0, 1),
    glMatrix.vec3.fromValues(1, 0, 0),
    glMatrix.vec3.fromValues(0, -1, 0),
    glMatrix.vec3.fromValues(-1, 0, 0),
    glMatrix.vec3.fromValues(0, 1, 0),
    glMatrix.vec3.fromValues(0, 0, -1)
];

var octahedronFaces =
[
    [octahedronVertices[2], octahedronVertices[1], octahedronVertices[0]],
    [octahedronVertices[3], octahedronVertices[2], octahedronVertices[0]],
    [octahedronVertices[4], octahedronVertices[3], octahedronVertices[0]],
    [octahedronVertices[1], octahedronVertices[4], octahedronVertices[0]],
    [octahedronVertices[3], octahedronVertices[4], octahedronVertices[5]],
    [octahedronVertices[4], octahedronVertices[1], octahedronVertices[5]],
    [octahedronVertices[1], octahedronVertices[2], octahedronVertices[5]],
    [octahedronVertices[2], octahedronVertices[3], octahedronVertices[5]]
];

var icosahedronVertices = [
    glMatrix.vec3.fromValues( 1,  GOLDEN_MEAN, 0),
    glMatrix.vec3.fromValues( 1, -GOLDEN_MEAN, 0),
    glMatrix.vec3.fromValues(-1, -GOLDEN_MEAN, 0),
    glMatrix.vec3.fromValues(-1,  GOLDEN_MEAN, 0),
    glMatrix.vec3.fromValues( GOLDEN_MEAN, 0,  1),
    glMatrix.vec3.fromValues(-GOLDEN_MEAN, 0,  1),
    glMatrix.vec3.fromValues(-GOLDEN_MEAN, 0, -1),
    glMatrix.vec3.fromValues( GOLDEN_MEAN, 0, -1),
    glMatrix.vec3.fromValues(0,  1,  GOLDEN_MEAN),
    glMatrix.vec3.fromValues(0,  1, -GOLDEN_MEAN),
    glMatrix.vec3.fromValues(0, -1, -GOLDEN_MEAN),
    glMatrix.vec3.fromValues(0, -1,  GOLDEN_MEAN)
];

var icosahedronFaces =
[
    [icosahedronVertices[8], icosahedronVertices[4], icosahedronVertices[0]],
    [icosahedronVertices[8], icosahedronVertices[0], icosahedronVertices[3]],
    [icosahedronVertices[8], icosahedronVertices[3], icosahedronVertices[5]],
    [icosahedronVertices[8], icosahedronVertices[5], icosahedronVertices[11]],
    [icosahedronVertices[8], icosahedronVertices[11], icosahedronVertices[4]],
    [icosahedronVertices[4], icosahedronVertices[7], icosahedronVertices[0]],
    [icosahedronVertices[0], icosahedronVertices[9], icosahedronVertices[3]],
    [icosahedronVertices[3], icosahedronVertices[6], icosahedronVertices[5]],
    [icosahedronVertices[5], icosahedronVertices[2], icosahedronVertices[11]],
    [icosahedronVertices[11], icosahedronVertices[1], icosahedronVertices[4]],
    [icosahedronVertices[4], icosahedronVertices[1], icosahedronVertices[7]],
    [icosahedronVertices[0], icosahedronVertices[7], icosahedronVertices[9]],
    [icosahedronVertices[3], icosahedronVertices[9], icosahedronVertices[6]],
    [icosahedronVertices[5], icosahedronVertices[6], icosahedronVertices[2]],
    [icosahedronVertices[11], icosahedronVertices[2], icosahedronVertices[1]],
    [icosahedronVertices[10], icosahedronVertices[7], icosahedronVertices[1]],
    [icosahedronVertices[10], icosahedronVertices[9], icosahedronVertices[7]],
    [icosahedronVertices[10], icosahedronVertices[6], icosahedronVertices[9]],
    [icosahedronVertices[10], icosahedronVertices[2], icosahedronVertices[6]],
    [icosahedronVertices[10], icosahedronVertices[1], icosahedronVertices[2]]
];

var currentFaces = tetrahedronFaces;
var vertices = [];
var colors = [];
var polyFrequency = 0;

var templateProgram;
var templateFragmentShaderScript = `#version 300 es

    precision highp float;

    in vec4 v_color;

    out vec4 out_color;

    void main(void) 
    {
        out_color = v_color;
    }
`;

var templateVertexShaderScript = `#version 300 es

    in vec3 a_position; 
    in vec4 a_color;

    out vec4 v_color;

    uniform mat4 u_projectionMatrix;
    uniform mat4 u_modelViewMatrix;

    void main(void) 
    {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
        v_color = a_color;
    }
`;

var lastTime = 0;
var projectionMatrix = glMatrix.mat4.create();
var modelViewMatrix = glMatrix.mat4.create();

var templateVertexArrayObject;
var vertexBuffer;
var colorBuffer;

function initMatrices()
{
    projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.ortho(projectionMatrix, -gl.viewportWidth / 2, gl.viewportWidth / 2, -gl.viewportHeight / 2, gl.viewportHeight / 2, -1000, 1000);

    glMatrix.mat4.identity(modelViewMatrix);
    glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, glMatrix.vec3.fromValues(150.0, 150.0, 150.0));
}

function initBuffers()
{
    // Create buffer on GPU
    vertexBuffer = gl.createBuffer();

    // Say that we're going to use that buffer as the ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Tell attribute how to get data from buffer
    // Create a vertex array object (array of attribute state)
    templateVertexArrayObject = gl.createVertexArray();

    // Make it the current vertex array
    gl.bindVertexArray(templateVertexArrayObject);

    // Turn on the attribute, without this the attribute will be a constant
    // Tell it we're going to be putting stuff from buffer into it.
    gl.enableVertexAttribArray(program.a_position);

    // How to get data out of the buffer, and bind ARRAY_BUFFER to the attribute
    // Attribute will receive data from that ARRAY_BUFFER
    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(program.a_position, size, type, normalize, stride, offset);

    colorBuffer = gl.createBuffer();

    // Say that we're going to use that buffer as the ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Turn on the attribute, without this the attribute will be a constant
    // Tell it we're going to be putting stuff from buffer into it.
    gl.enableVertexAttribArray(program.a_color);

    // How to get data out of the buffer, and bind ARRAY_BUFFER to the attribute
    // Attribute will receive data from that ARRAY_BUFFER
    var size = 4;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(program.a_color, size, type, normalize, stride, offset);
}

function drawScene() 
{
    glMatrix.mat4.rotateY(modelViewMatrix, modelViewMatrix, 0.01);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(templateProgram);
    sendNewMatrices(templateProgram, projectionMatrix, modelViewMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var offset = 0;
    gl.drawArrays(gl.LINES, offset, vertices.length / 3); // Number of vertices, not number of elements!
}

function getSideVector(start, end, frequency)
{
    var sideVector = glMatrix.vec3.clone(end);
    glMatrix.vec3.subtract(sideVector, sideVector, start);
    glMatrix.vec3.divide(sideVector, sideVector, glMatrix.vec3.fromValues(frequency + 1.0, frequency + 1.0, frequency + 1.0));
    return sideVector;
}

function getNewVertices(faceVertices, frequency)
{
    if (faceVertices.length != 3)
    {
        throw "Not a triangular face";
    }

    if (frequency <= 0)
    {
        var newFaceVertices = [];

        newFaceVertices[0] = glMatrix.vec3.clone(faceVertices[0]);
        glMatrix.vec3.normalize(newFaceVertices[0], newFaceVertices[0]);

        newFaceVertices[1] = glMatrix.vec3.clone(faceVertices[1]);
        glMatrix.vec3.normalize(newFaceVertices[1], newFaceVertices[1]);

        newFaceVertices[2] = glMatrix.vec3.clone(faceVertices[2]);
        glMatrix.vec3.normalize(newFaceVertices[2], newFaceVertices[2]);

        return [...newFaceVertices[0], ...newFaceVertices[1], ...newFaceVertices[1], ...newFaceVertices[2], ...newFaceVertices[2], ...newFaceVertices[0]];
    }

    var sideVector1 = getSideVector(faceVertices[0], faceVertices[1], frequency);
    var sideVector2 = getSideVector(faceVertices[1], faceVertices[2], frequency);

    // Triangle rows
    var newFaceVertices = [];
    for (var row = 0; row < frequency + 1; row++)
    {
        var start = glMatrix.vec3.clone(sideVector1);
        glMatrix.vec3.multiply(start, start, glMatrix.vec3.fromValues(row, row, row));
        glMatrix.vec3.add(start, start, faceVertices[0]);

        // Triangles in each row
        for (var column = 0; column < row + 1; column++)
        {
            var vertex1 = glMatrix.vec3.clone(start);

            var vertex2 = glMatrix.vec3.clone(start);
            glMatrix.vec3.add(vertex2, vertex2, sideVector1);

            var vertex3 = glMatrix.vec3.clone(vertex2);
            glMatrix.vec3.add(vertex3, vertex3, sideVector2);

            var vertex4 = glMatrix.vec3.clone(vertex3);

            glMatrix.vec3.normalize(vertex1, vertex1);
            glMatrix.vec3.normalize(vertex2, vertex2);
            glMatrix.vec3.normalize(vertex3, vertex3);

            newFaceVertices.push(...vertex1, ...vertex2, ...vertex2, ...vertex3, ...vertex3, ...vertex1);
            if (column != row) // Last iteration we only want 1 triangle
            {
                glMatrix.vec3.subtract(vertex4, vertex4, sideVector1);

                start = glMatrix.vec3.clone(vertex4);

                glMatrix.vec3.normalize(vertex4, vertex4);
                newFaceVertices.push(...vertex1, ...vertex3, ...vertex3, ...vertex4, ...vertex4, ...vertex1);
            }
        }
    }

    return newFaceVertices;
}

function handleKeys(key)
{
    switch (key.code)
    {
        case 'KeyX':
            polyFrequency += 1;
            break;
        case 'KeyZ':
            polyFrequency -= 1;
            polyFrequency = Math.max(0, polyFrequency);
            break;
        case 'KeyT':
            currentFaces = tetrahedronFaces;
            break;
        case 'KeyO':
            currentFaces = octahedronFaces;
            break;
        case 'KeyI':
            currentFaces = icosahedronFaces;
            break;
    }

    vertices = [];
    currentFaces.forEach(face => vertices.push(...getNewVertices([face[0], face[1], face[2]], polyFrequency)));

    colors = [];
    for (var i = 0; i < vertices.length / 3; i++)
    {
        colors.push(Math.random(), Math.random(), Math.random(), 1.0);
    }
}


function tick(now)
{
    drawScene();
    if (lastTime != 0) 
    {
        var elapsed = now - lastTime;
    }

    lastTime = now;
    requestAnimationFrame(tick);
}

function linesStart() 
{
    document.addEventListener('keypress', handleKeys);

    var canvas = document.getElementById("lines");
    initGl(canvas);

    initMatrices();

    templateProgram = createProgram(templateFragmentShaderScript, templateVertexShaderScript);
    getLocations(templateProgram);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    initBuffers();

    tick();
}
