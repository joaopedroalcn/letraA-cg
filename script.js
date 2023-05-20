let gl;
let shaderProgram;

let vertices = [
  -0.5, -0.5, 0.0,
  0.5, -0.5, 0.0,
  0.0, 0.5, 0.0
];

let rotation = 0.0;
let translation = [0.0, 0.0];

let selected = false;

let objectColor = [0.0, 1.0, 0.0, 1.0];

let colorIndex = 0;
let colors = [
  [1.0, 0.0, 0.0, 1.0], // Vermelho
  [0.0, 1.0, 0.0, 1.0], // Verde
  [0.0, 0.0, 1.0, 1.0]  // Azul
];


function main() {
  const canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl");

  if (!gl) {
    console.error("WebGL is not supported");
    return;
  }

  // Create shaders and program
  const vertexShaderSource = `
        attribute vec3 aPosition;
        uniform mat4 uModelMatrix;
        void main() {
            gl_Position = uModelMatrix * vec4(aPosition, 1.0);
        }
    `;
  const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 uColor;
        void main() {
            gl_FragColor = uColor;
        }
    `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  shaderProgram = createProgram(gl, vertexShader, fragmentShader);

  // Set up vertex buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  // Set clear color and initial model matrix
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Register mouse event listeners
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);

  // Start rendering
  render();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);
  return program;
}


function isPointInTriangle(point) {
  const v0 = [vertices[0], vertices[1], vertices[2]];
  const v1 = [vertices[3], vertices[4], vertices[5]];
  const v2 = [vertices[6], vertices[7], vertices[8]];

  const edge0 = glMatrix.vec3.sub([], v1, v0);
  const edge1 = glMatrix.vec3.sub([], v2, v0);
  const pointVec = glMatrix.vec3.sub([], point, v0);

  const cross0 = glMatrix.vec3.cross([], edge0, pointVec);
  const cross1 = glMatrix.vec3.cross([], edge1, pointVec);

  return glMatrix.vec3.dot(cross0, cross1) >= 0;
}

function updateModelMatrix() {
  const modelMatrix = glMatrix.mat4.create();
  glMatrix.mat4.translate(modelMatrix, modelMatrix, [translation[0], translation[1], 0.0]);
  glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, rotation);

  const uModelMatrix = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  updateModelMatrix();

  const uColor = gl.getUniformLocation(shaderProgram, "uColor");
  gl.uniform4fv(uColor, objectColor);

  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

  requestAnimationFrame(render);
}


let lastMouseX = 0;
let lastMouseY = 0;
let dragging = false;

function handleMouseDown(event) {
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  dragging = true;

  // Verificar se o clique ocorreu dentro do triângulo
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width * 2 - 1;
  const y = (event.clientY - rect.top) / rect.height * -2 + 1;

  selected = isPointInTriangle([x, y, 0]);

  if (event.detail === 2) { // Verificar se é um duplo clique
    // Alternar para a próxima cor na lista de cores
    colorIndex = (colorIndex + 1) % colors.length;
  }

  // Definir a cor do objeto com base no estado de seleção e no índice de cor atual
  objectColor = selected ? colors[colorIndex] : [0.0, 1.0, 0.0, 1.0];
}

function handleMouseMove(event) {
  if (!dragging) return;

  const deltaX = event.clientX - lastMouseX;
  const deltaY = event.clientY - lastMouseY;
  rotation += deltaX * 0.01;
  translation[0] += deltaX * 0.01;
  translation[1] -= deltaY * 0.01;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function handleMouseUp() {
  dragging = false;
}
main();