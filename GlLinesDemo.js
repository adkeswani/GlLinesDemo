var SQRT2 = Math.sqrt(2);
var SQRT3 = Math.sqrt(3);
var TETRA_Q = SQRT2 / 3;
var TETRA_R = 1.0 / 3;
var TETRA_S = SQRT2 / SQRT3;
var TETRA_T = 2 * SQRT2 / 3;
var GOLDEN_MEAN = (Math.sqrt(5)+1)/2;

var tetrahedronVertices = [
    [-TETRA_S, -TETRA_Q, -TETRA_R,],
    [TETRA_S, -TETRA_Q, -TETRA_R],
    [0, TETRA_T, -TETRA_R],
    [0, 0, 1]
];

/*
PRIMITIVES = {
    :tetrahedron => {
        :points => {
            'a' => Vector[ -TETRA_S, -TETRA_Q, -TETRA_R ],
            'b' => Vector[  TETRA_S, -TETRA_Q, -TETRA_R ],
            'c' => Vector[        0,  TETRA_T, -TETRA_R ],
            'd' => Vector[        0,        0,        1 ]
        },
        :faces => %w| acb abd adc dbc |
    },

    :octahedron => {
        :points => {
            'a' => Vector[  0,  0,  1 ],
            'b' => Vector[  1,  0,  0 ],
            'c' => Vector[  0, -1,  0 ],
            'd' => Vector[ -1,  0,  0 ],
            'e' => Vector[  0,  1,  0 ],
            'f' => Vector[  0,  0, -1 ]
        },
        :faces => %w| cba dca eda bea
                      def ebf bcf cdf |
    },
    :icosahedron => {
        :points => {
            'a' => Vector[  1,  GOLDEN_MEAN, 0 ],
            'b' => Vector[  1, -GOLDEN_MEAN, 0 ],
            'c' => Vector[ -1, -GOLDEN_MEAN, 0 ],
            'd' => Vector[ -1,  GOLDEN_MEAN, 0 ],
            'e' => Vector[  GOLDEN_MEAN, 0,  1 ],
            'f' => Vector[ -GOLDEN_MEAN, 0,  1 ],
            'g' => Vector[ -GOLDEN_MEAN, 0, -1 ],
            'h' => Vector[  GOLDEN_MEAN, 0, -1 ],
            'i' => Vector[ 0,  1,  GOLDEN_MEAN ],
            'j' => Vector[ 0,  1, -GOLDEN_MEAN ],
            'k' => Vector[ 0, -1, -GOLDEN_MEAN ],
            'l' => Vector[ 0, -1,  GOLDEN_MEAN ]
        },
        :faces => %w| iea iad idf ifl ile
                      eha ajd dgf fcl lbe
                      ebh ahj djg fgc lcb
                      khb kjh kgj kcg kbc |
    }
}
*/

var templateProgram;
var templateFragmentShaderScript = `#version 300 es

    precision highp float;

    uniform vec4 u_color;

    out vec4 out_color;

    void main(void) 
    {
        out_color = u_color;
    }
`;

var templateVertexShaderScript = `#version 300 es

    in vec3 a_position; 

    uniform mat4 u_projectionMatrix;
    uniform mat4 u_modelViewMatrix;

    void main(void) 
    {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
    }
`;

var templateVertexArrayObject;
var lastTime = 0;
var projectionMatrix = glMatrix.mat4.create();
var modelViewMatrix = glMatrix.mat4.create();

function initMatrices()
{
    projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.ortho(projectionMatrix, -gl.viewportWidth / 2, gl.viewportWidth / 2, -gl.viewportHeight / 2, gl.viewportHeight / 2, -1000, 1000);

    glMatrix.mat4.identity(modelViewMatrix);
    glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, glMatrix.vec3.fromValues(50.0, 50.0, 50.0));
}

function initBuffers()
{
    // Create buffer on GPU
    var vertexBuffer = gl.createBuffer();

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
}

function drawScene() 
{
    glMatrix.mat4.rotateY(modelViewMatrix, modelViewMatrix, 0.1);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(templateProgram);
    sendNewMatrices(templateProgram, projectionMatrix, modelViewMatrix);

    sendNewColor(templateProgram, [Math.random(), Math.random(), Math.random(), Math.random()]);

    var vertices = [];
    vertices.push(...tetrahedronVertices[0], ...tetrahedronVertices[2], ...tetrahedronVertices[2], ...tetrahedronVertices[1], ...tetrahedronVertices[1], ...tetrahedronVertices[0]);
    vertices.push(...tetrahedronVertices[0], ...tetrahedronVertices[1], ...tetrahedronVertices[1], ...tetrahedronVertices[3], ...tetrahedronVertices[3], ...tetrahedronVertices[0]);
    vertices.push(...tetrahedronVertices[0], ...tetrahedronVertices[3], ...tetrahedronVertices[3], ...tetrahedronVertices[2], ...tetrahedronVertices[2], ...tetrahedronVertices[0]);
    vertices.push(...tetrahedronVertices[3], ...tetrahedronVertices[1], ...tetrahedronVertices[1], ...tetrahedronVertices[2], ...tetrahedronVertices[2], ...tetrahedronVertices[3]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    var offset = 0;
    gl.drawArrays(gl.LINES, offset, 18);
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
