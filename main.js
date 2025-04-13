class vector3 {
  constructor(i, j, k) { this.i = i; this.j = j; this.k = k; }
}
  
class vector2 {
  constructor(i, j) { this.i = i; this.j = j; }
}
  
class line {
  constructor(a, b) { this.a = a; this.b = b; }
}

class triangle {
  constructor(a, b, c) { this.a = a; this.b = b; this.c = c; }
}
  
function project(point, camera_position, camera_rotation) {
  point = rotate_y(point, camera_rotation.j);
  point = rotate_x(point, camera_rotation.i);

  return new vector2(
    (point.i * FOCAL_LENGTH) / (point.k - camera_position.k),
    ((point.j - camera_position.j) * FOCAL_LENGTH) / (point.k - camera_position.k)  
  )
}
  
function rotate_x(point, rotation) {
  return new vector3(
    point.i,
    point.j * Math.cos(rotation) - point.k * Math.sin(rotation),
    point.j * Math.sin(rotation) + point.k * Math.cos(rotation),
  )
}
  
function rotate_y(point, rotation) {
  return new vector3(
    point.i * Math.cos(rotation) + point.k * Math.sin(rotation),
    point.j,
    point.i * -Math.sin(rotation) + point.k * Math.cos(rotation),
  )
}
  
function rotate_z(point, rotation) {
  return new vector3(
    point.i * Math.cos(rotation) - point.j * Math.sin(rotation),
    point.i * Math.sin(rotation) + point.j * Math.cos(rotation),
    point.k,
  )
}
  
const CANVAS = document.getElementById("screen");
const FOCAL_LENGTH = 300;
  
let vertices = [
  new vector3(1, 1, 1),
  new vector3(-1, 1, 1),
  new vector3(1, -1, 1),
  new vector3(-1, -1, 1),
  new vector3(1, 1, -1),
  new vector3(-1, 1, -1),
  new vector3(1, -1, -1),
  new vector3(-1, -1, -1),
];
  
let triangles = []

let camera_position = new vector3(0, 0, -10);
let camera_rotation = new vector3(0, 0, 0);
  
let context = CANVAS.getContext("2d");
  
let x_rotation = 0;
let y_rotation = 0;
let z_rotation = 0;
  
const render = async () => { 
  context.clearRect(0, 0, CANVAS.width, CANVAS.height);
  
  for (let i = 0; i < triangles.length; i++) {
    let point_a = vertices[triangles[i].a];
    let point_b = vertices[triangles[i].b];
    let point_c = vertices[triangles[i].c];
    let projected_point_a = project(point_a, camera_position, camera_rotation);
    let projected_point_b = project(point_b, camera_position, camera_rotation);
    let projected_point_c = project(point_c, camera_position, camera_rotation);
 
    let path = new Path2D();
    context.fillStyle = "rgba(255, 255, 255, 0.2)";
    context.strokeStyle = "rgb(0, 255, 136)";
    path.moveTo(projected_point_a.i + CANVAS.width / 2, projected_point_a.j + CANVAS.height / 2);
    path.lineTo(projected_point_b.i + CANVAS.width / 2, projected_point_b.j + CANVAS.height / 2);
    path.lineTo(projected_point_c.i + CANVAS.width / 2, projected_point_c.j + CANVAS.height / 2);
    context.fill(path);

    context.beginPath()
    context.strokeStyle = "rgba(0, 255, 136, 0.2)";
    context.moveTo(projected_point_a.i + CANVAS.width / 2, projected_point_a.j + CANVAS.height / 2);
    context.lineTo(projected_point_b.i + CANVAS.width / 2, projected_point_b.j + CANVAS.height / 2);
    context.lineTo(projected_point_c.i + CANVAS.width / 2, projected_point_c.j + CANVAS.height / 2);
    context.stroke();
  }

  for (let i = 0; i < vertices.length; i++) {
    let point = vertices[i];
    let projected_point = project(point, camera_position, camera_rotation);

    context.fillStyle = "rgb(0, 255, 136)";
    context.fillRect(projected_point.i + CANVAS.width / 2, projected_point.j + CANVAS.height / 2, 1, 1);
  }
    
  requestAnimationFrame(render);
}

document.getElementById("input").addEventListener("change", function (event) {
  let file = event.target.files[0];
  let reader = new FileReader();

  reader.onload = function (event) {
    vertices.length = 0;
    triangles.length = 0;

    let array_buffer = event.target.result;
    let array = new Uint8Array(array_buffer);
    let character_array = [];
    array.forEach(element => {
      character_array.push(String.fromCharCode(element));
    });

    let unfiltered_file_contents_array = character_array.join("").split(" ");
    let file_contents_array = [];
    unfiltered_file_contents_array.forEach(element => {
      element.split("\n").forEach(_element => {
        file_contents_array.push(_element);
      });
    });
    console.log(file_contents_array);
    
    for (let i = 0; i < file_contents_array.length; i++) {
      if (file_contents_array[i] == "v") {
        vertices.push(new vector3(
          file_contents_array[i + 1] * 1,
          file_contents_array[i + 2] * 1,
          file_contents_array[i + 3] * 1
        ))
      }

      if (file_contents_array[i] == "f") {
        A = file_contents_array[i + 1].split("/")[0] - 1;
        B = file_contents_array[i + 2].split("/")[0] - 1;
        C = file_contents_array[i + 3].split("/")[0] - 1;
        
        triangles.push(new triangle(A, B, C));
      }
    }

    console.log(vertices.length)
  }

  reader.readAsArrayBuffer(file);
})

window.onload = window.onresize = function() {
  var canvas = document.getElementById("screen");
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.85;
}

let mouse_x = 0, mouse_y = 0;
let mouse_down = 0;

window.onmousedown = () => {
  mouse_down = 1;
}
window.onmouseup = () => {
  mouse_down = 0;
}

addEventListener("mousemove", (event) => {
  if (mouse_down == 1) {
    camera_rotation.j -= event.movementX * Math.PI / 360;
    camera_rotation.i += event.movementY * Math.PI / 360;
  }
});

window.addEventListener("keypress", function (e) { 
  e = e || window.event; 
  let char_code = e.keyCode || e.which; 
  let char = String.fromCharCode(char_code);
  
  if (char == "s") {
    camera_position.k -= 1;
  }
  else if (char == "w") {
    camera_position.k += 1;
  }
  else if (char == "q") {
    camera_position.j -= 1;
  }
  else if (char == "e") {
    camera_position.j += 1;
  }

}, false);


  
requestAnimationFrame(render);
