let floorPlatform; 
let boxes; 
let wheels; 
let reactors; 
let tutorialBall;
let firstSprite = null;
let isFrozen = false; 

function setup() {
  new Canvas(windowWidth, windowHeight);
  world.gravity.y = 10;

  document.oncontextmenu = (e) => e.preventDefault();

  floorPlatform = new Sprite(400, windowHeight - 50, 1e5, 60, 'static');
  floorPlatform.color = 'gray';

  boxes = new Group();
  wheels = new Group(); 
  reactors = new Group(); 

  spawnTutorialBall(200, 200);
}

function draw() {
  background(240);

  for (let w of wheels) {
    if (!isFrozen) {
      if (w.customSpeed === undefined) w.customSpeed = 5; 
      w.rotationSpeed = w.customSpeed; 
    } else {
      w.rotationSpeed = 0; 
    }
  }

  if (!isFrozen && frameCount % 125 === 0) {
    for (let r of reactors) {
      r.direction = r.rotation; 
      r.speed = 50; 
    }
  }

  if (mouse.presses('right')) {
    let box = new boxes.Sprite(mouse.x, mouse.y, 40, 40);
    box.color = 'black';
    box.friction = 0.5;
  }

  if (kb.presses('c')) {
    let wheel = new wheels.Sprite(mouse.x, mouse.y, 40);
    wheel.color = 'white';
    wheel.friction = 9999; 
    wheel.customSpeed = 5; 
  }

  if (kb.presses('e')) {
    let reactor = new reactors.Sprite(mouse.x, mouse.y, 40, 40);
    reactor.color = 'green';
    reactor.friction = 5.0; 
    reactor.rotation = -90; 
    reactor.rotationLock = true; 
    
    reactor.draw = () => {
      fill('green');
      stroke(0);
      strokeWeight = 1;
      rect(0, 0, 40, 40); 
      
      fill(255);
      noStroke();
      triangle(-5, -10, -5, 10, 10, 0); 
    };
  }

  if (kb.presses('t')) {
    if (tutorialBall) {
      removeSpriteWithJoints(tutorialBall);
    }
    spawnTutorialBall(mouse.x, mouse.y);
  }

  let allInteractive = [...boxes, ...wheels, ...reactors];
  if (tutorialBall) allInteractive.push(tutorialBall);

  for (let s of allInteractive) {
    if (s && s.mouse.hovering() && mouse.presses('left')) {
      if (!firstSprite) {
        firstSprite = s;
        firstSprite.stroke = 'red'; 
        firstSprite.strokeWeight = 4;
      } else if (firstSprite === s) {
        resetSelection();
      } else {
        let joint = new DistanceJoint(firstSprite, s);
        joint.offsetA.x = 0;
        joint.offsetA.y = 0;
        joint.offsetB.x = 0;
        joint.offsetB.y = 0;
        joint.distance = dist(firstSprite.x, firstSprite.y, s.x, s.y);
        joint.collideConnected = false; 

        resetSelection();
      }
      break; 
    }
  }

  if (firstSprite) {
    if (kb.presses('s')) {
      if (wheels.includes(firstSprite)) {
        firstSprite.customSpeed = -firstSprite.customSpeed;
        if (firstSprite.color === 'white') {
          firstSprite.color = 'blue';
        } else {
          firstSprite.color = 'white';
        }
      } else if (reactors.includes(firstSprite)) {
        firstSprite.rotation += 45; 
      }
      resetSelection();
    }
    
    if (kb.presses('a')) {
      if (firstSprite === tutorialBall) {
        firstSprite.color = 'lightyellow';
        firstSprite.friction = 0.5;
      } else if (reactors.includes(firstSprite)) {
        firstSprite.color = 'green';
        firstSprite.friction = 5.0; 
        firstSprite.rotation = -90;
      } else if (wheels.includes(firstSprite)) {
        firstSprite.color = 'white';
        firstSprite.friction = 9999;
        firstSprite.customSpeed = 5;
      } else {
        firstSprite.color = 'black';
        firstSprite.friction = 0.5;
      }
      resetSelection();
    }
  }

  for (let s of [...boxes, ...wheels, ...reactors]) {
    if (s.y > 2000 || s.y < -2000) {
      if (firstSprite === s) firstSprite = null;
      removeSpriteWithJoints(s);
    }
  }
  
  if (tutorialBall && (tutorialBall.y > 2000 || tutorialBall.y < -2000)) {
    if (firstSprite === tutorialBall) firstSprite = null;
    removeSpriteWithJoints(tutorialBall);
    tutorialBall = null;
  }

  if (mouse.presses('left')) {
    let hoveredAny = false;
    for (let s of [...boxes, ...wheels, ...reactors]) {
      if (s.mouse.hovering()) hoveredAny = true;
    }
    if (tutorialBall && tutorialBall.mouse.hovering()) hoveredAny = true;
    if (!hoveredAny) resetSelection();
  }

  if ((kb.presses('delete') || kb.presses('backspace')) && firstSprite) {
    if (firstSprite === tutorialBall) {
      removeSpriteWithJoints(tutorialBall);
      tutorialBall = null;
    } else {
      removeSpriteWithJoints(firstSprite);
    }
    firstSprite = null;
  }

  
  if (kb.presses('r')) {
    for (let s of [...boxes, ...wheels, ...reactors]) {
      removeSpriteWithJoints(s);
    }
    if (tutorialBall) {
      removeSpriteWithJoints(tutorialBall);
      tutorialBall = null;
    }
    
    boxes.removeAll(); 
    wheels.removeAll();
    reactors.removeAll(); 
    
    resetSelection();
    spawnTutorialBall(200, 200); 
  }

  if (kb.presses('space')) {
    isFrozen = !isFrozen;
    world.timeScale = isFrozen ? 0 : 1;
  }

  updateCamera();
}

function spawnTutorialBall(x, y) {
  tutorialBall = new Sprite(x, y, 180);
  tutorialBall.color = 'lightyellow';
  tutorialBall.friction = 0.5;
  
  tutorialBall.text = 
    "RMB - New Brick\n" +
    "C - New Wheel\n" +
    "LMB - Select\n" +
    "LMB x2 - Joint\n" +
    "E - New Reactor\n" +
    "R - Reset\n" +
    "Backspace - Delete\n" +
    "Space - time stop\n" +
    "S - Action Button (Rotate, etc...)\n" +
    "T - Spawn Tutorial Ball";

  tutorialBall.textColor = 50;
  tutorialBall.textSize = 10; 
  tutorialBall.textRotation = false; 
}

function removeSpriteWithJoints(sprite) {
  if (sprite) {
    while (sprite.joints.length > 0) {
      sprite.joints[0].remove();
    }
    sprite.remove();
  }
}

function updateCamera() {
  let minX = 0;
  let maxX = width;
  let minY = floorPlatform.y - floorPlatform.h / 2;
  let maxY = floorPlatform.y + floorPlatform.h / 2;

  let allObjects = [...boxes, ...wheels, ...reactors];
  if (tutorialBall) allObjects.push(tutorialBall);

  if (allObjects.length > 0) {
    for (let s of allObjects) {
      if (s.x - s.w < minX) minX = s.x - s.w;
      if (s.x + s.w > maxX) maxX = s.x + s.w;
      if (s.y - s.h < minY) minY = s.y - s.h;
      if (s.y + s.h > maxY) maxY = s.y + s.h;
    }
  }

  let padding = 100;
  let sceneWidth = (maxX - minX) + padding * 2;
  let sceneHeight = (maxY - minY) + padding * 2;

  let targetX = (minX + maxX) / 2;
  let targetY = (minY + maxY) / 2;

  let zoomX = width / sceneWidth;
  let zoomY = height / sceneHeight;
  
  let targetZoom = min(zoomX, zoomY);
  if (targetZoom > 1) targetZoom = 1; 

  camera.x = lerp(camera.x, targetX, 0.1);
  camera.y = lerp(camera.y, targetY, 0.1);
  camera.zoom = lerp(camera.zoom, targetZoom, 0.1);
}

function resetSelection() {
  if (firstSprite) {
    firstSprite.stroke = 'black';
    firstSprite.strokeWeight = 1;
    firstSprite = null;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 
