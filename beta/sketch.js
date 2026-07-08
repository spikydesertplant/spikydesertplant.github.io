let floorPlatform; 
let boxes; 
let wheels; 
let reactors; 
let tutorialBall;
let selectedSprites = []; 
let copiedData = []; 
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

  // Создание объектов
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
    createReactorSprite(mouse.x, mouse.y, -90);
  }

  if (kb.presses('t')) {
    if (tutorialBall) removeSpriteWithJoints(tutorialBall);
    spawnTutorialBall(mouse.x, mouse.y);
  }

  // ОБНОВЛЕННАЯ ЛОГИКА ВЫДЕЛЕНИЯ И ДЖОИНТОВ
  let allInteractive = [...boxes, ...wheels, ...reactors];
  if (tutorialBall) allInteractive.push(tutorialBall);

  for (let s of allInteractive) {
    if (s && s.mouse.hovering() && mouse.presses('left')) {
      if (kb.holding('shift')) {
        // Клик с ШИФТОМ просто довыделяет следующий объект в группу
        if (selectedSprites.includes(s)) {
          unselectSingle(s);
        } else {
          selectSingle(s);
        }
      } else {
        // Обычный клик без шифта
        if (selectedSprites.includes(s) && selectedSprites.length === 1) {
          clearAllSelection();
        } else if (selectedSprites.length === 1 && !selectedSprites.includes(s)) {
          // Если один объект уже был выделен, а мы кликаем по второму — создаем Joint!
          selectSingle(s);
          let joint = new DistanceJoint(selectedSprites[0], selectedSprites[1]);
          joint.offsetA.x = 0; joint.offsetA.y = 0;
          joint.offsetB.x = 0; joint.offsetB.y = 0;
          joint.distance = dist(selectedSprites[0].x, selectedSprites[0].y, selectedSprites[1].x, selectedSprites[1].y);
          joint.collideConnected = false; 
          clearAllSelection();
        } else {
          // Если ничего не было выделено (или была группа), выделяем этот один объект
          clearAllSelection();
          selectSingle(s);
        }
      }
      break; 
    }
  }

  // Горячие клавиши S и A
  if (selectedSprites.length > 0) {
    if (kb.presses('s')) {
      for (let s of selectedSprites) {
        if (wheels.includes(s)) {
          s.customSpeed = -s.customSpeed;
          s.color = (s.color === 'white') ? 'blue' : 'white';
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
        } else {
          s.color = 'black'; s.friction = 0.5;
        }
      }
      clearAllSelection();
    }
  }

  // КОПИРОВАНИЕ НА U И ВСТАВКА НА I
  if (kb.presses('u')) {
    copiedData = [];
    if (selectedSprites.length > 0) {
      let avgX = 0, avgY = 0;
      for (let s of selectedSprites) { avgX += s.x; avgY += s.y; }
      avgX /= selectedSprites.length; avgY /= selectedSprites.length;

      for (let s of selectedSprites) {
        let type = 'box';
        if (wheels.includes(s)) type = 'wheel';
        if (reactors.includes(s)) type = 'reactor';
        if (s === tutorialBall) type = 'tutorial';

        copiedData.push({
          type: type,
          offsetX: s.x - avgX,
          offsetY: s.y - avgY,
          color: s.color,
          friction: s.friction,
          rotation: s.rotation,
          customSpeed: s.customSpeed
        });
      }
    }
  }

  if (kb.presses('i')) {
    clearAllSelection();
    for (let data of copiedData) {
      let spawnX = mouse.x + data.offsetX;
      let spawnY = mouse.y + data.offsetY;
      let newSprite;

      if (data.type === 'box') {
        newSprite = new boxes.Sprite(spawnX, spawnY, 40, 40);
        newSprite.color = data.color;
        newSprite.friction = data.friction;
      } else if (data.type === 'wheel') {
        newSprite = new wheels.Sprite(spawnX, spawnY, 40);
        newSprite.color = data.color;
        newSprite.friction = data.friction;
        newSprite.customSpeed = data.customSpeed;
      } else if (data.type === 'reactor') {
        newSprite = createReactorSprite(spawnX, spawnY, data.rotation);
        newSprite.color = data.color;
        newSprite.friction = data.friction;
      } else if (data.type === 'tutorial') {
        if (tutorialBall) removeSpriteWithJoints(tutorialBall);
        spawnTutorialBall(spawnX, spawnY);
        newSprite = tutorialBall;
      }
      if (newSprite) selectSingle(newSprite);
    }
  }

  // Удаление по Y
  for (let s of [...boxes, ...wheels, ...reactors]) {
    if (s.y > 2000 || s.y < -2000) {
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
    for (let s of [...boxes, ...wheels, ...reactors]) {
      if (s.mouse.hovering()) hoveredAny = true;
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
    for (let s of [...boxes, ...wheels, ...reactors]) removeSpriteWithJoints(s);
    if (tutorialBall) removeSpriteWithJoints(tutorialBall);
    boxes.removeAll(); wheels.removeAll(); reactors.removeAll(); 
    selectedSprites = [];
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
    "E - New Reactor\n" +
    "LMB - Select / Joint (on 2nd click)\n" +
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

function selectSingle(sprite) {
  if (!selectedSprites.includes(sprite)) {
    selectedSprites.push(sprite);
    if (!reactors.includes(sprite)) {
      sprite.stroke = 'red';
      sprite.strokeWeight = 4;
    }
  }
}

function unselectSingle(sprite) {
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
    while (sprite.joints.length > 0) {
      sprite.joints[0].remove();
    }
    sprite.remove();
  }
}

function updateCamera() {
  let allObjects = [...boxes, ...wheels, ...reactors];
  if (tutorialBall) allObjects.push(tutorialBall);

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
