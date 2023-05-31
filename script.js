let gl;
let shaderProgram;
let vertices = [
  -0.5, -0.5, 0.0,
  0.5, -0.5, 0.0,
  0.0, 0.5, 0.0];

let rotation = 0.0;
let translation = [0.0, 0.0];
let objectColor = [0.0, 1.0, 0.0, 1.0];

let lastMouseX = 0;
let lastMouseY = 0;
let dragging = false;

let rotateButton = document.getElementById("rotateButton");
let canvas = document.getElementById("canvas");

rotateButton.addEventListener("click", rotateObject);

canvas.addEventListener("click", changeColor);
canvas.addEventListener("mousemove", translateObject);

function main() {
  gl = canvas.getContext("webgl");

  if (!gl) {
    console.error("WebGL não é suportado");
    return;
  }

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

  const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  shaderProgram = createProgram(gl, vertexShader, fragmentShader);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW
  );

  const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);


  gl.clearColor(0.0, 0.0, 0.0, 1.0);


  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);

  render();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "Compilação do Shader Falhou:",
      gl.getShaderInfoLog(shader)
    );
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
    console.error(
      "Falha na vinculação do programa:",
      gl.getProgramInfoLog(program)
    );
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);
  return program;
}

function updateModelMatrix() {
  const modelMatrix = mat4.create();
  mat4.translate(modelMatrix, modelMatrix, [
    translation[0],
    translation[1],
    0.0,
  ]);
  mat4.rotateZ(modelMatrix, modelMatrix, rotation);

  const uModelMatrix = gl.getUniformLocation(
    shaderProgram,
    "uModelMatrix"
  );
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

function rotateObject() {
  rotation += 0.01;
}


function handleMouseUp() {
  canvas.removeEventListener("mousemove", translateObject);
  dragging = false;
}


function translateObject(event) {
  if (dragging) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    translation[0] = (x - canvas.width / 2) / (canvas.width / 2);
    translation[1] = (canvas.height / 2 - y) / (canvas.height / 2);
  }
}

function changeColor() {
  objectColor = getRandomColor();
}

function getRandomColor() {
  return [Math.random(), Math.random(), Math.random(), 1.0];
}

function handleMouseDown(event) {
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
  dragging = true;
}

function handleMouseMove(event) {
  if (dragging) {
    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;
    translation[0] += deltaX * 0.005;
    translation[1] -= deltaY * 0.005;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }
}

main();