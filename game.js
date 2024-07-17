let score = 0;
let environment = 100;
let year = 1;
let difficulty;
let selectedFields = [];
const fieldStates = Array(16).fill(null);  // States of all fields

function startGame() {
    const level = document.getElementById('level-select').value;
    switch(level) {
        case 'easy':
            difficulty = { burnEffect: 5, recoveryEffect: 10, decayRate: 1, targetScore: 3000 };
            break;
        case 'medium':
            difficulty = { burnEffect: 10, recoveryEffect: 5, decayRate: 2, targetScore: 4000 };
            break;
        case 'hard':
            difficulty = { burnEffect: 15, recoveryEffect: 3, decayRate: 3, targetScore: 5000 };
            break;
    }
    score = 0;
    environment = 100;
    year = 1;
    selectedFields = [];
    for (let i = 0; i < fieldStates.length; i++) {
        fieldStates[i] = null;
    }
    document.getElementById('score').innerText = score;
    document.getElementById('environment').innerText = environment;
    document.getElementById('target-score').innerText = difficulty.targetScore;
    document.getElementById('year').innerText = year;
    document.getElementById('start-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    renderFields();
}

function renderFields() {
    const grid = document.getElementById('farmland-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const field = document.createElement('div');
        field.classList.add('field');
        field.addEventListener('click', () => selectField(i));
        updateFieldAppearance(field, i);
        grid.appendChild(field);
    }
}

function updateFieldAppearance(field, index) {
    field.className = 'field';
    const state = fieldStates[index];
    if (selectedFields.includes(index)) {
        field.classList.add('selected');
    } else if (state && state.status === 'farming') {
        field.classList.add('farming');
        field.innerHTML = `<span class="continue-text">${state.yearsLeft}</span>`;
    } else if (state && state.status === 'resting') {
        field.classList.add('resting');
        field.innerHTML = `<span class="continue-text">${state.yearsLeft}</span>`;
    } else if (state === 'barren') {
        field.classList.add('barren');
    }
}

function selectField(index) {
    const field = fieldStates[index];
    if (field && (field.status === 'farming' || field.status === 'resting')) {
        return;  // Cannot select fields that are farming or resting
    }
    if (selectedFields.includes(index)) {
        selectedFields = selectedFields.filter(i => i !== index);
    } else {
        selectedFields.push(index);
    }
    renderFields();
}

function selectAction(action) {
    selectedFields.forEach(index => {
        if (action === 'burn') {
            fieldStates[index] = { status: 'farming', yearsLeft: 10 };
            score += 10;
            environment -= difficulty.burnEffect;
        } else if (action === 'rest') {
            fieldStates[index] = { status: 'resting', yearsLeft: 5 };
        }
    });
    selectedFields = [];
    updateStatus();
    renderFields();
}

function advanceYear() {
    year++;
    let restingFields = 0;
    let unusedFields = 0;
    
    for (let i = 0; i < fieldStates.length; i++) {
        const field = fieldStates[i];
        if (field && field.status === 'farming') {
            field.yearsLeft--;
            score += 10;  // Continuously add points for farming each year
            if (field.yearsLeft <= 0) {
                fieldStates[i] = { status: 'resting', yearsLeft: 5 };  // Switch to resting after farming period
            }
        } else if (field && field.status === 'resting') {
            field.yearsLeft--;
            restingFields++;
            if (field.yearsLeft <= 0) {
                fieldStates[i] = null;  // Resting period is over, field is now unused
            }
        } else if (!field) {
            unusedFields++;
        }
    }
    environment += 2 * (restingFields + unusedFields);  // Recover environment state based on unused and resting fields
    updateStatus();
    renderFields();

    if (environment <= 0) {
        document.getElementById('game-over-message').innerText = '環境破滅';
        gameOver();
    } else if (year > 50 && score < difficulty.targetScore) {
        document.getElementById('game-over-message').innerText = '飢死';
        gameOver();
    } else if (year > 50) {
        endGame();
    }
}

function updateStatus() {
    document.getElementById('score').innerText = score;
    document.getElementById('environment').innerText = environment;
    document.getElementById('year').innerText = year;
}

function resetGame() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('clear-container').style.display = 'none';
    document.getElementById('start-container').style.display = 'block';
}

function gameOver() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('clear-container').style.display = 'block';
}

function endGame() {
    document.getElementById('game-over-message').innerHTML = `
        おめでとうございます！目標スコアに到達しました！<br>
        焼畑農業は一時的な生産性向上をもたらしますが、長期的には環境への負荷が大きく、持続可能な農業とは言えません。
        環境を保護しながら持続可能な方法で農業を行うことの重要性を理解しましょう。
    `;
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('clear-container').style.display = 'block';
}
