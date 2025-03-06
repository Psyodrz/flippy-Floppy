const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const pipeScoreDisplay = document.getElementById("pipeScoreDisplay");
const coinScoreDisplay = document.getElementById("coinScoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const allTimeHighScoreDisplay = document.getElementById("allTimeHighScoreDisplay");
const startMenu = document.getElementById("startMenu");
const gameOverMenu = document.getElementById("gameOverMenu");
const finalScoreDisplay = document.getElementById("finalScore");
const newHighScoreDisplay = document.getElementById("newHighScore");
const newAllTimeHighScoreDisplay = document.getElementById("newAllTimeHighScore");
const settingsMenu = document.getElementById("settingsMenu");
const pauseMenu = document.getElementById("pauseMenu");
const pauseButton = document.getElementById("pauseButton");
const settingsButton = document.getElementById("settingsButton");
const featurePanel = document.getElementById("featurePanel");
const flapSound = document.getElementById("flapSound");
const coinSound = document.getElementById("coinSound");
const backgroundMusic = document.getElementById("backgroundMusic");
const loadingScreen = document.getElementById("loadingScreen");
const masterVolumeControl = document.getElementById("masterVolume");
const soundEffectsVolumeControl = document.getElementById("soundEffectsVolume");
const musicVolumeControl = document.getElementById("musicVolume");
const birdSkinSelect = document.getElementById("birdSkinSelect");
const backgroundSelect = document.getElementById("backgroundSelect");
const difficultySelect = document.getElementById("difficultySelect");
const pipeSkinSelect = document.getElementById("pipeSkinSelect");
const stopButton = document.getElementById("stopButton");
const lifeLostMenu = document.getElementById("lifeLostMenu");
const livesRemainingDisplay = document.getElementById("livesRemainingDisplay");
const loadingProgress = document.getElementById("loadingProgress");

let assetsLoaded = false;
let loadedAssets = 0;
const totalAssets = 11;
const birdSkins = {};
const backgroundThemes = {};
const pipeStyles = {
    "green": "#1e8449",
    "red": "red",
    "blue": "blue"
};
const obstacleImages = {};
let birdImage;
let backgroundImage;
let pipeColor = pipeStyles["green"];
let currentPipeSkin = "green";
let currentBirdSkin = "bird_red.png";
let currentBackgroundTheme = "sky_background.png";
let isMusicPlaying = false;
let isStoppingBird = false;
const initialFlapStrength = -6;

const groundColor = "#8B4513";
const groundTextureColor = "#654321";
const grassColors = ["#4CAF50", "#66BB6A", "#81C784"];
const grassBladeColor = "#388E3C";
const grassBladeThickness = 2;
const grassBladeHeightMin = 10;
const grassBladeHeightMax = 25;
const grassTransparency = 0.8;
const coinColorConst = "#FFD700";
const coinOutlineColorConst = "#DAA520";
const enhancedCoinGradientConst = "#EEC900";
const jetpackColorConst = "#FFA500";
const jetpackOutlineColorConst = "#FF8C00";

const HIGH_SCORE_KEY = "flippyBirdAllTimeHighScore";
const BIRD_SKIN_KEY = "flippyBirdSkin";
const BACKGROUND_THEME_KEY = "flippyBackground";
const PIPE_SKIN_KEY = "flippyPipeSkin";
const MUSIC_SETTING_KEY = "flippyBirdMusicSetting";
const SOUND_VOLUME_KEY = "flippyBirdSoundVolume";
const MUSIC_VOLUME_KEY = "flippyMusicVolume";
const DIFFICULTY_KEY = "flippyBirdDifficulty";

let gameState = {
    running: false,
    paused: false,
    gameOver: false,
    bird: null,
    physics: { gravity: 0.4, flapStrength: initialFlapStrength, pipeSpeed: 3, grassSpeedFactor: 1 },
    pipes: [],
    coins: [],
    enemyBirds: [],
    jetpacks: [],
    obstacles: [],
    powerupActive: false,
    powerupTimer: 0,
    powerupDuration: 10000,
    overallScore: 0,
    pipeScore: 0,
    coinScore: 0,
    highScore: 0,
    allTimeHighScore: 0,
    pipeConfig: { width: 80, minGap: 200, maxGap: 300, spawnDistance: 300, baseSpeed: 3, frequency: 1400 },
    background: null,
    difficulty: "normal",
    groundHeight: 100,
    pipeSpawnTimer: 0,
    coinSpawnTimer: 0,
    enemyBirdSpawnTimer: 0,
    jetpackSpawnTimer: 0,
    obstacleSpawnTimer: 0,
    coinSpawnInterval: 3000,
    pipeSpawnInterval: 1400,
    enemyBirdSpawnInterval: 5000,
    jetpackSpawnInterval: 10000,
    obstacleSpawnInterval: 2500,
    lives: 3,
    jetpackBoostActive: false,
    jetpackBoostTimer: 0,
    jetpackBoostDuration: 10000,
    jetpackBoostMultiplier: 2,
    jetpackBoostFlapMultiplier: 1.8,
    normalPipeSpeed: 3
};

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (gameState.bird) {
        gameState.bird.x = window.innerWidth / 4;
    }
    gameState.pipeConfig.gap = Math.max(200, Math.min(300, window.innerHeight * 0.4));
}

function loadSetting(key, defaultValue) {
    const savedSetting = localStorage.getItem(key);
    return savedSetting === null ? defaultValue : savedSetting;
}

function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

function loadAllTimeHighScore() {
    return parseInt(loadSetting(HIGH_SCORE_KEY, "0"));
}

function saveAllTimeHighScore(score) {
    saveSetting(HIGH_SCORE_KEY, score.toString());
}

function resetAllTimeHighScore() {
    if (confirm("Are you sure you want to reset all high scores?")) {
        localStorage.removeItem(HIGH_SCORE_KEY);
        gameState.allTimeHighScore = 0;
        allTimeHighScoreDisplay.innerText = "All-Time Best: 0";
        highScoreDisplay.innerText = "High Score: 0";
        gameState.highScore = 0;
        alert("All high scores have been reset!");
    }
}

function applySettings() {
    currentBirdSkin = loadSetting(BIRD_SKIN_KEY, "bird_red.png");
    currentBackgroundTheme = loadSetting(BACKGROUND_THEME_KEY, "sky_background.png");
    currentPipeSkin = loadSetting(PIPE_SKIN_KEY, "green");
    isMusicPlaying = loadSetting(MUSIC_SETTING_KEY, "true") === "true";
    gameState.difficulty = loadSetting(DIFFICULTY_KEY, "normal");

    if (flapSound) flapSound.volume = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (coinSound) coinSound.volume = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (backgroundMusic) backgroundMusic.volume = parseFloat(loadSetting(MUSIC_VOLUME_KEY, "0.3"));

    pipeColor = pipeStyles[currentPipeSkin] || pipeStyles["green"];

    if (birdSkins[currentBirdSkin]) {
        birdImage = birdSkins[currentBirdSkin];
    } else if (birdSkins["bird_red.png"]) {
        birdImage = birdSkins["bird_red.png"];
        currentBirdSkin = "bird_red.png";
    }

    if (backgroundThemes[currentBackgroundTheme]) {
        backgroundImage = backgroundThemes[currentBackgroundTheme];
    } else if (backgroundThemes["sky_background.png"]) {
        backgroundImage = backgroundThemes["sky_background.png"];
        currentBackgroundTheme = "sky_background.png";
    }

    if (gameManager && backgroundImage) {
        gameManager.changeBackgroundTheme(backgroundImage.src);
    }

    if (birdSkinSelect) birdSkinSelect.value = currentBirdSkin;
    if (backgroundSelect) backgroundSelect.value = currentBackgroundTheme;
    if (pipeSkinSelect) pipeSkinSelect.value = currentPipeSkin;
    if (difficultySelect) difficultySelect.value = gameState.difficulty;
    if (masterVolumeControl) masterVolumeControl.value = parseFloat(loadSetting("masterVolume", "1"));
    if (soundEffectsVolumeControl) soundEffectsVolumeControl.value = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (musicVolumeControl) musicVolumeControl.value = parseFloat(loadSetting(MUSIC_VOLUME_KEY, "0.3"));

    updateVolume();
    if (gameManager) {
        gameManager.resetPhysicsBasedOnDifficulty(gameState.difficulty);
    }

    if (isMusicPlaying && backgroundMusic) {
        backgroundMusic.play().catch(() => { });
    } else if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

gameState.allTimeHighScore = loadAllTimeHighScore();
if (highScoreDisplay) highScoreDisplay.innerText = "High Score: 0";
if (allTimeHighScoreDisplay) allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;

function generatePipeHeight() {
    const minHeight = 60;
    const maxHeight = window.innerHeight - gameState.pipeConfig.gap - minHeight - (gameState.groundHeight * 1.5);
    return Math.max(minHeight, Math.random() * (maxHeight - minHeight) + minHeight);
}

function createPipe() {
    const topHeight = generatePipeHeight();
    const gap = gameState.pipeConfig.gap;
    let pipe = new Pipe(window.innerWidth, topHeight, gap, gameState.groundHeight, window.innerHeight, gameState.pipeConfig.width);
    pipe.applySpeed(gameState.physics.pipeSpeed);
    createCoinInPipeGap(pipe);
    gameState.pipes.push(pipe);
    gameState.pipeSpawnTimer = 0;
}

function createCoinInPipeGap(pipe) {
    const coinY = pipe.topHeight + gameState.pipeConfig.gap / 2;
    if (coinY < pipe.topHeight + 50 || coinY > window.innerHeight - gameState.groundHeight - pipe.bottomHeight - 50) return;
    let coin = new Coin(pipe.x + pipe.width / 2, coinY, 18);
    coin.applySpeed(gameState.physics.pipeSpeed);
    gameState.coins.push(coin);
}

function createSkyCoin(dt) {
    gameState.coinSpawnTimer += dt;
    if (gameState.coinSpawnTimer >= gameState.coinSpawnInterval) {
        gameState.coinSpawnTimer = 0;
        let coinY = Math.random() * (window.innerHeight - gameState.groundHeight - 100) + 50;
        let coin = new Coin(window.innerWidth, coinY, 15);
        coin.applySpeed(gameState.physics.pipeSpeed);
        gameState.coins.push(coin);
    }
}

function createEnemyBird(dt) {
    gameState.enemyBirdSpawnTimer += dt;
    if (gameState.enemyBirdSpawnTimer >= gameState.enemyBirdSpawnInterval) {
        gameState.enemyBirdSpawnTimer = 0;
        const enemyBirdHeight = 30 + Math.random() * 20;
        const enemyBirdWidth = enemyBirdHeight * (50 / 36);
        const yPosition = Math.random() * (window.innerHeight - gameState.groundHeight - enemyBirdHeight - 50) + 50;

        let enemyBird = new EnemyBird(yPosition, enemyBirdWidth, enemyBirdHeight, gameState.physics.pipeSpeed, birdSkins);
        gameState.enemyBirds.push(enemyBird);
    }
}

function createJetpack(dt) {
    gameState.jetpackSpawnTimer += dt;
    if (gameState.jetpackSpawnTimer >= gameState.jetpackSpawnInterval) {
        gameState.jetpackSpawnTimer = 0;
        const jetpackWidth = 40;
        const jetpackHeight = 20;
        let jetpackX, jetpackY;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            attempts++;
            jetpackX = Math.random() * (window.innerWidth - jetpackWidth - 100) + 50;
            jetpackY = Math.random() * (window.innerHeight - gameState.groundHeight - jetpackHeight - 100) + 50;

            let collision = false;
            for (const pipe of gameState.pipes) {
                if (jetpackX < pipe.x + pipe.width && jetpackX + jetpackWidth > pipe.x &&
                    jetpackY < pipe.topHeight + pipe.topVerticalShift && jetpackY + jetpackHeight > 0 ||
                    jetpackY < window.innerHeight - gameState.groundHeight && jetpackY + jetpackHeight > window.innerHeight - gameState.groundHeight - pipe.bottomHeight - pipe.bottomVerticalShift) {
                    collision = true;
                    break;
                }
            }
            if (!collision) {
                break;
            }
        }

        if (attempts < maxAttempts) {
            const jetpackPowerupStrength = -10;
            const jetpackDuration = 10000;
            let jetpack = new Jetpack(jetpackX, jetpackY, jetpackWidth, jetpackHeight, gameState.physics.pipeSpeed, jetpackPowerupStrength, jetpackDuration, birdSkins);
            jetpack.applySpeed(gameState.physics.pipeSpeed);
            gameState.jetpacks.push(jetpack);
        } else {
            console.warn("Failed to find a non-colliding position for jetpack after", maxAttempts, "attempts.");
        }
    }
}

function createObstacle(dt) {
    gameState.obstacleSpawnTimer += dt;
    if (gameState.obstacleSpawnTimer >= gameState.obstacleSpawnInterval) {
        gameState.obstacleSpawnTimer = 0;

        const obstacleType = Math.random() < 0.5 ? 'cactus1.png' : 'cactus2.png';

        const obstacleWidth = 40;
        const obstacleHeight = 40 + Math.random() * 15;
        const obstacleY = window.innerHeight - gameState.groundHeight - obstacleHeight;

        let obstacle = new Obstacle(window.innerWidth + obstacleWidth, obstacleY, obstacleWidth, obstacleHeight, gameState.physics.pipeSpeed, obstacleType, obstacleImages);
        gameState.obstacles.push(obstacle);
    }
}

let lastTime = performance.now();

function updateGame(dt) {
    if (!gameState.running || gameState.paused || gameState.gameOver || !gameState.bird) return;

    if (isStoppingBird) {
        gameState.bird.velocity = 0;
    } else if (gameState.jetpackBoostActive) {
        gameState.bird.velocity = -15;
        gameState.bird.flapStrength = initialFlapStrength * gameState.jetpackBoostFlapMultiplier;
    } else {
        gameState.bird.update(dt);
        gameState.bird.flapStrength = initialFlapStrength;
    }

    if (gameState.background) gameState.background.update(dt, window.innerWidth);

    if (gameState.bird.y < 0) {
        gameState.bird.y = 0;
        gameState.bird.velocity = 0;
    }

    if (gameState.bird.y + gameState.bird.height > window.innerHeight - gameState.groundHeight) {
        if (!gameState.powerupActive) {
            gameManager.gameOver();
            return;
        } else {
            gameState.bird.y = window.innerHeight - gameState.groundHeight - gameState.bird.height;
            gameState.bird.velocity = 0;
        }
    }

    gameState.pipeSpawnTimer += dt;
    if (gameState.pipes.length === 0 || gameState.pipeSpawnTimer >= gameState.pipeSpawnInterval) {
        createPipe();
    }
    createSkyCoin(dt * 16.67);
    createEnemyBird(dt * 16.67);
    createJetpack(dt * 16.67);
    createObstacle(dt * 16.67);

    if (gameState.powerupActive) {
        gameState.powerupTimer += dt;
        gameState.jetpackBoostTimer += dt;
        if (gameState.powerupTimer >= gameState.powerupDuration) {
            gameState.powerupActive = false;
            gameState.bird.deactivateJetpack();
        }
        if (gameState.jetpackBoostActive && gameState.jetpackBoostTimer >= gameState.jetpackBoostDuration) {
            gameState.jetpackBoostActive = false;
        }
    }

    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
        const pipe = gameState.pipes[i];
        pipe.update(dt);

        if (pipe.x < -pipe.width) {
            gameState.pipes.splice(i, 1);
        }

        const birdRect = { x: gameState.bird.x, y: gameState.bird.y, width: birdImage.width, height: birdImage.height };
        const topPipeRect = { x: pipe.x, y: 0, width: pipe.width, height: pipe.topHeight + pipe.topVerticalShift };
        const bottomPipeRect = { x: pipe.x, y: window.innerHeight - gameState.groundHeight - pipe.bottomHeight - pipe.bottomVerticalShift, width: pipe.width, height: pipe.bottomHeight + pipe.bottomVerticalShift };

        if (gameManager.entityManager.circleRectCollision(gameState.bird, pipe)) {
            if (!gameState.powerupActive) {
                gameManager.gameOver();
                return;
            }
        }

        if (!pipe.scored && gameState.bird.x > pipe.x + pipe.width) {
            pipe.scored = true;
            gameState.pipeScore++;
            let scoreIncrement = 1;
            if (gameState.jetpackBoostActive) scoreIncrement *= gameState.jetpackBoostMultiplier;
            gameState.overallScore += scoreIncrement;
            updateScoreDisplay();
            if (gameState.overallScore > gameState.highScore) {
                gameState.highScore = gameState.overallScore;
                updateScoreDisplay();
            }
        }
    }

    for (let i = gameState.coins.length - 1; i >= 0; i--) {
        const coin = gameState.coins[i];
        coin.update(dt);
        if (coin.x < -coin.radius * 2) {
            gameState.coins.splice(i, 1);
            continue;
        }

        const dx = gameState.bird.x + birdImage.width / 2 - coin.x;
        const dy = gameState.bird.y + birdImage.height / 2 - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < birdImage.width / 2 + coin.radius && !coin.collected) {
            coin.collected = true;
            gameState.coinScore += 10;
            let scoreIncrement = 10;
            if (gameState.jetpackBoostActive) scoreIncrement *= gameState.jetpackBoostMultiplier;
            gameState.overallScore += scoreIncrement;
            updateScoreDisplay();
            if (coinSound) {
                coinSound.currentTime = 0;
                coinSound.play().catch(() => { });
            }
            gameState.coins.splice(i, 1);
            if (gameState.overallScore > gameState.highScore) {
                gameState.highScore = gameState.overallScore;
                updateScoreDisplay();
            }
        }
    }
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        obstacle.update(dt);

        if (obstacle.x < -obstacle.width) {
            gameState.obstacles.splice(i, 1);
            continue;
        }

        const birdRect = { x: gameState.bird.x, y: gameState.bird.y, width: birdImage.width, height: birdImage.height };
        if (gameManager.entityManager.rectRectCollision(birdRect, obstacle)) {
            if (!gameState.powerupActive) {
                gameManager.gameOver();
                return;
            } else {
                gameState.obstacles.splice(i, 1);
                continue;
            }
        }
    }

    for (let i = gameState.enemyBirds.length - 1; i >= 0; i--) {
        const enemyBird = gameState.enemyBirds[i];
        enemyBird.update(dt);

        if (enemyBird.x < -enemyBird.width) {
            gameState.enemyBirds.splice(i, 1);
            continue;
        }
        const birdRect = { x: gameState.bird.x, y: gameState.bird.y, width: birdImage.width, height: birdImage.height };
        if (gameManager.entityManager.rectRectCollision(birdRect, enemyBird)) {
            if (!gameState.powerupActive) {
                gameManager.gameOver();
                return;
            } else {
                gameState.enemyBirds.splice(i, 1);
                continue;
            }
        }
    }

    for (let i = gameState.jetpacks.length - 1; i >= 0; i--) {
        const jetpack = gameState.jetpacks[i];
        jetpack.update(dt);
        if (jetpack.x < -jetpack.width * 2) {
            gameState.jetpacks.splice(i, 1);
            continue;
        }

        const dx = gameState.bird.x + birdImage.width / 2 - jetpack.x - jetpack.width / 2;
        const dy = gameState.bird.y + birdImage.height / 2 - jetpack.y - jetpack.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < birdImage.width / 2 + jetpack.width / 2 && !jetpack.collected) {
            jetpack.collected = true;
            gameState.jetpacks.splice(i, 1);

            if (gameState.bird) {
                gameState.bird.activateJetpack(jetpack.powerupStrength, jetpack.powerupDuration);
                gameState.normalPipeSpeed = gameState.physics.pipeSpeed;
            }
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (gameState.background) gameState.background.draw(ctx, window.innerWidth, window.innerHeight, gameState.groundHeight);
    gameState.pipes.forEach(pipe => pipe.draw(ctx, pipeColor, currentPipeSkin, window.innerHeight, gameState.groundHeight));
    gameState.coins.forEach(coin => coin.draw(ctx));
    gameState.enemyBirds.forEach(enemyBird => enemyBird.draw(ctx));
    gameState.jetpacks.forEach(jetpack => jetpack.draw(ctx));
    gameState.obstacles.forEach(obstacle => obstacle.draw(ctx));
    drawGround(ctx, groundColor, groundTextureColor, window.innerWidth, window.innerHeight, gameState.groundHeight);
    drawRealisticGrass(ctx, grassColors, grassBladeColor, grassBladeThickness, grassBladeHeightMin, grassBladeHeightMax, grassTransparency, window.innerWidth, window.innerHeight, gameState.groundHeight);
    if (gameState.bird) gameState.bird.draw(ctx, birdImage);
}

function gameOver() {
    gameManager.gameOver();
}

function showLifeLostMenu() {
    gameManager.showLifeLostMenu();
}

function continueGame() {
    gameManager.continueGame();
}

function restartFromLifeLost() {
    gameManager.restartFromLifeLost();
}

function resetGameForLifeLoss() {
    resetGameElements();
    gameState.running = true;
    gameState.paused = false;
    gameState.gameOver = false;
    if (settingsButton) settingsButton.disabled = false;
    featurePanel.style.display = 'flex';

    resetPhysicsBasedOnDifficulty();
    updateScoreDisplay();

    if (pauseButton) pauseButton.textContent = "Pause";

    lastTime = performance.now();
    gameLoop();
}

function gameLoop() {
    gameManager.gameLoop(performance.now());
}

function checkAssetLoaded() {
    loadedAssets++;
    if (loadedAssets === totalAssets) {
        assetsLoaded = true;
        loadingScreen.style.display = "none";
        startMenu.style.display = "flex";
        applySettings();
        resizeCanvas();
    }
    const progress = (loadedAssets / totalAssets) * 100;
    if (loadingProgress) {
        loadingProgress.style.width = `${progress}%`;
        loadingProgress.innerText = `${Math.round(progress)}%`;
    }
}

function showSettingsMenu() {
    gameManager.showSettingsMenu();
}

function hideSettingsMenu() {
    gameManager.hideSettingsMenu();
}

function changeBirdSkinGlobal(skin) {
    if (birdSkins[skin]) {
        birdImage = birdSkins[skin];
        currentBirdSkin = skin;
        saveSetting(BIRD_SKIN_KEY, skin);
    }
}

function changeBackgroundTheme(bg) {
    gameManager.changeBackgroundTheme(bg);
    currentBackgroundTheme = bg;
    saveSetting(BACKGROUND_THEME_KEY, bg);
}

function changeDifficulty(diff) {
    gameManager.changeDifficulty(diff);
    gameState.difficulty = diff;
    saveSetting(DIFFICULTY_KEY, diff);
}

function changePipeSkinGlobal(skin) {
    if (pipeStyles[skin]) {
        pipeColor = pipeStyles[skin];
        currentPipeSkin = skin;
        saveSetting(PIPE_SKIN_KEY, skin);
    } else {
        pipeColor = pipeStyles['green'];
        currentPipeSkin = 'green';
        saveSetting(PIPE_SKIN_KEY, 'green');
    }
}

function togglePause() {
    gameManager.togglePause();
}

function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;
    saveSetting(MUSIC_SETTING_KEY, isMusicPlaying.toString());
    if (isMusicPlaying) {
        backgroundMusic.play().catch((error) => console.error("Music play error:", error));
    } else {
        backgroundMusic.pause();
    }
}

function updateVolume() {
    const masterVolume = parseFloat(masterVolumeControl.value);
    const soundEffectsVolume = parseFloat(soundEffectsVolumeControl.value);
    const musicVolume = parseFloat(musicVolumeControl.value);

    flapSound.volume = soundEffectsVolume * masterVolume;
    coinSound.volume = soundEffectsVolume * masterVolume;
    backgroundMusic.volume = musicVolume * masterVolume;

    saveSetting(SOUND_VOLUME_KEY, soundEffectsVolume.toString());
    saveSetting(MUSIC_VOLUME_KEY, musicVolume.toString());
    saveSetting("masterVolume", masterVolume.toString());
}

function resetPhysicsBasedOnDifficulty() {
    gameManager.resetPhysicsBasedOnDifficulty(gameState.difficulty);
}

function resetGameElements() {
    if (gameState.bird) gameState.bird.reset(window.innerWidth / 4, window.innerHeight / 2);
    gameState.pipes = [];
    gameState.coins = [];
    gameState.enemyBirds = [];
    gameState.jetpacks = [];
    gameState.obstacles = [];
    if (gameState.background) gameState.background.reset();
    gameState.pipeSpawnTimer = 0;
    gameState.coinSpawnTimer = 0;
    gameState.enemyBirdSpawnTimer = 0;
    gameState.jetpackSpawnTimer = 0;
    gameState.obstacleSpawnTimer = 0;
    gameState.powerupActive = false;
    gameState.jetpackBoostActive = false;
    if (gameState.bird) gameState.bird.deactivateJetpack();
}

function resetScores() {
    gameState.overallScore = 0;
    gameState.pipeScore = 0;
    gameState.coinScore = 0;
}

function updateScoreDisplay() {
    gameManager.updateScoreDisplay();
}

function initializeGame() {
    resizeCanvas();
    resetGameElements();
    resetScores();
    gameState.running = false;
    gameState.paused = false;
    gameState.gameOver = false;
    gameState.lives = 3;
    gameState.physics.flapStrength = initialFlapStrength;

    if (pauseButton) pauseButton.textContent = "Pause";
    if (settingsButton) settingsButton.disabled = false;
    if (featurePanel) featurePanel.style.display = 'flex';

    resetPhysicsBasedOnDifficulty();
    updateScoreDisplay();

    if (startMenu) startMenu.style.display = "none";
    if (gameOverMenu) gameOverMenu.style.display = "none";
    if (settingsMenu) settingsMenu.style.display = "none";
    if (pauseMenu) pauseMenu.style.display = "none";
    if (lifeLostMenu) lifeLostMenu.style.display = "none";
    if (newHighScoreDisplay) newHighScoreDisplay.style.display = "none";
    if (newAllTimeHighScoreDisplay) newAllTimeHighScoreDisplay.style.display = "none";

    if (backgroundMusic && isMusicPlaying) {
        backgroundMusic.play().catch(() => { });
    } else if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

function startGame() {
    gameManager.startGame();
}

function restartGame() {
    gameManager.restartGame();
}

function showStartMenu() {
    gameManager.showStartMenu();
}

function flap(e) {
    if (e) e.preventDefault();
    gameManager.flap();
}

function handleStopButtonDown(event) {
    isStoppingBird = true;
    event.preventDefault();
}

function handleStopButtonUp(event) {
    isStoppingBird = false;
    event.preventDefault();
}

birdSkins["bird_red.png"] = new Image();
birdSkins["bird_green.png"] = new Image();
birdSkins["bird_blue.png"] = new Image();
birdSkins["enemy_bird.png"] = new Image();
birdSkins["jetpack.png"] = new Image();
backgroundThemes["sky_background.png"] = new Image();
backgroundThemes["city_background.png"] = new Image();
backgroundThemes["night_background.png"] = new Image();
obstacleImages["cactus1.png"] = new Image();
obstacleImages["cactus2.png"] = new Image();

const assets = [
    { image: birdSkins["jetpack.png"], src: "png/jetpack.png" },
    { image: birdSkins["bird_red.png"], src: "png/bird_red.png" },
    { image: birdSkins["bird_green.png"], src: "png/bird_green.png" },
    { image: birdSkins["bird_blue.png"], src: "png/bird_blue.png" },
    { image: birdSkins["enemy_bird.png"], src: "png/enemy_bird.png" },
    { image: backgroundThemes["sky_background.png"], src: "png/sky_background.png" },
    { image: backgroundThemes["city_background.png"], src: "png/city_background.png" },
    { image: backgroundThemes["night_background.png"], src: "png/night_background.png" },
    { image: obstacleImages["cactus1.png"], src: "png/cactus1.png" },
    { image: obstacleImages["cactus2.png"], src: "png/cactus2.png" },
    { audio: backgroundMusic, src: "audio/background_music.mp3" }
];

assets.forEach((asset, index) => {
    if (asset.image) {
        asset.image.src = asset.src;
        asset.image.onload = () => {
            checkAssetLoaded();
        };
        asset.image.onerror = () => {
            checkAssetLoaded();
        };
    } else if (asset.audio) {
        asset.audio.addEventListener("canplaythrough", () => {
            checkAssetLoaded();
        });
        asset.audio.addEventListener("error", () => {
            checkAssetLoaded();
        });
        asset.audio.preload = "auto";
        asset.audio.src = asset.src;
    }
});

window.addEventListener("load", function () {
    const startButtonElement = document.getElementById("startGameButton");
    const settingsButtonElement = document.getElementById("startSettingsButton");
    const resumeButtonElement = document.getElementById("resumeButton");
    const mainMenuPauseButtonElement = document.getElementById("mainMenuPauseButton");
    const playAgainButtonElement = document.getElementById("playAgainButton");
    const mainMenuGameOverButtonElement = document.getElementById("mainMenuGameOverButton");
    const continuePlayAgainButtonElement = document.getElementById("continuePlayAgainButton");
    const mainMenuContinueButtonElement = document.getElementById("mainMenuContinueButton");
    const closeSettingsButtonElement = document.getElementById("closeSettingsButton");
    const backSettingsButtonElement = document.getElementById("backSettingsButton");
    const resetRecordsButtonElement = document.getElementById("resetRecordsButton");
    const settingsFeaturePanelButtonElement = document.getElementById("settingsButton");
    const pauseFeaturePanelButtonElement = document.getElementById("pauseButton");
    const continueAfterLifeLostButtonElement = document.getElementById("continueAfterLifeLostButton");
    const restartFromLifeLostButtonElement = document.getElementById("restartFromLifeLostButton");

    stopButton.addEventListener('mousedown', handleStopButtonDown);
    stopButton.addEventListener('mouseup', handleStopButtonUp);
    stopButton.addEventListener('touchstart', handleStopButtonDown);
    stopButton.addEventListener('touchend', handleStopButtonUp);
    stopButton.addEventListener('mouseleave', handleStopButtonUp);

    pauseButton.style.display = "block";
    settingsButton.style.display = "block";
    featurePanel.style.display = 'flex';
    birdSkinSelect.innerHTML = `
        <option value="bird_red.png">Red Bird</option>
        <option value="bird_green.png">Green Bird</option>
        <option value="bird_blue.png">Blue Bird</option>
    `;
    backgroundSelect.innerHTML = `
        <option value="sky_background.png">Sky</option>
        <option value="city_background.png">City</option>
        <option value="night_background.png">Night</option>
    `;
    pipeSkinSelect.innerHTML = `
        <option value="green">Green</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
    `;
    difficultySelect.innerHTML = `
        <option value="easy">Easy</option>
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
    `;

    if (assetsLoaded) {
        loadingScreen.style.display = "none";
        startMenu.style.display = "flex";
        applySettings();
        resizeCanvas();

        gameManager = new GameManager(canvas, ctx);

        startButtonElement.addEventListener('click', () => gameManager.startGame());
        settingsButtonElement.addEventListener('click', () => gameManager.showSettingsMenu());
        pauseButton.addEventListener('click', () => gameManager.togglePause());
        resumeButtonElement.addEventListener('click', () => gameManager.resumeGameFromMenu());
        mainMenuPauseButtonElement.addEventListener('click', () => gameManager.showStartMenu());
        playAgainButtonElement.addEventListener('click', () => gameManager.restartGame());
        mainMenuGameOverButtonElement.addEventListener('click', () => gameManager.showStartMenu());
        continuePlayAgainButtonElement.addEventListener('click', () => gameManager.continueGame());
        mainMenuContinueButtonElement.addEventListener('click', () => gameManager.showStartMenu());
        closeSettingsButtonElement.addEventListener('click', () => gameManager.hideSettingsMenu());
        backSettingsButtonElement.addEventListener('click', () => gameManager.hideSettingsMenu());
        resetRecordsButtonElement.addEventListener('click', () => resetAllTimeHighScore());
        settingsFeaturePanelButtonElement.addEventListener('click', () => gameManager.showSettingsMenu());
        pauseFeaturePanelButtonElement.addEventListener('click', () => gameManager.togglePause());
        continueAfterLifeLostButtonElement.addEventListener('click', () => gameManager.continueGame());
        restartFromLifeLostButtonElement.addEventListener('click', () => gameManager.restartFromLifeLost());

    } else {
        loadingScreen.style.display = "flex";
        startMenu.style.display = "none";
    }
});

window.addEventListener("resize", resizeCanvas);

class Pipe {
    constructor(x, topHeight, gap, groundHeight, canvasHeight, width) {
        this.x = x;
        this.topHeight = topHeight;
        this.gap = gap;
        this.bottomHeight = canvasHeight - groundHeight - topHeight - gap;
        this.width = width;
        this.scored = false;
        this.speed = 0;
        this.topVerticalShift = 0;
        this.bottomVerticalShift = 0;
        this.pipeShiftSpeed = 0.02 + Math.random() * 0.03;
        this.topShiftDirection = Math.random() > 0.5 ? 1 : -1;
        this.bottomShiftDirection = Math.random() > 0.5 ? -1 : 1;
    }

    update(dt) {
        this.x -= this.speed * dt;
        this.topVerticalShift += this.pipeShiftSpeed * dt * this.topShiftDirection * 50;
        if (Math.abs(this.topVerticalShift) > 80) {
            this.topShiftDirection *= -1;
        }
        this.bottomVerticalShift += this.pipeShiftSpeed * dt * this.bottomShiftDirection * 40;
        if (Math.abs(this.bottomVerticalShift) > 70) {
            this.bottomShiftDirection *= -1;
        }
    }

    draw(ctx, pipeColor, currentPipeSkin, canvasHeight, groundHeight) {
        const shiftedTopHeight = this.topHeight + this.topVerticalShift;
        const shiftedBottomHeight = this.bottomHeight + this.bottomVerticalShift;

        switch (currentPipeSkin) {
            case "blue":
                drawBluePipe(ctx, this.x, shiftedTopHeight, shiftedBottomHeight, this.width, canvasHeight, groundHeight);
                break;
            case "red":
                drawRedPipe(ctx, this.x, shiftedTopHeight, shiftedBottomHeight, this.width, canvasHeight, groundHeight);
                break;
            default:
                ctx.fillStyle = pipeColor;
                ctx.fillRect(this.x, 0, this.width, shiftedTopHeight);
                ctx.fillRect(this.x, canvasHeight - groundHeight - shiftedBottomHeight, this.width, shiftedBottomHeight);
                break;
        }
    }

    reset(x) {
        this.x = x;
        this.scored = false;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class Coin {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.collected = false;
        this.speed = 0;
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, "white");
        const enhancedCoinGradient = "#EEC900";
        const coinColor = "#FFD700";
        const coinOutlineColor = "#DAA520";
        gradient.addColorStop(0.2, enhancedCoinGradient);
        gradient.addColorStop(1, coinColor);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = coinOutlineColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 2, 0, Math.PI / 2, false);
        ctx.stroke();
    }

    reset(x) {
        this.x = x;
        this.collected = false;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class EnemyBird {
    constructor(y, width, height, speed, birdSkins) {
        this.x = window.innerWidth + width;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.enemyBirdImage = birdSkins["enemy_bird.png"];
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    draw(ctx) {
        ctx.drawImage(this.enemyBirdImage, this.x, this.y, this.width, this.height);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class Jetpack {
    constructor(x, y, width, height, speed, powerupStrength, duration, birdSkins) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.powerupStrength = powerupStrength;
        this.duration = duration;
        this.collected = false;
        this.jetpackImage = birdSkins["jetpack.png"];
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    draw(ctx) {
        const jetpackColor = "#FFA500";
        const jetpackOutlineColor = "#FF8C00";
        if (this.jetpackImage && this.jetpackImage.complete) {
            ctx.drawImage(this.jetpackImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = jetpackColor;
            ctx.strokeStyle = jetpackOutlineColor;
            ctx.lineWidth = 4;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 4, this.width / 4, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.collected = false;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class Obstacle {
    constructor(x, y, width, height, speed, imageSrc, obstacleImages) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.obstacleImage = obstacleImages[imageSrc];
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    draw(ctx) {
        if (!this.obstacleImage || !this.obstacleImage.complete) {
            ctx.fillStyle = "brown";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        ctx.drawImage(this.obstacleImage, this.x, this.y, this.width, this.height);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class Background {
    constructor(image, speed) {
        this.image = image;
        this.speed = speed;
        this.x = 0;
    }

    update(dt, canvasWidth) {
        this.x -= this.speed * dt;
        if (this.x <= -canvasWidth) this.x = 0;
    }

    draw(ctx, canvasWidth, canvasHeight, groundHeight) {
        if (!this.image || !this.image.complete) {
            ctx.fillStyle = "#87CEEB";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight - groundHeight);
            return;
        }

        ctx.drawImage(this.image, this.x, 0, canvasWidth, canvasHeight - groundHeight);
        ctx.drawImage(this.image, this.x + canvasWidth, 0, canvasWidth, canvasHeight - groundHeight);
    }

    reset() {
        this.x = 0;
    }

    applySpeed(speed) {
        this.speed = speed;
    }

    changeImage(image) {
        this.image = image;
    }
}

function drawGround(ctx, groundColor, textureColor, canvasWidth, canvasHeight, groundHeight) {
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, canvasHeight - groundHeight, canvasWidth, groundHeight);
    ctx.fillStyle = textureColor;
    for (let i = 0; i < canvasWidth; i += 5) {
        for (let j = canvasHeight - groundHeight; j < canvasHeight; j += 5) {
            if (Math.random() < 0.2) ctx.fillRect(i, j, 1, 1);
        }
    }
}

function drawRealisticGrass(ctx, grassColors, bladeColor, bladeThickness, bladeHeightMin, bladeHeightMax, grassTransparency, canvasWidth, canvasHeight, groundHeight) {
    const grassTop = canvasHeight - groundHeight;
    ctx.globalAlpha = grassTransparency;

    for (let x = 0; x <= canvasWidth; x += 8) {
        const bladeBaseY = grassTop;
        const bladeTopY = grassTop - (Math.random() * (bladeHeightMax - bladeHeightMin) + bladeHeightMin);
        const bladeMidY = (bladeBaseY + bladeTopY) / 2;
        const bladeControlX = x + (Math.random() - 0.5) * 10;
        const bladeTipX = x + (Math.random() - 0.5) * 5;

        ctx.strokeStyle = grassColors[Math.floor(Math.random() * grassColors.length)];
        ctx.lineWidth = bladeThickness;
        ctx.beginPath();
        ctx.moveTo(x, bladeBaseY);
        ctx.quadraticCurveTo(bladeControlX, bladeMidY, bladeTipX, bladeTopY);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawBluePipe(ctx, x, topHeight, bottomHeight, pipeWidth, canvasHeight, groundHeight) {
    const blue500 = "rgb(33, 150, 243)";
    const blue900 = "rgb(26, 35, 126)";
    const blue200 = "rgb(187, 222, 251)";

    let topGradient = ctx.createLinearGradient(x, 0, x + pipeWidth, 0);
    topGradient.addColorStop(0, blue200);
    topGradient.addColorStop(0.5, blue500);
    topGradient.addColorStop(1, blue900);
    ctx.fillStyle = topGradient;
    ctx.fillRect(x, 0, pipeWidth, topHeight);

    let bottomGradient = ctx.createLinearGradient(x, canvasHeight - groundHeight - bottomHeight, x + pipeWidth, canvasHeight - groundHeight - bottomHeight);
    bottomGradient.addColorStop(0, blue900);
    bottomGradient.addColorStop(0.5, blue500);
    bottomGradient.addColorStop(1, blue200);
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);
}

function drawRedPipe(ctx, x, topHeight, bottomHeight, pipeWidth, canvasHeight, groundHeight) {
    const red500 = "rgb(244, 67, 54)";
    const red900 = "rgb(183, 28, 28)";
    const red200 = "rgb(255, 204, 204)";

    let topGradient = ctx.createLinearGradient(x, 0, x + pipeWidth, 0);
    topGradient.addColorStop(0, red200);
    topGradient.addColorStop(0.5, red500);
    topGradient.addColorStop(1, red900);
    ctx.fillStyle = topGradient;
    ctx.fillRect(x, 0, pipeWidth, topHeight);

    let bottomGradient = ctx.createLinearGradient(x, canvasHeight - groundHeight - bottomHeight, x + pipeWidth, canvasHeight - groundHeight - bottomHeight);
    bottomGradient.addColorStop(0, red900);
    bottomGradient.addColorStop(0.5, red500);
    bottomGradient.addColorStop(1, red200);
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);
}

class BirdClass {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = 0;
        this.gravity = 0;
        this.flapStrength = 0;
        this.isPowerupActive = false;
        this.originalFlapStrength = 0;
    }

    update(dt) {
        this.velocity += this.gravity * dt;
        this.y += this.velocity * dt;
    }

    flap() {
        this.velocity = this.flapStrength;
    }

    draw(ctx, image) {
        if (!image || !image.complete) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        const rotation = Math.min(Math.PI / 6, Math.max(-Math.PI / 6, this.velocity * 0.04));
        ctx.rotate(rotation);
        ctx.drawImage(image, -this.width / 2, -this.width / 2, this.width, this.height);
        ctx.restore();
        if (this.isPowerupActive) {
            this.drawJetpackEffect(ctx);
        }
    }

    drawJetpackEffect(ctx) {
        const jetpackImage = birdSkins["jetpack.png"];

        if (jetpackImage && jetpackImage.complete) {
            const jetpackWidth = this.width * 1.5;
            const jetpackHeight = this.height * 0.8;
            const jetpackXOffset = 0;
            const jetpackYOffset = this.height * 0.7;

            ctx.drawImage(
                jetpackImage,
                this.x + jetpackXOffset - jetpackWidth / 2,
                this.y + this.height - jetpackYOffset,
                jetpackWidth,
                jetpackHeight
            );
        } else {
            const jetpackColor = "#FFA500";
            const jetpackOutlineColor = "#FF8C00";
            ctx.fillStyle = jetpackColor;
            ctx.strokeStyle = jetpackOutlineColor;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(this.x - 5, this.y + this.height);
            ctx.lineTo(this.x + this.width + 5, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height + 20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height + 15);
            ctx.closePath();
            ctx.fill();
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.isPowerupActive = false;
    }

    applyPhysics(gravity, flapStrength) {
        this.gravity = gravity;
        this.flapStrength = flapStrength;
        this.originalFlapStrength = flapStrength;
    }

    activateJetpack(powerupStrength, duration) {
        this.isPowerupActive = true;
        gameState.powerupActive = true;
        gameState.powerupTimer = 0;
        gameState.powerupDuration = duration;
        gameState.physics.pipeSpeed *= 1.5;
        if (gameState.background) gameState.background.applySpeed(gameState.physics.pipeSpeed / 3 * gameState.physics.grassSpeedFactor);
        gameState.jetpackBoostActive = true;
        gameState.jetpackBoostTimer = 0;
        this.flapStrength = this.originalFlapStrength * gameState.jetpackBoostFlapMultiplier;
    }

    deactivateJetpack() {
        this.isPowerupActive = false;
        gameState.powerupActive = false;
        gameState.powerupTimer = 0;
        gameState.physics.pipeSpeed = gameState.normalPipeSpeed || gameState.pipeConfig.baseSpeed;
        if (gameState.background) gameState.background.applySpeed(gameState.physics.pipeSpeed / 3 * gameState.physics.grassSpeedFactor);
        gameState.pipes.forEach(pipe => pipe.applySpeed(gameState.physics.pipeSpeed));
        gameState.coins.forEach(coin => coin.applySpeed(gameState.physics.pipeSpeed));
        gameState.enemyBirds.forEach(enemyBird => enemyBird.applySpeed(gameState.physics.pipeSpeed));
        gameState.jetpacks.forEach(jetpack => jetpack.applySpeed(gameState.physics.pipeSpeed));
        gameState.obstacles.forEach(obstacle => obstacle.applySpeed(gameState.physics.pipeSpeed));
        gameState.jetpackBoostActive = false;
        this.flapStrength = this.originalFlapStrength;
    }
}

class EntityManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.pipes = [];
        this.coins = [];
        this.enemyBirds = [];
        this.jetpacks = [];
        this.obstacles = [];
        this.pipeSpawnInterval = 2000;
        this.lastPipeSpawn = 0;
        this.pipeSpeed = 2;
        this.pipeScore = 0;
        this.coinScore = 0;
        this.difficulty = localStorage.getItem("flippyBirdDifficulty") || "normal";
        this.pipeSkin = localStorage.getItem("flippyPipeSkin") || "green";
    }

    reset() {
        this.pipes = [];
        this.coins = [];
        this.enemyBirds = [];
        this.jetpacks = [];
        this.obstacles = [];
        this.lastPipeSpawn = 0;
        this.pipeScore = 0;
        this.coinScore = 0;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        if (difficulty === "easy") {
            this.pipeSpawnInterval = 2500;
            this.pipeSpeed = 1.5;
        } else if (difficulty === "hard") {
            this.pipeSpawnInterval = 1500;
            this.pipeSpeed = 3;
        } else {
            this.pipeSpawnInterval = 2000;
            this.pipeSpeed = 2;
        }
    }

    setPipeSkin(pipeSkin) {
        this.pipeSkin = pipeSkin;
    }

    update(deltaTime) {
        this.lastPipeSpawn += deltaTime;
        if (this.lastPipeSpawn >= this.pipeSpawnInterval) {
            this.spawnPipe();
            this.lastPipeSpawn = 0;
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed * deltaTime;
            if (pipe.x + pipe.width < 0) {
                this.pipes.splice(i, 1);
                this.pipeScore++;
            }
        }

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.update(deltaTime);
            if (coin.x + coin.radius * 2 < 0) {
                this.coins.splice(i, 1);
            }
        }
        for (let i = this.enemyBirds.length - 1; i >= 0; i--) {
            const enemyBird = this.enemyBirds[i];
            enemyBird.update(deltaTime);
            if (enemyBird.x + enemyBird.width < 0) {
                this.enemyBirds.splice(i, 1);
            }
        }
        for (let i = this.jetpacks.length - 1; i >= 0; i--) {
            const jetpack = this.jetpacks[i];
            jetpack.update(deltaTime);
            if (jetpack.x + jetpack.width < 0) {
                this.jetpacks.splice(i, 1);
            }
        }
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(deltaTime);
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawnPipe() {
        const gapHeight = 150;
        const pipeWidth = 80;
        const minPipeHeight = 50;
        const maxPipeHeight = this.canvas.height - gapHeight - minPipeHeight - (gameState.groundHeight * 1.5);
        const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
        const bottomPipeY = topPipeHeight + gapHeight;
        const bottomPipeHeight = this.canvas.height - bottomPipeY - gameState.groundHeight;

        const topPipe = new Pipe(this.canvas.width, topPipeHeight, gapHeight, gameState.groundHeight, this.canvas.height, pipeWidth);
        topPipe.applySpeed(this.pipeSpeed);

        const bottomPipe = new Pipe(this.canvas.width, bottomPipeY, gapHeight, gameState.groundHeight, this.canvas.height, pipeWidth);
        bottomPipe.applySpeed(this.pipeSpeed);

        this.pipes.push(topPipe);
        this.pipes.push(bottomPipe);
    }

    draw() {
        const pipeColor = this.getPipeColor();
        this.pipes.forEach(pipe => pipe.draw(this.ctx, pipeColor, this.pipeSkin, this.canvas.height, gameState.groundHeight));
        this.coins.forEach(coin => coin.draw(this.ctx));
        this.enemyBirds.forEach(enemyBird => enemyBird.draw(this.ctx));
        this.jetpacks.forEach(jetpack => jetpack.draw(this.ctx));
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    }

    getPipeColor() {
        if (this.pipeSkin === "red") {
            return "#ff4d4d";
        } else if (this.pipeSkin === "blue") {
            return "#4d79ff";
        } else {
            return "#4dff4d";
        }
    }

    checkCollisions(bird) {
        for (let pipe of this.pipes) {
            if (this.circleRectCollision(bird, pipe)) {
                return true;
            }
        }
        for (let obstacle of this.obstacles) {
            if (this.rectRectCollision(bird, obstacle)) {
                return true;
            }
        }
        for (let enemyBird of this.enemyBirds) {
             if (this.rectRectCollision(bird, enemyBird)) {
                return true;
            }
        }
        return false;
    }

    circleRectCollision(bird, pipe) {
        let rect1 = { x: pipe.x, y: 0, width: pipe.width, height: pipe.topHeight + pipe.topVerticalShift };
        if (this.isCircleRectColliding(bird, rect1)) return true;

        let rect2 = { x: pipe.x, y: this.canvas.height - gameState.groundHeight - pipe.bottomHeight - pipe.bottomVerticalShift, width: pipe.width, height: pipe.bottomHeight + pipe.bottomVerticalShift };
        if (this.isCircleRectColliding(bird, rect2)) return true;

        return false;
    }

    rectRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    isCircleRectColliding(circle, rect) {
        let distX = Math.abs(circle.x + birdImage.width / 2 - rect.x - rect.width / 2);
        let distY = Math.abs(circle.y + birdImage.height / 2 - rect.y - rect.height / 2);

        if (distX > (rect.width / 2 + birdImage.width / 2)) { return false; }
        if (distY > (rect.height / 2 + birdImage.height / 2)) { return false; }

        if (distX <= (rect.width / 2)) { return true; }
        if (distY <= (rect.height / 2)) { return true; }

        let dx = distX - rect.width / 2;
        let dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (birdImage.width / 2 * birdImage.width / 2));
    }

    getPipeScore() {
        return this.pipeScore;
    }

    getCoinScore() {
        return this.coinScore;
    }
}

class SceneManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.background = new Background(null, 2);

        this.loadInitialBackground();

        this.groundHeight = 100;
        this.groundColor = "#8B4513";
        this.groundTextureColor = "#654321";
        this.grassColors = ["#4CAF50", "#66BB6A", "#81C784"];
        this.grassBladeColor = "#388E3C";
        this.grassBladeThickness = 2;
        this.grassBladeHeightMin = 10;
        this.grassBladeHeightMax = 25;
        this.grassTransparency = 0.8;
        this.groundX = 0;
        this.groundSpeed = 2;
    }

    loadInitialBackground() {
        const backgroundTheme = localStorage.getItem("flippyBackground") || "sky_background.png";
        const backgroundThemes = {
            "sky_background.png": 'png/sky_background.png',
            "city_background.png": 'png/city_background.png',
            "night_background.png": 'png/night_background.png'
        };
        const backgroundPath = backgroundThemes[backgroundTheme];
        if (backgroundPath) {
            const backgroundImage = new Image();
            backgroundImage.src = backgroundPath;
            backgroundImage.onload = () => {
                this.background.changeImage(backgroundImage);
            };
        }
    }

    setBackground(bgPath) {
        const backgroundImage = new Image();
        backgroundImage.src = bgPath;
        this.background.changeImage(backgroundImage);
    }

    update(deltaTime) {
        this.groundX -= this.groundSpeed * deltaTime;
        if (this.groundX <= -this.canvas.width) {
            this.groundX = 0;
        }
        this.background.update(deltaTime, this.canvas.width);
    }

    draw() {
        this.background.draw(this.ctx, this.canvas.width, this.canvas.height, this.groundHeight);
        drawGround(this.ctx, this.groundColor, this.groundTextureColor, this.canvas.width, this.canvas.height, this.groundHeight);
        drawRealisticGrass(this.ctx, this.grassColors, this.grassBladeColor, this.grassBladeThickness, this.grassBladeHeightMin, this.grassBladeHeightMax, this.grassTransparency, this.canvas.width, this.canvas.height, this.groundHeight);
    }

    reset() {
        this.groundX = 0;
        this.background.reset();
    }
}

class GameManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.running = false;
        this.paused = false;
        this.gameOver = false;

        this.bird = new BirdClass(canvas.width / 4, canvas.height / 2, 50, 36);
        this.sceneManager = new SceneManager(this.canvas, this.ctx);
        this.entityManager = new EntityManager(this.canvas, this.ctx);

        this.sceneManager.loadInitialBackground();

        this.sounds = {
            flap: flapSound,
            coin: coinSound,
            backgroundMusic: backgroundMusic
        };

        this.setupInput();
    }

    setupInput() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                this.flap();
            }
        });
        window.addEventListener("click", () => {
            if (!this.paused && !this.gameOver && this.running) {
                this.flap();
            }
        });
    }

    playSound(audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(error => console.warn("Audio play failed:", error));
    }

    flap() {
        if (!this.paused && !this.gameOver && this.running) {
            this.bird.flap();
            this.playSound(this.sounds.flap);
        }
    }

    stopBird() {
        this.bird.stop();
    }

    startGame() {
        gameState.running = true;
        gameState.paused = false;
        gameState.gameOver = false;
        startMenu.style.display = "none";
        gameOverMenu.style.display = "none";
        pauseMenu.style.display = "none";
        lifeLostMenu.style.display = "none";
        document.getElementById("continueMenu").style.display = "none";
        gameState.lives = 3;
        livesRemainingDisplay.innerText = `Lives: ${gameState.lives}`;
        gameState.overallScore = 0;
        gameState.pipeScore = 0;
        gameState.coinScore = 0;
        this.updateScoreDisplay();
        this.lastTime = performance.now();

        this.bird.reset(this.canvas.width / 4, this.canvas.height / 2);
        this.entityManager.reset();
        this.sceneManager.reset();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    restartGame() {
        this.startGame();
    }

    continueGame() {
        if (gameState.lives > 0) {
            gameState.gameOver = false;
            lifeLostMenu.style.display = "none";
            gameState.paused = false;
            gameState.running = true;
            this.bird.reset(this.canvas.width / 4, this.canvas.height / 2);
            this.entityManager.reset();
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        } else {
            this.showGameOverMenu();
        }
    }

    restartFromLifeLost() {
        this.restartGame();
    }

    showStartMenu() {
        gameState.running = false;
        gameState.paused = false;
        gameState.gameOver = false;
        startMenu.style.display = "flex";
        gameOverMenu.style.display = "none";
        pauseMenu.style.display = "none";
        lifeLostMenu.style.display = "none";
        document.getElementById("continueMenu").style.display = "none";
        backgroundMusic.pause();
    }

    showSettingsMenu() {
        const settingsMenuElement = document.getElementById("settingsMenu");
        settingsMenuElement.style.display = "flex";
        this.pauseGameForMenu();
    }

    hideSettingsMenu() {
        const settingsMenuElement = document.getElementById("settingsMenu");
        settingsMenuElement.style.display = "none";
        this.resumeGameFromMenu();
    }

    pauseGameForMenu() {
        gameState.paused = true;
        backgroundMusic.pause();
    }

    resumeGameFromMenu() {
        gameState.paused = false;
        if (gameState.running) {
            backgroundMusic.play().catch(() => { });
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    changeBirdSkin(skinPath) {
        changeBirdSkinGlobal(skinPath);
    }

    changeBackgroundTheme(themePath) {
        this.sceneManager.setBackground(themePath);
    }

    changeDifficulty(difficulty) {
        this.entityManager.setDifficulty(difficulty);
        this.resetPhysicsBasedOnDifficulty(difficulty);
    }

    changePipeSkin(pipeSkin) {
        this.entityManager.setPipeSkin(pipeSkin);
        changePipeSkinGlobal(pipeSkin);
    }

    resetPhysicsBasedOnDifficulty(difficulty) {
        let gravity = 0.4;
        let pipeSpeed = 3;
        let pipeGap = 240;
        let pipeSpawnInterval = 1400;
        let grassSpeedFactor = 1;
        let enemyBirdSpawnInterval = 5000;
        let jetpackSpawnInterval = 10000;
        let obstacleSpawnInterval = 2500;

        switch (difficulty) {
            case "easy":
                gravity = 0.3;
                pipeSpeed = 2;
                pipeGap = 280;
                pipeSpawnInterval = 2800;
                grassSpeedFactor = 0.3;
                enemyBirdSpawnInterval = 9000;
                jetpackSpawnInterval = 18000;
                obstacleSpawnInterval = 4000;
                break;
            case "hard":
                gravity = 0.5;
                pipeSpeed = 4;
                pipeGap = 160;
                pipeSpawnInterval = 700;
                grassSpeedFactor = 2;
                enemyBirdSpawnInterval = 2500;
                jetpackSpawnInterval = 6000;
                obstacleSpawnInterval = 1200;
                break;
            }

        gameState.physics.gravity = gravity;
        gameState.physics.pipeSpeed = pipeSpeed;
        gameState.pipeConfig.gap = pipeGap;
        gameState.pipeSpawnInterval = pipeSpawnInterval;
        gameState.physics.grassSpeedFactor = grassSpeedFactor;
        gameState.enemyBirdSpawnInterval = enemyBirdSpawnInterval;
        gameState.jetpackSpawnInterval = jetpackSpawnInterval;
        gameState.obstacleSpawnInterval = obstacleSpawnInterval;

        this.entityManager.pipeSpeed = pipeSpeed;
        this.sceneManager.groundSpeed = pipeSpeed * grassSpeedFactor;

        this.bird.applyPhysics(gravity, initialFlapStrength);
        gameState.pipes.forEach(pipe => pipe.applySpeed(pipeSpeed));
        gameState.coins.forEach(coin => coin.applySpeed(pipeSpeed));
        gameState.enemyBirds.forEach(enemyBird => enemyBird.applySpeed(pipeSpeed));
        gameState.jetpacks.forEach(jetpack => jetpack.applySpeed(pipeSpeed));
        gameState.obstacles.forEach(obstacle => obstacle.applySpeed(pipeSpeed));
        this.sceneManager.background.applySpeed(pipeSpeed / 3 * grassSpeedFactor);
    }

    togglePause() {
        if (!gameState.running && !gameState.paused) return;
        gameState.paused = !gameState.paused;
        settingsButton.disabled = gameState.paused;
        featurePanel.style.display = gameState.paused ? 'flex' : 'none';
        if (gameState.paused) {
            gameState.running = false;
            pauseMenu.style.display = "flex";
            pauseButton.textContent = "Resume";
            backgroundMusic.pause();
            lifeLostMenu.style.display = "none";
            gameOverMenu.style.display = "none";
        } else {
            gameState.running = true;
            pauseMenu.style.display = "none";
            pauseButton.textContent = "Pause";
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
            if (isMusicPlaying) backgroundMusic.play().catch(() => { });
        }
    }

    gameOver() {
        if (!gameState.running) return;

        if (gameState.lives > 1) {
            gameState.running = false;
            gameState.paused = true;
            gameState.lives--;
            livesRemainingDisplay.innerText = `Lives: ${gameState.lives}`;
            this.showLifeLostMenu();
            return;
        }

        gameState.running = false;
        gameState.gameOver = true;
        settingsButton.disabled = true;
        featurePanel.style.display = 'none';
        backgroundMusic.pause();

        const finalScoreContinueDisplayElement = document.getElementById("finalScoreContinue");
        if (finalScoreContinueDisplayElement) {
            finalScoreContinueDisplayElement.innerText = `Your Score: ${gameState.overallScore}`;
        }

        document.getElementById("continueMenu").style.display = "flex";
        gameOverMenu.style.display = "none";
        pauseMenu.style.display = "none";
        lifeLostMenu.style.display = "none";
        if (gameState.overallScore > gameState.allTimeHighScore) {
            gameState.allTimeHighScore = gameState.overallScore;
            saveAllTimeHighScore(gameState.allTimeHighScore);
            allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;
            newAllTimeHighScoreDisplay.style.display = "block";
        }
        if (gameState.overallScore > gameState.highScore) {
            gameState.highScore = gameState.overallScore;
            highScoreDisplay.innerText = "High Score: " + gameState.highScore;
            newHighScoreDisplay.style.display = "block";
        }
        finalScoreDisplay.innerText = `Your Score: ${gameState.overallScore}`;
        gameOverMenu.style.display = "flex";
    }

    showLifeLostMenu() {
        if (livesRemainingDisplay) {
            livesRemainingDisplay.innerText = `Lives: ${gameState.lives}`;
        }
        lifeLostMenu.style.display = "flex";
        pauseMenu.style.display = "none";
        gameOverMenu.style.display = "none";
        startMenu.style.display = "none";
    }

    updateScoreDisplay() {
        if (!pipeScoreDisplay || !coinScoreDisplay || !scoreDisplay ||
            !highScoreDisplay || !allTimeHighScoreDisplay) return;

        pipeScoreDisplay.innerText = "Pipes: " + gameState.pipeScore;
        coinScoreDisplay.innerText = "Coins: " + gameState.coinScore;
        scoreDisplay.innerText = "Score: " + Math.floor(gameState.overallScore);
        highScoreDisplay.innerText = `High Score: ${gameState.highScore}`;
        allTimeHighScoreDisplay.innerText = `All-Time Best: ${gameState.allTimeHighScore}`;

        if (livesRemainingDisplay) {
            livesRemainingDisplay.innerText = "Lives: " + gameState.lives;
        }
    }

    gameLoop(timestamp) {
        if (!gameState.running || gameState.paused || gameState.gameOver) return;

        this.deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.sceneManager.update(this.deltaTime);
        this.sceneManager.draw();

        this.bird.update(this.deltaTime);
        this.bird.draw(ctx, birdImage);

        this.entityManager.update(this.deltaTime);
        this.entityManager.draw();

        if (this.entityManager.checkCollisions(gameState.bird)) {
            if (!gameState.powerupActive) {
                this.gameOver();
                return;
            }
        }

        gameState.overallScore += this.deltaTime * 0.01;
        this.updateScoreDisplay();
        if (gameState.overallScore > gameState.highScore) {
            gameState.highScore = gameState.overallScore;
            this.updateScoreDisplay();
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

let gameManager;