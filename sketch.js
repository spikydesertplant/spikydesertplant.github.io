let ground;
let boxes;
let wheels;
let tutorialBall;
let firstSprite = null;
let isFrozen = false;

function setup() {
    new Canvas(windowWidth, windowHeight);
    world.gravity.y = 10;

    document.oncontextmenu = (e) => e.preventDefault();

    ground = new Sprite(400, 550, 1e5, 60, 'static');
    ground.color = 'gray';

    boxes = new Group();
    wheels = new Group();

    tutorialBall = new Sprite(200, 200, 180);
    tutorialBall.color = 'lightyellow';
    tutorialBall.friction = 0.5;

    tutorialBall.text =
        "🕹️ CONTROLS:\n" +
        "• RMB - Create box\n" +
        "• C - Create wheel\n" +
        "• LMB x2 - Pin Joint\n" +
        "• Select + S - Slippery\n" +
        "• Select + A - Default\n" +
        "• Select + Del - Delete\n" +
        "• Space - Pause Time\n" +
        "• R - Reset Scene";

    tutorialBall.textColor = 50;
    tutorialBall.textSize = 12;
    tutorialBall.textRotation = false;
}

function draw() {
    background(240);

    for (let w of wheels) {
        if (!isFrozen) {
            w.rotationSpeed = 5;
        } else {
            w.rotationSpeed = 0;
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
    }

    let allInteractive = [...boxes, ...wheels, tutorialBall];
    for (let s of allInteractive) {
        if (s && s.mouse.hovering() && mouse.presses('left')) {
            if (!firstSprite) {
                firstSprite = s;
                firstSprite.stroke = 'red';
                firstSprite.strokeWeight = 4;
            } else if (firstSprite === s) {
                resetSelection();
            } else {
                // Запрет убран! Теперь tutorialBall можно соединять с чем угодно
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
            firstSprite.color = 'blue';
            firstSprite.friction = 0.01;
            resetSelection();
        }
        if (kb.presses('a')) {
            if (firstSprite === tutorialBall) {
                firstSprite.color = 'lightyellow';
                firstSprite.friction = 0.5;
            } else {
                firstSprite.color = wheels.includes(firstSprite) ? 'white' : 'black';
                firstSprite.friction = wheels.includes(firstSprite) ? 9999 : 0.5;
            }
            resetSelection();
        }
    }

    for (let s of [...boxes, ...wheels]) {
        if (s.y > 1000 || s.y < -1000) {
            if (firstSprite === s) firstSprite = null;
            s.remove();
        }
    }

    if (tutorialBall && (tutorialBall.y > 1000 || tutorialBall.y < -1000)) {
        if (firstSprite === tutorialBall) firstSprite = null;
        tutorialBall.remove();
        tutorialBall = null;
    }

    if (mouse.presses('left')) {
        let hoveredAny = false;
        for (let s of [...boxes, ...wheels]) {
            if (s.mouse.hovering()) hoveredAny = true;
        }
        if (tutorialBall && tutorialBall.mouse.hovering()) hoveredAny = true;
        if (!hoveredAny) resetSelection();
    }

    if ((kb.presses('delete') || kb.presses('backspace')) && firstSprite) {
        if (firstSprite === tutorialBall) {
            tutorialBall.remove();
            tutorialBall = null;
        } else {
            firstSprite.remove();
        }
        firstSprite = null;
    }

    if (kb.presses('r')) {
        boxes.removeAll();
        wheels.removeAll();
        if (tutorialBall) {
            tutorialBall.remove();
            tutorialBall = null;
        }
        resetSelection();
    }

    if (kb.presses('space')) {
        isFrozen = !isFrozen;
        world.timeScale = isFrozen ? 0 : 1;
    }

    updateCamera();
}

function updateCamera() {
    let minX = 0;
    let maxX = 800;
    let minY = ground.y - ground.h / 2;
    let maxY = ground.y + ground.h / 2;

    let allObjects = [...boxes, ...wheels];
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
} let ground;
let boxes;
let wheels;
let tutorialBall;
let firstSprite = null;
let isFrozen = false;

function setup() {
    new Canvas(windowWidth, windowHeight);
    world.gravity.y = 10;

    document.oncontextmenu = (e) => e.preventDefault();

    ground = new Sprite(400, 550, 1e5, 60, 'static');
    ground.color = 'gray';

    boxes = new Group();
    wheels = new Group();

    tutorialBall = new Sprite(200, 200, 180);
    tutorialBall.color = 'lightyellow';
    tutorialBall.friction = 0.5;

    tutorialBall.text =
        "🕹️ CONTROLS:\n" +
        "• RMB - Create box\n" +
        "• C - Create wheel\n" +
        "• LMB x2 - Pin Joint\n" +
        "• Select + S - Slippery\n" +
        "• Select + A - Default\n" +
        "• Select + Del - Delete\n" +
        "• Space - Pause Time\n" +
        "• R - Reset Scene";

    tutorialBall.textColor = 50;
    tutorialBall.textSize = 12;
    tutorialBall.textRotation = false;
}

function draw() {
    background(240);

    for (let w of wheels) {
        if (!isFrozen) {
            w.rotationSpeed = 5;
        } else {
            w.rotationSpeed = 0;
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
    }

    let allInteractive = [...boxes, ...wheels, tutorialBall];
    for (let s of allInteractive) {
        if (s && s.mouse.hovering() && mouse.presses('left')) {
            if (!firstSprite) {
                firstSprite = s;
                firstSprite.stroke = 'red';
                firstSprite.strokeWeight = 4;
            } else if (firstSprite === s) {
                resetSelection();
            } else {
                // Запрет убран! Теперь tutorialBall можно соединять с чем угодно
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
            firstSprite.color = 'blue';
            firstSprite.friction = 0.01;
            resetSelection();
        }
        if (kb.presses('a')) {
            if (firstSprite === tutorialBall) {
                firstSprite.color = 'lightyellow';
                firstSprite.friction = 0.5;
            } else {
                firstSprite.color = wheels.includes(firstSprite) ? 'white' : 'black';
                firstSprite.friction = wheels.includes(firstSprite) ? 9999 : 0.5;
            }
            resetSelection();
        }
    }

    for (let s of [...boxes, ...wheels]) {
        if (s.y > 1000 || s.y < -1000) {
            if (firstSprite === s) firstSprite = null;
            s.remove();
        }
    }

    if (tutorialBall && (tutorialBall.y > 1000 || tutorialBall.y < -1000)) {
        if (firstSprite === tutorialBall) firstSprite = null;
        tutorialBall.remove();
        tutorialBall = null;
    }

    if (mouse.presses('left')) {
        let hoveredAny = false;
        for (let s of [...boxes, ...wheels]) {
            if (s.mouse.hovering()) hoveredAny = true;
        }
        if (tutorialBall && tutorialBall.mouse.hovering()) hoveredAny = true;
        if (!hoveredAny) resetSelection();
    }

    if ((kb.presses('delete') || kb.presses('backspace')) && firstSprite) {
        if (firstSprite === tutorialBall) {
            tutorialBall.remove();
            tutorialBall = null;
        } else {
            firstSprite.remove();
        }
        firstSprite = null;
    }

    if (kb.presses('r')) {
        boxes.removeAll();
        wheels.removeAll();
        if (tutorialBall) {
            tutorialBall.remove();
            tutorialBall = null;
        }
        resetSelection();
    }

    if (kb.presses('space')) {
        isFrozen = !isFrozen;
        world.timeScale = isFrozen ? 0 : 1;
    }

    updateCamera();
}

function updateCamera() {
    let minX = 0;
    let maxX = 800;
    let minY = ground.y - ground.h / 2;
    let maxY = ground.y + ground.h / 2;

    let allObjects = [...boxes, ...wheels];
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
