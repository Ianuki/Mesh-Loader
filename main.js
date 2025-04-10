class vector3 {
  constructor(i, j, k) { this.i = i; this.j = j; this.k = k; }
}
  
class vector2 {
  constructor(i, j) { this.i = i; this.j = j; }
}
  
class line {
  constructor(a, b) { this.a = a; this.b = b; }
}
  
function project(point, camera_position, camera_rotation) {
  return new vector2(
    point.i * FOCAL_LENGTH / (point.k - camera_position.k),
    point.j * FOCAL_LENGTH / (point.k - camera_position.k)  
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
  
const lines = [
  new line(0, 1),
  new line(0, 2),
  new line(1, 3),
  new line(3, 2),
  new line(4, 5),
  new line(4, 6),
  new line(5, 7),
  new line(7, 6),
  new line(0, 4),
  new line(1, 5),
  new line(2, 6),
  new line(3, 7),
]
  
let camera_position = new vector3(0, 0, -10);
let camera_rotation = new vector3(0, 0, 0);
  
let context = CANVAS.getContext("2d");
  
let x_rotation = 0;
let y_rotation = 0;
let z_rotation = 0;
  
const render = async () => { 
  context.clearRect(0, 0, CANVAS.width, CANVAS.height);
  
  for (let i = 0; i < lines.length; i++) {
    let point_a = vertices[lines[i].a]; point_a = rotate_x(point_a, x_rotation); point_a = rotate_y(point_a, y_rotation); point_a = rotate_z(point_a, z_rotation);
    let point_b = vertices[lines[i].b]; point_b = rotate_x(point_b, x_rotation); point_b = rotate_y(point_b, y_rotation); point_b = rotate_z(point_b, z_rotation);
    let projected_point_a = project(point_a, camera_position, camera_rotation);
    let projected_point_b = project(point_b, camera_position, camera_rotation);
 
    context.beginPath()
    context.strokeStyle = "white";
    context.moveTo(projected_point_a.i + CANVAS.width / 2, projected_point_a.j + CANVAS.height / 2);
    context.lineTo(projected_point_b.i + CANVAS.width / 2, projected_point_b.j + CANVAS.height / 2);
    context.stroke();
  }

  for (let i = 0; i < vertices.length; i++) {
    let point = vertices[i]; point = rotate_x(point, x_rotation); point = rotate_y(point, y_rotation); point = rotate_z(point, z_rotation);
    let projected_point = project(point, camera_position, camera_rotation);

    context.fillStyle = "rgb(0, 255, 136)";
    context.fillRect(projected_point.i + CANVAS.width / 2 - 2.5, projected_point.j + CANVAS.height / 2 - 2.5, 5, 5);
  }

  x_rotation += Math.PI / 180;
  y_rotation += Math.PI / 360;
    
  requestAnimationFrame(render);
}

document.getElementById("input").addEventListener("change", function (event) {
  let file = event.target.files[0];
  let reader = new FileReader();

  reader.onload = function (event) {
    vertices.length = 0;
    vertices.length = 0;

    let array_buffer = event.target.result;
    let array = new Uint8Array(array_buffer);
    let character_array = [];
    array.forEach(element => {
      character_array.push(String.fromCharCode(element));
    });

    let file_contents_array = character_array.join("").split(" ");
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
        
        lines.push(new line(A, B));
        lines.push(new line(B, C));
        lines.push(new line(C, A));
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

window.addEventListener("keypress", function (e) { 
  e = e || window.event; 
  let char_code = e.keyCode || e.which; 
  
  if (char_code == 115) {
    camera_position.k -= 1;
  }
  else if (char_code == 119) {
    camera_position.k += 1;
  }

}, false);

  
requestAnimationFrame(render);
