

/*
Algorithm inspired by the one described by Matt DesLauriers in this talk: https://youtube.com/watch?v=tPqGn-4VdgA
 "1. use a large set of random 2D points
 2. select a cluster of points and outline it
 3. remove these points from the data set
 4. repeat from step 2 on remaining points"
 */
//orbit
const sensitivityX = 2;
const sensitivityY = 1;
const sensitivityZ = 0.1;
const scaleFactor = 100;
let pg;
let cam;

let clusters = [];
let hulls = [];
let w;


var temp = 0;
var t = 0;

function setup() {
  w = requestWeather(42.3596764, -71.0958358);

  //createCanvas(windowWidth, windowHeight);

  createCanvas(780, 1688);//The ratio of 12Pro


  let size = min(width, height)*0.95;
  let heightbuffer = height/2 - 30;
  let widthbuffer = width/2 - 30;
  noStroke();
  fill(255);

  let points = [];
  for (let i = 0; i < 1500; i++) {
    //points.push(createVector(width/2+random(-size/2, size/2), height/2+random(-size/2, size/2)));
    points.push(createVector(width/2+random(-widthbuffer, widthbuffer), height/2 + random(-heightbuffer, heightbuffer)));
  }

  clusters = divide(points);
  hulls = [convexHull(clusters[0]), convexHull(clusters[1])];

  //orbit
  pg = createGraphics(100, 100, WEBGL);
  cam = pg.createCamera();
  //
}

function draw() {
  if (w.ready) {
    temp = w.getTemperature();

    if (temp != t) {
      for (let j = 0; j < temp; j++) {
        mouseX = random(0, width);
        mouseY = random(0, height);
        mouseReleased();
      }
      background(0, 92, 132);
      for (let hull of hulls) {
        if (hull.length > 3) {
          beginShape();
          for (let p of hull) {
            vertex(p.x, p.y);
          }
          endShape(CLOSE);
        }
      }
      t = temp;
    }
  }

  //earth
  //background(205, 102, 94);
  pg.clear();
  pg.sphere(40);
  image(pg, 0, 0);
  
  textSize(50);
  fill(0);
  text(temp, width/2, height/2);
}

function mouseReleased() {
  let p = createVector(mouseX, mouseY);
  fill(255);
  let argmin = -1;
  let minDist = width*height;

  for (let i = 0; i < clusters.length; i++) {
    for (let q of clusters[i]) {
      let d = distSquared(p, q);
      if (d < minDist) {
        argmin = i;
        minDist = d;
        continue;
      }
    }
  }

  if (hulls[argmin].length > 5) {
    let clu = clusters.splice(argmin, 1)[0];
    let newClusters = divide(clu);
    clusters = [...clusters, ...newClusters];
    hulls.splice(argmin, 1);
    hulls = [...hulls, convexHull(newClusters[0]), convexHull(newClusters[1])];
  }

  return false;
}

// divide points into two convex clusters
function divide(points) {
  let clusters = [];

  // initialize centroids randomly
  let centroids = [];
  for (let i = 0; i < 2; i++) {
    let c;
    do {
      c = random(points);
    } while (centroids.indexOf(c) != -1)
      centroids.push(c);
    clusters.push([]);
  }

  // assign clusters
  for (let p of points) {
    let argmin = 0;
    let minDist = distSquared(p, centroids[0]);
    for (let i = 1; i < 2; i++) {
      let d = distSquared(p, centroids[i]);
      if (d < minDist) {
        minDist = d;
        argmin = i;
      }
    }
    clusters[argmin].push(p);
  }

  return clusters;
}

function convexHull(points) {
  // adapted from https://en.wikipedia.org/wiki/Gift_wrapping_algorithm#Pseudocode
  points.sort((p, q) => p.x - q.x);
  let hull = [];
  let i = 0;
  let endPoint;
  let pointOnHull = points[0];
  do {
    hull.push(pointOnHull);
    endPoint = points[0];
    for (let j = 0; j < points.length; j++) {
      let p = p5.Vector.sub(endPoint, pointOnHull);
      let q = p5.Vector.sub(points[j], pointOnHull);
      if (endPoint.equals(pointOnHull) || (p.cross(q)).z < 0) {
        endPoint = points[j];
      }
    }
    i++;
    pointOnHull = endPoint;
  } while (!endPoint.equals(points[0]));
  return hull;
}

function distSquared(p, q) {
  return sq(p.x - q.x) + sq(p.y - q.y);
}

//orbit
function mouseDragged() {
  const deltaTheta =
    (-sensitivityX * (mouseX - pmouseX)) / scaleFactor;
  const deltaPhi =
    (sensitivityY * (mouseY - pmouseY)) / scaleFactor;
  cam._orbit(deltaTheta, deltaPhi, 0);
}

function mouseWheel(event) {
  if (event.delta > 0) {
    cam._orbit(0, 0, sensitivityZ * scaleFactor);
  } else {
    cam._orbit(0, 0, -sensitivityZ * scaleFactor);
  }
}
//End

//Save image
function keyPressed() {
  save("img_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() + ".jpg");
}
