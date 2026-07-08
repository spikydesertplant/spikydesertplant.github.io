let floorPlatform; 
let boxes; 
let wheels; 
let reactors; 
let supersolids; 
let tutorialBall;

let selectedSprites = []; 
let isFrozen = false; 
let statusText = ""; 
let statusTimer = 0;

let worldJoints = []; 

function setup() {
  new Canvas(windowWidth, windowHeight);
  world.gravity.y = 10;

  document.oncontextmenu = (e) => e.preventDefault();

  floorPlatform = new Sprite(400, windowHeight - 50, 1e5, 60, 'static');
  floorPlatform.color = 'gray';

  boxes = new Group();
  wheels = new Group(); 
  reactors = new Group(); 
  supersolids = new Group(); 

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

  if (kb.presses('g')) { 
    let ss = new supersolids.Sprite(mouse.x, mouse.y, 40, 40, 'static');
    ss.color = 'purple';
    ss.friction = 0.5;
  }

  if (kb.presses('e')) {
    createReactorSprite(mouse.x, mouse.y, -90);
  }

  if (kb.presses('t')) {
    if (tutorialBall) removeSpriteWithJoints(tutorialBall);
    spawnTutorialBall(mouse.x, mouse.y);
  }

  
  let allInteractive = [...boxes, ...wheels, ...reactors, ...supersolids];
  if (tutorialBall) allInteractive.push(tutorialBall);

  for (let s of allInteractive) {
    if (s && s.mouse.hovering() && mouse.presses('left')) {
      if (kb.holding('shift')) {
        if (selectedSprites.includes(s)) {
          unselectSingle(s);
        } else {
          selectSingle(s);
        }
      } else {
        if (selectedSprites.includes(s) && selectedSprites.length === 1) {
          clearAllSelection();
        } else if (selectedSprites.length === 1 && !selectedSprites.includes(s)) {
          selectSingle(s);
          createCustomJoint(selectedSprites[0], selectedSprites[1]);
          clearAllSelection();
        } else {
          clearAllSelection();
          selectSingle(s);
        }
      }
      break; 
    }
  }

  
  if (selectedSprites.length > 0) {
    if (kb.presses('s')) {
      for (let s of selectedSprites) {
        if (wheels.includes(s)) {
          s.customSpeed = -s.customSpeed;
          s.color = (s.color === 'white' || s.color === '#ffffff') ? 'blue' : 'white';
        } else if (reactors.includes(s)) {
          s.rotation += 45; 
        }
      }
      clearAllSelection();
    }
    
    if (kb.presses('a')) {
      for (let s of selectedSprites) {
        if (s === tutorialBall) {
          s.color = 'lightyellow'; s.friction = 0.5;
        } else if (reactors.includes(s)) {
          s.color = 'green'; s.friction = 5.0; s.rotation = -90;
        } else if (wheels.includes(s)) {
          s.color = 'white'; s.friction = 9999; s.customSpeed = 5;
        } else if (supersolids.includes(s)) {
          s.color = 'purple'; s.friction = 0.5; s.collider = 'static';
        } else {
          s.color = 'black'; s.friction = 0.5;
        }
      }
      clearAllSelection();
    }
  }

  
  if (kb.presses('u')) {
    if (selectedSprites.length > 0) {
      let avgX = 0, avgY = 0;
      for (let s of selectedSprites) { avgX += s.x; avgY += s.y; }
      avgX /= selectedSprites.length; avgY /= selectedSprites.length;

      let packageSprites = [];
      let packageJoints = [];

      for (let i = 0; i < selectedSprites.length; i++) {
        let s = selectedSprites[i];
        if (!s) continue;
        s.copyId = i; 

        let type = 'box';
        if (wheels.includes(s)) type = 'wheel';
        if (reactors.includes(s)) type = 'reactor';
        if (supersolids.includes(s)) type = 'supersolid';
        if (s === tutorialBall) type = 'tutorial';

        
        let savedColor = s.color.toString(); 

        packageSprites.push({
          id: i,
          type: type,
          offsetX: s.x - avgX,
          offsetY: s.y - avgY,
          color: savedColor, 
          friction: s.friction,
          rotation: s.rotation,
          customSpeed: s.customSpeed
        });
      }

      for (let j of worldJoints) {
        if (j && j.spriteA && j.spriteB) {
          if (selectedSprites.includes(j.spriteA) && selectedSprites.includes(j.spriteB)) {
            packageJoints.push({
              idA: j.spriteA.copyId,
              idB: j.spriteB.copyId
            });
          }
        }
      }

      let finalString = JSON.stringify({ sprites: packageSprites, joints: packageJoints });
      
      navigator.clipboard.writeText(finalString).then(() => {
        statusText = "Copied to clipboard!";
        statusTimer = 90; 
      }).catch(err => {
        statusText = "Clipboard error!";
        statusTimer = 90;
      });
    }
  }

  
  if (kb.presses('i')) {
    navigator.clipboard.readText().then(text => {
      try {
        let data = JSON.parse(text);
        if (!data.sprites) return;

        clearAllSelection();
        let newlyCreatedSprites = {}; 

        for (let sData of data.sprites) {
          let spawnX = mouse.x + sData.offsetX;
          let spawnY = mouse.y + sData.offsetY;
          let newSprite;

          if (sData.type === 'box') {
            newSprite = new boxes.Sprite(spawnX, spawnY, 40, 40);
            newSprite.color = sData.color; 
            newSprite.friction = sData.friction;
          } else if (sData.type === 'wheel') {
            newSprite = new wheels.Sprite(spawnX, spawnY, 40);
            newSprite.color = sData.color; 
            newSprite.friction = sData.friction;
            newSprite.customSpeed = sData.customSpeed;
          } else if (sData.type === 'supersolid') {
            newSprite = new supersolids.Sprite(spawnX, spawnY, 40, 40, 'static');
            newSprite.color = sData.color; 
            newSprite.friction = sData.friction;
          } else if (sData.type === 'reactor') {
            newSprite = createReactorSprite(spawnX, spawnY, sData.rotation);
            newSprite.color = sData.color; 
            newSprite.friction = sData.friction;
          } else if (sData.type === 'tutorial') {
            if (tutorialBall) removeSpriteWithJoints(tutorialBall);
            spawnTutorialBall(spawnX, spawnY);
            newSprite = tutorialBall;
          }

          if (newSprite) {
            newSprite.color = sData.color; 
            newlyCreatedSprites[sData.id] = newSprite;
            selectSingle(newSprite); 
          }
        }

        if (data.joints) {
          for (let jData of data.joints) {
            let sprA = newlyCreatedSprites[jData.idA];
            let sprB = newlyCreatedSprites[jData.idB];
            if (sprA && sprB) {
              createCustomJoint(sprA, sprB);
            }
          }
        }
        
        statusText = "Pasted with colors!";
        statusTimer = 60;
      } catch (e) {
        statusText = "Invalid clipboard data!";
        statusTimer = 90;
      }
    });
  }

  
  for (let s of [...boxes, ...wheels, ...reactors, ...supersolids]) {
    if (s && (s.y > 2000 || s.y < -2000)) {
      if (selectedSprites.includes(s)) unselectSingle(s);
      removeSpriteWithJoints(s);
    }
  }
  
  if (tutorialBall && (tutorialBall.y > 2000 || tutorialBall.y < -2000)) {
    if (selectedSprites.includes(tutorialBall)) unselectSingle(tutorialBall);
    removeSpriteWithJoints(tutorialBall);
    tutorialBall = null;
  }

  if (mouse.presses('left') && !kb.holding('shift')) {
    let hoveredAny = false;
    for (let s of [...boxes, ...wheels, ...reactors, ...supersolids]) {
      if (s && s.mouse.hovering()) hoveredAny = true;
    }
    if (tutorialBall && tutorialBall.mouse.hovering()) hoveredAny = true;
    if (!hoveredAny) clearAllSelection();
  }

  if ((kb.presses('delete') || kb.presses('backspace')) && selectedSprites.length > 0) {
    for (let s of selectedSprites) {
      if (s === tutorialBall) tutorialBall = null;
      removeSpriteWithJoints(s);
    }
    selectedSprites = [];
  }

  if (kb.presses('r')) {
    for (let s of [...boxes, ...wheels, ...reactors, ...supersolids]) removeSpriteWithJoints(s);
    if (tutorialBall) removeSpriteWithJoints(tutorialBall);
    boxes.removeAll(); wheels.removeAll(); reactors.removeAll(); supersolids.removeAll();
    selectedSprites = [];
    worldJoints = []; 
    spawnTutorialBall(200, 200); 
  }

  if (kb.presses('space')) {
    isFrozen = !isFrozen;
    world.timeScale = isFrozen ? 0 : 1;
  }

  updateCamera();

  if (statusTimer > 0) {
    push();
    camera.off(); 
    fill(0, 180); noStroke();
    rect(10, 10, 180, 30, 5);
    fill(255); textSize(12); textAlign(CENTER, CENTER);
    text(statusText, 100, 25);
    pop();
    statusTimer--;
  }
}

function spawnTutorialBall(x, y) {
  tutorialBall = new Sprite(x, y, 180);
  tutorialBall.color = 'lightyellow';
  tutorialBall.friction = 0.5;
  tutorialBall.text = 
    "RMB - New Brick\n" +
    "C - New Wheel\n" +
    "G - New Supersolid (unmovable)\n" + 
    "E - New Reactor\n" +
    "LMB - Select\n" +
    "LMB x2 - Joint\n" +
    "Shift+LMB - Multi-Select\n" +
    "U / I - Copy / Paste\n" + 
    "R - Reset\n" +
    "Backspace - Delete\n" +
    "Space - time stop\n" +
    "S - Action Button (Rotate, etc...)\n" +
    "T - Spawn Tutorial Ball";
  tutorialBall.textColor = 50;
  tutorialBall.textSize = 10; 
  tutorialBall.textRotation = false; 
}

function createReactorSprite(x, y, startRotation) {
  let reactor = new reactors.Sprite(x, y, 40, 40);
  reactor.color = 'green';
  reactor.friction = 5.0; 
  reactor.rotation = startRotation; 
  reactor.rotationLock = true; 
  reactor.draw = () => {
    fill(reactor.color);
    stroke(selectedSprites.includes(reactor) ? 'red' : 0);
    strokeWeight(selectedSprites.includes(reactor) ? 4 : 1);
    rect(0, 0, 40, 40); 
    fill(255); noStroke(); triangle(-5, -10, -5, 10, 10, 0); 
  };
  return reactor;
}

function createCustomJoint(spriteA, spriteB) {
  if (!spriteA || !spriteB) return;
  
  let pj = new DistanceJoint(spriteA, spriteB);
  pj.offsetA.x = 0; pj.offsetA.y = 0;
  pj.offsetB.x = 0; pj.offsetB.y = 0;
  
  let d = dist(spriteA.x, spriteA.y, spriteB.x, spriteB.y);
  pj.distance = d;
  pj.collideConnected = false; 

  worldJoints.push({
    p5joint: pj,
    spriteA: spriteA,
    spriteB: spriteB,
    originalDistance: d
  });
}

function selectSingle(sprite) {
  if (!sprite) return;
  if (!selectedSprites.includes(sprite)) {
    selectedSprites.push(sprite);
    if (!reactors.includes(sprite)) {
      sprite.stroke = 'red';
      sprite.strokeWeight = 4;
    }
  }
}

function unselectSingle(sprite) {
  if (!sprite) return;
  let index = selectedSprites.indexOf(sprite);
  if (index > -1) {
    selectedSprites.splice(index, 1);
    if (!reactors.includes(sprite)) {
      sprite.stroke = 'black';
      sprite.strokeWeight = 1;
    }
  }
}

function clearAllSelection() {
  for (let s of selectedSprites) {
    if (s && !reactors.includes(s)) {
      s.stroke = 'black';
      s.strokeWeight = 1;
    }
  }
  selectedSprites = [];
}

function removeSpriteWithJoints(sprite) {
  if (sprite) {
    for (let i = worldJoints.length - 1; i >= 0; i--) {
      let j = worldJoints[i];
      if (j && (j.spriteA === sprite || j.spriteB === sprite)) {
        if (j.p5joint) j.p5joint.remove();
        worldJoints.splice(i, 1);
      }
    }
    if (sprite.joints) {
      while (sprite.joints.length > 0) {
        sprite.joints[0].remove();
      }
    }
    sprite.remove();
  }
}

function updateCamera() {
  let allObjects = [...boxes, ...wheels, ...reactors, ...supersolids];
  if (tutorialBall) allObjects.push(tutorialBall);

  allObjects = allObjects.filter(s => s !== undefined && s !== null);

  if (allObjects.length === 0) {
    camera.x = lerp(camera.x, 400, 0.08);
    camera.y = lerp(camera.y, floorPlatform.y - 200, 0.08);
    camera.zoom = lerp(camera.zoom, 1, 0.08);
    return;
  }

  let minX = allObjects[0].x - allObjects[0].w;
  let maxX = allObjects[0].x + allObjects[0].w;
  let minY = allObjects[0].y - allObjects[0].h;
  let maxY = allObjects[0].y + allObjects[0].h;

  for (let s of allObjects) {
    if (s.x - s.w < minX) minX = s.x - s.w;
    if (s.x + s.w > maxX) maxX = s.x + s.w;
    if (s.y - s.h < minY) minY = s.y - s.h;
    if (s.y + s.h > maxY) maxY = s.y + s.h;
  }

  let padding = 150; 
  let sceneWidth = (maxX - minX) + padding * 2;
  let sceneHeight = (maxY - minY) + padding * 2;

  let targetX = (minX + maxX) / 2;
  let targetY = (minY + maxY) / 2;

  let zoomX = width / sceneWidth;
  let zoomY = height / sceneHeight;
  
  let targetZoom = min(zoomX, zoomY);
  
  if (targetZoom > 1) targetZoom = 1; 
  if (targetZoom < 0.1) targetZoom = 0.1; 

  camera.x = lerp(camera.x, targetX, 0.08);
  camera.y = lerp(camera.y, targetY, 0.08);
  camera.zoom = lerp(camera.zoom, targetZoom, 0.08);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
