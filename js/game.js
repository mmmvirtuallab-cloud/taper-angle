// --- Logic Configuration ---
const LOGICAL_WIDTH = 900;
const LOGICAL_HEIGHT = 600;
let scaleFactor = 1;

// Game objects
let backgroundImg;
let guideArrow = {
    x: 600, y: 520, targetX: 600, targetY: 520,
    alpha: 255, fadeIn: true, active: false, angle: 0, forBall2: false
};
let ball1 = { x: 600, y: 520, radius: 20, image: null };
let ball2 = { x: 700, y: 520, radius: 30, image: null };
let ball1Selected = false;
let ball2Selected = false;
let ball1InitialPosition = { x: 600, y: 520 };
let ball2InitialPosition = { x: 700, y: 520 };
let newMeasureButtonVisible = false;
let highlightAlpha = 0;
let isHighlighting = false;

// Initial Step Title
let stepTitle = "Step 1: Click the Blue Ball to select and place it";

// Results Data
let distAValue = "";
let distBValue = "";
let ballReturning = false;

// Animation variables
let rulerAnimating = false;
let rulerReturning = false;
let rulerAnimationProgress = 0;
let rulerStartPos = { x: 0, y: 0 };
let rulerTargetPos = { x: 0, y: 0 };
let rulerStartAngle = 0;
let rulerTargetAngle = 0;
let rulerInitialPos = { x: 0, y: 0 };
let rulerInitialAngle = 0;

// Movement animation vars
let animating = false;
let animationProgress = 0;
let startPos = { x: 0, y: 0 };
let targetPos = { x: 0, y: 0 };
let waitingForSecondClick = false;


document.addEventListener('DOMContentLoaded', function() {
    highlightStep(1);
});

function highlightStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        step.style.opacity = '0.5';
    });
    const currentStep = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
        currentStep.style.opacity = '1';
    }
}

// --- FIX IS HERE: Update the global stepTitle variable ---
function showStepModal(text) {
    stepTitle = text; // Update global variable so mousePressed logic works
    const stepMatch = text.match(/Step (\d)/);
    if (stepMatch) {
        highlightStep(parseInt(stepMatch[1]));
    }
}

function showExperimentComplete() {
    highlightStep(5); // Just unhighlight others
    const stepsPanel = document.querySelector('.steps-panel');
    if (stepsPanel && !document.querySelector('.completion-message')) {
        const completionDiv = document.createElement('div');
        completionDiv.className = 'completion-message';
        completionDiv.innerHTML = `
            <div style="margin-top:20px; padding:15px; background: linear-gradient(135deg, #4a569d, #1a1c2c); border-radius: 8px; color: white; text-align: center;">
                <p style="font-weight:bold; margin-bottom:10px;">Experiment Complete!</p>
                <button id="calculateBtn" class="btn btn-light btn-sm">Calculate Results</button>
            </div>
        `;
        stepsPanel.appendChild(completionDiv);
        document.getElementById('calculateBtn').addEventListener('click', function() {
            const r = 2; const R = 4; const height = 5;
            const rDiff = R - r;
            const sinAlpha = rDiff / height;
            const alpha = Math.asin(sinAlpha) * (180 / Math.PI);
            window.location.href = `results.html?r=${r}&R=${R}&rDiff=${rDiff}&height=${height}&alpha=${alpha}`;
        });
    }
}

function preload() {
    backgroundImg = loadImage('./assets/background.png');
    loadImage('./assets/ball1.png', img => ball1.image = img);
    loadImage('./assets/ball2.png', img => ball2.image = img);
    
    funnel = new Funnel(350, 200, 100, 200);
    funnel.loadImage('./assets/female_taper.png');
    
    ruler = new Ruler(50, 400, 300, 90);
    ruler.loadImage('./assets/ruler.png');
}

function setup() {
    const cnv = createCanvas(LOGICAL_WIDTH, LOGICAL_HEIGHT);
    cnv.parent('game-container');
    
    ruler.x = 50; 
    ruler.y = LOGICAL_HEIGHT - ruler.height - 30;
    rulerInitialPos = { x: ruler.x, y: ruler.y };
    rulerInitialAngle = ruler.angle;

    // Initial Guide Arrow
    guideArrow.x = ball1.x - 50;
    guideArrow.y = ball1.y - 50;
    guideArrow.active = true;

    windowResized();
}

function windowResized() {
    const container = document.getElementById('game-container');
    if (container) {
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        scaleFactor = Math.min(containerW / LOGICAL_WIDTH, containerH / LOGICAL_HEIGHT);
        resizeCanvas(LOGICAL_WIDTH * scaleFactor, LOGICAL_HEIGHT * scaleFactor);
    }
}

function draw() {
    scale(scaleFactor);
    clear();
    
    if (backgroundImg) {
        image(backgroundImg, 0, LOGICAL_HEIGHT - backgroundImg.height, LOGICAL_WIDTH, backgroundImg.height);
    } else {
        background(255);
    }
    
    updateGameLogic();
    drawGameElements();
}

function updateGameLogic() {
    // Highlight Logic & Guide Arrows
    if (isHighlighting && !animating) {
        if (ball1Selected) {
            guideArrow.x = 400 - 50; guideArrow.y = 480 - 50;
            guideArrow.targetX = 400; guideArrow.targetY = 480;
            guideArrow.active = true; guideArrow.forBall2 = false;
        } else if (ball2Selected) {
            guideArrow.x = 400 - 50; guideArrow.y = 424 - 50;
            guideArrow.targetX = 400; guideArrow.targetY = 424;
            guideArrow.active = true; guideArrow.forBall2 = true;
        }
    } else if (!isHighlighting && !animating) {
        if (!ball1Selected && !ball2Selected) {
            if (!guideArrow.forBall2 && distAValue) {
                // Points to red ball now
                guideArrow.x = ball2.x - 50; guideArrow.y = ball2.y - 50;
                guideArrow.targetX = ball2.x; guideArrow.targetY = ball2.y;
                guideArrow.active = true; guideArrow.forBall2 = true;
            }
        } else {
            guideArrow.active = false;
        }
    }

    updateArrow();

    // Ball Animation
    if (animating) {
        animationProgress += 0.05;
        let easeProgress = 1 - Math.pow(1 - animationProgress, 4);
        let currentBall = ball1Selected ? ball1 : ball2;
        
        if (animationProgress >= 1) {
            animating = false;
            currentBall.x = targetPos.x;
            currentBall.y = targetPos.y;

            if (!ballReturning) {
                rulerAnimating = true;
                rulerAnimationProgress = 0;
                rulerStartPos = { x: ruler.x, y: ruler.y };
                rulerStartAngle = ruler.angle;
                
                rulerTargetPos = { x: currentBall.x - 149, y: currentBall.y - 203 };
                rulerTargetAngle = ruler.angle - HALF_PI;
                
                if (ball1Selected) showStepModal("Step 2: Measuring first ball position");
                else if (ball2Selected) showStepModal("Step 4: Measuring second ball position");
            } else {
                ballReturning = false;
                ball1Selected = false; 
                ball2Selected = false;
            }
            isHighlighting = false;
            waitingForSecondClick = false;
        } else {
            currentBall.x = lerp(startPos.x, targetPos.x, easeProgress);
            currentBall.y = lerp(startPos.y, targetPos.y, easeProgress);
        }
    }

    // Ruler Animation
    if (rulerAnimating || rulerReturning) {
        rulerAnimationProgress += 0.05;
        let easeProgress = 1 - Math.pow(1 - rulerAnimationProgress, 4);
        
        if (rulerAnimationProgress >= 1) {
            rulerAnimationProgress = 0;
            if (rulerAnimating) {
                rulerAnimating = false;
                ruler.x = rulerTargetPos.x;
                ruler.y = rulerTargetPos.y;
                ruler.angle = rulerTargetAngle;
                newMeasureButtonVisible = true;
            } else if (rulerReturning) {
                rulerReturning = false;
                ruler.x = rulerInitialPos.x;
                ruler.y = rulerInitialPos.y;
                ruler.angle = rulerInitialAngle;
                newMeasureButtonVisible = false;
                
                // HERE is where we switch to Step 3
                if (ball1Selected) {
                    showStepModal("Step 3: Place the second ball by clicking it");
                    ball1Selected = false; // Deselect ball 1 so we can click ball 2
                } else if (ball2Selected) {
                    showExperimentComplete();
                    ball2Selected = false;
                }
            }
        } else {
            ruler.x = lerp(rulerStartPos.x, rulerTargetPos.x, easeProgress);
            ruler.y = lerp(rulerStartPos.y, rulerTargetPos.y, easeProgress);
            ruler.angle = lerp(rulerStartAngle, rulerTargetAngle, easeProgress);
        }
    }
}

function drawGameElements() {
    push();
    let boxWidth = 220; let boxHeight = 100;
    let boxX = LOGICAL_WIDTH - boxWidth - 20;
    let boxY = (LOGICAL_HEIGHT / 2) - (boxHeight / 2);
    fill(240, 240, 240, 220); stroke(150); strokeWeight(2);
    rect(boxX, boxY, boxWidth, boxHeight, 10);
    fill(0); noStroke(); textSize(16); textAlign(LEFT, TOP);
    
    let diff = (distAValue && distBValue) ? (parseFloat(distAValue) - parseFloat(distBValue)).toFixed(2) + 'mm' : '';
    text(`Dist A: ${distAValue}`, boxX + 15, boxY + 20);
    text(`Dist B: ${distBValue}`, boxX + 15, boxY + 45);
    text(`DistA - DistB: ${diff}`, boxX + 15, boxY + 70);
    pop();

    funnel.y = LOGICAL_HEIGHT - funnel.height - 40;
    funnel.display();
    ruler.display();

    if (ball1.image) {
        push(); imageMode(CENTER);
        if (isHighlighting && ball1Selected) {
            highlightAlpha = sin(frameCount * 0.1) * 127 + 127;
            push(); noFill(); stroke(255, 255, 0, highlightAlpha); strokeWeight(3);
            circle(ball1.x, ball1.y, ball1.radius * 2.2);
            if (waitingForSecondClick && !animating) {
                textSize(14); textAlign(CENTER); fill(0); noStroke();
                text("Click inside funnel", ball1.x, ball1.y - ball1.radius - 20);
            }
            pop();
        }
        image(ball1.image, ball1.x, ball1.y, ball1.radius * 2, ball1.radius * 2);
        pop();
    }

    if (ball2.image) {
        push(); imageMode(CENTER);
        if (isHighlighting && ball2Selected) {
            highlightAlpha = sin(frameCount * 0.1) * 127 + 127;
            push(); noFill(); stroke(255, 255, 0, highlightAlpha); strokeWeight(3);
            circle(ball2.x, ball2.y, ball2.radius * 2.2);
            if (waitingForSecondClick && !animating) {
                textSize(14); textAlign(CENTER); fill(0); noStroke();
                text("Click inside funnel", ball2.x, ball2.y - ball2.radius - 20);
            }
            pop();
        }
        image(ball2.image, ball2.x, ball2.y, ball2.radius * 2, ball2.radius * 2);
        pop();
    }

    if (newMeasureButtonVisible) {
        push(); rectMode(CENTER);
        fill(220); stroke(180); strokeWeight(2);
        rect(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT - 35, 100, 30, 5);
        fill(0); noStroke(); textSize(16); textAlign(CENTER, CENTER);
        text('Measure', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT - 35);
        pop();
    }

    if (guideArrow.active) {
        drawArrow(guideArrow.x, guideArrow.y, guideArrow.targetX, guideArrow.targetY, guideArrow.alpha);
    }
}

function drawArrow(x, y, targetX, targetY, alpha) {
    push();
    stroke(255, 165, 0, alpha); strokeWeight(3); fill(255, 165, 0, alpha);
    let angle = atan2(targetY - y, targetX - x);
    line(x, y, targetX, targetY);
    push(); translate(targetX, targetY); rotate(angle);
    triangle(0, 0, -15, -5, -15, 5);
    pop(); pop();
}

function updateArrow() {
    if (guideArrow.active) {
        if (guideArrow.fadeIn) {
            guideArrow.alpha += 10;
            if (guideArrow.alpha >= 255) guideArrow.fadeIn = false;
        } else {
            guideArrow.alpha -= 10;
            if (guideArrow.alpha <= 100) guideArrow.fadeIn = true;
        }
    }
}

function mousePressed() {
    if (animating || rulerAnimating || rulerReturning) return;

    let mx = mouseX / scaleFactor;
    let my = mouseY / scaleFactor;

    // Handle Measure Button
    if (newMeasureButtonVisible) {
        let bx = LOGICAL_WIDTH / 2;
        let by = LOGICAL_HEIGHT - 35;
        if (mx > bx - 50 && mx < bx + 50 && my > by - 15 && my < by + 15) {
            if (ball1Selected) distAValue = "15mm";
            else if (ball2Selected) distBValue = "10mm";
            
            newMeasureButtonVisible = false;
            rulerReturning = true;
            rulerAnimationProgress = 0;
            rulerStartPos = { x: ruler.x, y: ruler.y };
            rulerStartAngle = ruler.angle;
            rulerTargetPos = { x: rulerInitialPos.x, y: rulerInitialPos.y };
            rulerTargetAngle = rulerInitialAngle;
            return;
        }
    }

    // First Click (Selection)
    if (!waitingForSecondClick) {
        // Check Ball 1 (Step 1)
        if (dist(mx, my, ball1.x, ball1.y) < ball1.radius && stepTitle.includes("Step 1")) {
            ball1Selected = true; ball2Selected = false;
            isHighlighting = true; waitingForSecondClick = true;
            return;
        }
        // Check Ball 2 (Step 3)
        if (dist(mx, my, ball2.x, ball2.y) < ball2.radius && stepTitle.includes("Step 3")) {
            ball1Selected = false; ball2Selected = true;
            isHighlighting = true; waitingForSecondClick = true;
            return;
        }
    } 
    // Second Click (Placement)
    else {
        let funnelCenterX = funnel.x + funnel.width / 2;
        // Wider hit area for better UX
        if (mx > funnelCenterX - 50 && mx < funnelCenterX + 50 && my > funnel.y && my < funnel.y + funnel.height) {
            let currentBall = ball1Selected ? ball1 : ball2;
            startPos = { x: currentBall.x, y: currentBall.y };
            targetPos = { x: funnelCenterX, y: my };
            animating = true; animationProgress = 0;
        } else {
            if (ball1Selected) { ball1.x = ball1InitialPosition.x; ball1.y = ball1InitialPosition.y; ball1Selected = false; }
            else if (ball2Selected) { ball2.x = ball2InitialPosition.x; ball2.y = ball2InitialPosition.y; ball2Selected = false; }
            isHighlighting = false; waitingForSecondClick = false;
        }
    }
}