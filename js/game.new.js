// Game objects
let backgroundImg;
let guideArrow = {
    x: 600,
    y: 520,
    targetX: 600,
    targetY: 520,
    alpha: 255,
    fadeIn: true,
    active: false,
    angle: 0,
    forBall2: false
};
let ball1 = {
    x: 600,
    y: 520,
    radius: 20,
    image: null
};
let ball2 = {
    x: 700,
    y: 520,
    radius: 30,
    image: null
};
let ball1Selected = false;
let ball2Selected = false;
let ball1InitialPosition = { x: 600, y: 520 };
let ball2InitialPosition = { x: 700, y: 520 };
let newMeasureButtonVisible = false;
let highlightAlpha = 0;
let isHighlighting = false;
let stepTitle = "Step 1: Click the Blue Ball to select and place it";

// Initialize step highlighting
document.addEventListener('DOMContentLoaded', function() {
    highlightStep(1);
});

function highlightStep(stepNumber) {
    // Remove active class and dim all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        step.style.opacity = '0.5';
    });
    // Highlight only the current step
    const currentStep = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
        currentStep.style.opacity = '1';
    }
}

function showStepModal(text) {
    const stepMatch = text.match(/Step (\d)/);
    if (stepMatch) {
        const stepNumber = parseInt(stepMatch[1]);
        highlightStep(stepNumber);
    }
}

function showExperimentComplete() {
    // Remove highlighting from all steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
        step.style.opacity = '1';
    });
    
    // Add completion message
    const stepsPanel = document.querySelector('.steps-panel');
    if (stepsPanel) {
        const completionDiv = document.createElement('div');
        completionDiv.className = 'completion-message';
        completionDiv.innerHTML = `
            <p>Experiment Complete!</p>
            <button id="calculateBtn" class="btn btn-primary">Calculate Results</button>
        `;
        stepsPanel.appendChild(completionDiv);

        // Add completion styles
        const style = document.createElement('style');
        style.textContent = `
            .completion-message {
                margin-top: 20px;
                padding: 15px;
                background: linear-gradient(135deg, #4a569d, #1a1c2c);
                border-radius: 8px;
                color: white;
                text-align: center;
            }
            .completion-message p {
                margin-bottom: 10px;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);

        // Add click handler for calculate button
        document.getElementById('calculateBtn').addEventListener('click', function() {
            const r = 2;
            const R = 4;
            const height = 5;
            const rDiff = R - r;
            const sinAlpha = rDiff / height;
            const alpha = Math.asin(sinAlpha) * (180 / Math.PI);
            window.location.href = `results.html?r=${r}&R=${R}&rDiff=${rDiff}&height=${height}&alpha=${alpha}`;
        });
    }
}

let distAValue = "";
let distBValue = "";
let ballReturning = false;

// Ruler animation variables
let rulerAnimating = false;
let rulerReturning = false;
let rulerAnimationProgress = 0;
let rulerStartPos = { x: 0, y: 0 };
let rulerTargetPos = { x: 0, y: 0 };
let rulerStartAngle = 0;
let rulerTargetAngle = 0;
let rulerInitialPos = { x: 0, y: 0 };
let rulerInitialAngle = 0;
let showMeasured1Label = false;

[... rest of the original game.js file content ...]