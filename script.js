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
const crashSound = document.getElementById("crashSound");
const gameOverSound = document.getElementById("gameOverSound");
const jetpackSound = document.getElementById("jetpackSound");
const yaySound = document.getElementById("yaySound");

let assetsLoaded = false;
let loadedAssets = 0;
const totalAssets = 6;
const birdSkins = {};
const backgroundThemes = {};
const pipeStyles = {
    "green": "#1e8449",
    "red": "red",
    "blue": "blue"
};
let birdImage;
let backgroundImage;
let enemyBirdImage;
let pipeColor = pipeStyles["green"];
let currentPipeSkin = "green";
let currentBirdSkin = "bird_red.png";
let currentBackgroundTheme = "sky_background.png";
let isMusicPlaying = false;
const groundColor = "#8B4513";
const groundTextureColor = "#654321";
const grassColors = ["#4CAF50", "#66BB6A", "#81C784"];
const grassBladeColor = "#388E3C";
const grassBladeThickness = 3;
const grassBladeHeightMin = 10;
const grassBladeHeightMax = 25;
const grassTransparency = 0.8;
const coinColor = "#FFD700";
const coinOutlineColor = "#B8860B";
const enhancedCoinGradient = "#FFC000";

// Game settings keys
const HIGH_SCORE_KEY = "flippyBirdAllTimeHighScore";
const BIRD_SKIN_KEY = "flippyBirdSkin";
const BACKGROUND_THEME_KEY = "flippyBackground";
const PIPE_SKIN_KEY = "flippyPipeSkin";
const MUSIC_SETTING_KEY = "flippyBirdMusicSetting";
const SOUND_VOLUME_KEY = "flippyBirdSoundVolume";
const MUSIC_VOLUME_KEY = "flippyBirdMusicVolume";
const DIFFICULTY_KEY = "flippyBirdDifficulty";

// Jetpack constants
const jetpackFlameColors = ["#FF4500", "#FF8C00", "#FFA500"];
const jetpackSmokeColors = ["#A9A9A9", "#D3D3D3", "#F5F5F5"];
const jetpackParticleLifetime = 30;
const jetpackParticleSize = 8;
const jetpackParticleCount = 5;
const jetpackSoundFrequency = 300; // ms

// Enemy bird constants
const ENEMY_SPAWN_INTERVAL = 8000; // Increased from 7000 - 8 seconds between enemy birds for more breathing room
const ENEMY_SPEED_MULTIPLIER = 0.95; // Reduced from 1.1 - Make enemy birds slightly slower than pipes
const ENEMY_FOLLOW_STRENGTH = 0.025; // Reduced from 0.05 - Much gentler vertical following
const ENEMY_SPAWN_INITIAL_DELAY = 3; // Reduced from 5 - Start appearing after fewer pipes

// Key states for arrow key controls
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

let gameState = {
    running: false,
    paused: false,
    gameOver: false,
    bird: null,
    physics: { gravity: 0.4, flapStrength: -6, pipeSpeed: 1 },
    pipes: [],
    coins: [],
    powerups: [],
    activePowerups: [],
    enemyBirds: [],
    enemyBirdSpawnTimer: 0,
    powerupSpawnTimer: 0,
    powerupSpawnInterval: 12000,
    overallScore: 0,
    pipeScore: 0,
    coinScore: 0,
    highScore: 0,
    allTimeHighScore: 0,
    lives: 3,
    maxLives: 3,
    invincibilityTimer: 0,
    invincibilityDuration: 2000,
    screenShake: { active: false, duration: 0, intensity: 0 }, // Added: Screen shake properties
    hitFlash: { active: false, duration: 0 }, // Added: Hit flash animation properties
    pipeConfig: { width: 70, gap: 180, spawnDistance: 180, baseSpeed: 3, frequency: 1200 },
    background: null,
    difficulty: "normal",
    groundHeight: 100,
    pipeSpawnTimer: 0,
    coinSpawnTimer: 0,
    coinSpawnInterval: 3000,
    pipeSpawnInterval: 1100,
    verticalPipesMode: "random",
    flameSoundTimer: 0,
    jetpackParticles: [],
    scoreAccumulationTimer: 0,
    isRapidScoring: false,
    isFrozen: false,
    normalPipeSpeed: 0,
    freezeCooldown: 0,
    maxFreezeDuration: 3000,
    freezeTimer: 0,
    freezeCooldownDuration: 5000,
    jetpackCooldownPhase: false, // Flag for jetpack cooldown phase
    jetpackCooldownTimer: 0, // Timer for jetpack cooldown
    jetpackCooldownDuration: 2000, // Duration of jetpack cooldown in ms
    jetpackOriginalGravity: 0.4, // Store original gravity for cooldown phase
    grassAnimation: null,
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
    gameState.pipeConfig.gap = Math.max(150, Math.min(250, window.innerHeight * 0.35));
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
    gameState.verticalPipesMode = loadSetting("verticalPipesMode", "random");

    if (flapSound) flapSound.volume = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (coinSound) coinSound.volume = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (backgroundMusic) backgroundMusic.volume = parseFloat(loadSetting(MUSIC_VOLUME_KEY, "0.3"));

    pipeColor = pipeStyles[currentPipeSkin] || pipeStyles["green"];

    if (birdSkins[currentBirdSkin]) {
        birdImage = birdSkins[currentBirdSkin];
    }

    if (backgroundThemes[currentBackgroundTheme]) {
        backgroundImage = backgroundThemes[currentBackgroundTheme];
    }

    if (gameState.background) {
        gameState.background.changeImage(backgroundImage);
    }

    if (birdSkinSelect) birdSkinSelect.value = currentBirdSkin;
    if (backgroundSelect) backgroundSelect.value = currentBackgroundTheme;
    if (pipeSkinSelect) pipeSkinSelect.value = currentPipeSkin;
    if (difficultySelect) difficultySelect.value = gameState.difficulty;
    if (masterVolumeControl) masterVolumeControl.value = parseFloat(loadSetting("masterVolume", "1"));
    if (soundEffectsVolumeControl) soundEffectsVolumeControl.value = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (musicVolumeControl) musicVolumeControl.value = parseFloat(loadSetting(MUSIC_VOLUME_KEY, "0.3"));

    // Set the vertical pipes toggle to match saved setting
    const verticalPipesToggle = document.getElementById("verticalPipesToggle");
    if (verticalPipesToggle) verticalPipesToggle.value = gameState.verticalPipesMode;

    updateVolume();
    resetPhysicsBasedOnDifficulty();

    if (isMusicPlaying && backgroundMusic) {
        backgroundMusic.play().catch(() => { });
    } else if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

gameState.allTimeHighScore = loadAllTimeHighScore();
if (highScoreDisplay) highScoreDisplay.innerText = "High Score: 0";
if (allTimeHighScoreDisplay) allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;

class Bird {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = 0;
        this.gravity = 0;
        this.flapStrength = 0;
        this.arrowMovementSpeed = 5; // Speed for arrow key movement
        this.jetpackArrowSpeed = 8;  // Faster movement during jetpack
        this.baseX = x; // Store the base X position for jetpack forward movement
        this.forwardOffset = 0; // Track forward movement during jetpack
    }

    update(dt) {
        // Skip physics update if bird is frozen
        if (gameState.isFrozen) {
            this.velocity = 0;
            return;
        }
        
        // Check if jetpack is active
        const hasJetpack = gameState.activePowerups.some(p => p.type === 'jetpack');
        const inJetpackCooldown = gameState.jetpackCooldownPhase;

        // Handle special jetpack physics
        if (hasJetpack) {
            // Completely override normal physics during jetpack
            this.velocity = 0; // Reset velocity to zero for stability
            
            // Only handle vertical movement from arrow keys
            if (keys.ArrowUp) {
                this.y -= this.jetpackArrowSpeed * dt;
            }
            if (keys.ArrowDown) {
                this.y += this.jetpackArrowSpeed * dt;
            }
            
            // Apply forward movement effect
            this.forwardOffset = Math.min(this.forwardOffset + 0.5, 30); // Max of 30px forward
            this.x = this.baseX + this.forwardOffset;
            
            // Add a slight hovering effect
            this.y += Math.sin(Date.now() / 500) * 0.2;
            
            return; // Skip regular physics entirely
        } 
        else if (inJetpackCooldown) {
            // During cooldown, gradually restore normal physics
            const progress = gameState.jetpackCooldownTimer / gameState.jetpackCooldownDuration;
            const stabilityFactor = progress * 0.8; // How much stability remains (0-0.8)
            
            // Apply reduced gravity during cooldown
            this.velocity += this.gravity * dt * (1 - stabilityFactor);
            
            // Slow return to original x position
            if (this.forwardOffset > 0) {
                this.forwardOffset = Math.max(0, this.forwardOffset - 0.5);
                this.x = this.baseX + this.forwardOffset;
            }
            
            // Handle arrow keys with gradually reducing effectiveness
            if (keys.ArrowUp) {
                const effectiveSpeed = this.arrowMovementSpeed + 
                    (this.jetpackArrowSpeed - this.arrowMovementSpeed) * progress;
                this.y -= effectiveSpeed * dt;
                this.velocity = Math.min(this.velocity, -this.arrowMovementSpeed/2 * progress);
            }
            if (keys.ArrowDown) {
                const effectiveSpeed = this.arrowMovementSpeed + 
                    (this.jetpackArrowSpeed - this.arrowMovementSpeed) * progress;
                this.y += effectiveSpeed * dt;
                this.velocity = Math.max(this.velocity, this.arrowMovementSpeed/3 * progress);
            }
            
            // Apply current velocity
            this.y += this.velocity * dt;
        }
        else {
            // Regular physics when not in jetpack mode or cooldown
            // Apply gravity and velocity
        this.velocity += this.gravity * dt;
        this.y += this.velocity * dt;
            
            // Reset forward offset if any remains
            if (this.forwardOffset > 0) {
                this.forwardOffset = 0;
                this.x = this.baseX;
            }
            
            // Handle arrow key movement
            if (keys.ArrowUp) {
                // Move up with arrow key, reducing velocity for smoother movement
                this.velocity = Math.min(this.velocity, -this.arrowMovementSpeed/2);
                this.y -= this.arrowMovementSpeed * dt;
            }
            if (keys.ArrowDown) {
                // Move down with arrow key, increasing velocity for faster downward movement
                this.velocity = Math.max(this.velocity, this.arrowMovementSpeed/3);
                this.y += this.arrowMovementSpeed * dt;
            }
        }
    }

    flap() {
        // Don't allow flapping if bird is frozen
        if (gameState.isFrozen) return;
        
        // Don't allow flapping during jetpack mode
        const hasJetpack = gameState.activePowerups.some(p => p.type === 'jetpack');
        if (hasJetpack) return;
        
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
        ctx.drawImage(image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.baseX = x;
        this.forwardOffset = 0;
    }

    applyPhysics(gravity, flapStrength) {
        this.gravity = gravity;
        this.flapStrength = flapStrength;
    }
}

class Pipe {
    constructor(x, topHeight, gap, groundHeight, canvasHeight, width) {
        this.x = x;
        this.topHeight = topHeight;
        this.gap = gap;
        this.bottomHeight = canvasHeight - groundHeight - topHeight - gap;
        this.width = width;
        this.scored = false;
        this.speed = 0;
        
        // New properties for vertical movement
        this.originalTopHeight = topHeight;
        this.verticalMovement = Math.random() > 0.5; // Randomly decide if pipe moves vertically
        this.verticalSpeed = (Math.random() * 0.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1); // Random speed and direction
        this.verticalRange = Math.random() * 100 + 50; // Random amplitude between 50-150 pixels
    }

    update(dt) {
        this.x -= this.speed * dt;
        
        // Apply vertical movement if enabled for this pipe
        if (this.verticalMovement) {
            this.topHeight = this.originalTopHeight + Math.sin(performance.now() / 1000 * this.verticalSpeed) * this.verticalRange;
            // Ensure the pipe's gap remains in reasonable bounds
            this.bottomHeight = window.innerHeight - gameState.groundHeight - this.topHeight - this.gap;
        }
    }

    draw(ctx, pipeColor, currentPipeSkin, canvasHeight, groundHeight) {
        switch (currentPipeSkin) {
            case "blue":
                drawBluePipe(ctx, this.x, this.topHeight, this.bottomHeight, this.width, canvasHeight, groundHeight);
                break;
            case "red":
                drawRedPipe(ctx, this.x, this.topHeight, this.bottomHeight, this.width, canvasHeight, groundHeight);
                break;
            default:
                ctx.fillStyle = pipeColor;
                ctx.fillRect(this.x, 0, this.width, this.topHeight);
                ctx.fillRect(this.x, canvasHeight - groundHeight - this.bottomHeight, this.width, this.bottomHeight);
                break;
        }
    }

    reset(x) {
        this.x = x;
        this.scored = false;
        // Reset vertical movement properties when resetting the pipe
        this.originalTopHeight = this.topHeight;
        this.verticalMovement = Math.random() > 0.5;
        this.verticalSpeed = (Math.random() * 0.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1);
        this.verticalRange = Math.random() * 100 + 50;
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
        this.speed = 0;
        this.collected = false;
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    draw(ctx) {
        if (this.collected) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = "#FFC000";
        ctx.fill();
        ctx.closePath();
        
        ctx.font = "bold " + this.radius + "px Arial";
        ctx.fillStyle = "#B8860B";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", this.x, this.y);
    }

    reset(x) {
        this.x = x;
        this.collected = false;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class Powerup {
    constructor(x, y, type, width, height) {
        this.x = x;
        this.y = y;
        this.width = width || 40;
        this.height = height || 40;
        this.type = type;
        this.speed = 0;
        this.collected = false;
        this.duration = type === 'jetpack' ? 10000 : 5000; // 10 seconds for jetpack, 5 seconds for other powerups
        this.blinkSpeed = 0.1; // For visual effects
        this.opacity = 1;
        this.pulseDirection = -1;
    }
    
    update(dt) {
        this.x -= this.speed * dt;
        
        // Visual effects (pulsing)
        this.opacity += this.pulseDirection * this.blinkSpeed;
        if (this.opacity <= 0.4) {
            this.opacity = 0.4;
            this.pulseDirection = 1;
        } else if (this.opacity >= 1) {
            this.opacity = 1;
            this.pulseDirection = -1;
        }
    }
    
    draw(ctx) {
        if (this.collected) return;
        
        ctx.globalAlpha = this.opacity;
        
        if (this.type === 'jetpack') {
            if (jetpackImage && jetpackImage.complete) {
                // Draw the jetpack image
                ctx.drawImage(jetpackImage, this.x, this.y, this.width, this.height);
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = "#888888";
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                ctx.font = "bold 20px Arial";
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("J", this.x + this.width / 2, this.y + this.height / 2);
            }
        }
        
        ctx.globalAlpha = 1;
    }
    
    applySpeed(speed) {
        this.speed = speed;
    }
    
    activate(bird) {
        if (this.type === 'jetpack') {
            // Store original pipe speed for restoration when effect ends
            const originalPipeSpeed = gameState.physics.pipeSpeed;
            
            // Apply speed boost to existing pipes, coins, and powerups
            const speedMultiplier = 2.5; // Horizontal speed boost
            gameState.physics.pipeSpeed *= speedMultiplier;
            
            // Apply to existing objects
            gameState.pipes.forEach(pipe => pipe.applySpeed(gameState.physics.pipeSpeed));
            gameState.coins.forEach(coin => coin.applySpeed(gameState.physics.pipeSpeed));
            gameState.powerups.forEach(powerup => powerup.applySpeed(gameState.physics.pipeSpeed));
            gameState.enemyBirds.forEach(enemy => enemy.applySpeed(gameState.physics.pipeSpeed));
            
            // Set bird's horizontal position to advance forward slightly
            bird.x += 20;
            
            // Store the original y position and disable gravity
            const originalY = bird.y;
            const originalGravity = gameState.physics.gravity;
            gameState.physics.gravity = 0; // Disable gravity during jetpack
            
            // Store original gravity for cooldown phase
            gameState.jetpackOriginalGravity = originalGravity;
            
            // Start score accumulation timer
            gameState.scoreAccumulationTimer = 0;
            gameState.isRapidScoring = true;
            
            return {
                type: 'jetpack',
                duration: this.duration,
                originalSpeed: originalPipeSpeed,
                originalGravity: originalGravity,
                invincible: true, // Add invincibility
                effect: (bird, dt) => {
                    // The bird update method now handles all movement,
                    // we just need to create particles and handle scoring
                    
                    // Create flame particles for visual effect
                    if (gameState.flameSoundTimer <= 0) {
                        if (flapSound) {
                            flapSound.play().catch(() => {});
                            gameState.flameSoundTimer = jetpackSoundFrequency;
                        }
                    } else {
                        gameState.flameSoundTimer -= dt * 16.67;
                    }
                    
                    // Accumulate score faster
                    gameState.scoreAccumulationTimer += dt * 16.67;
                    if (gameState.scoreAccumulationTimer >= 250) { // Changed from 500ms to 250ms - twice as fast
                        gameState.pipeScore += 2; // Doubled from 1 to 2 points per tick
                        gameState.overallScore = gameState.pipeScore + gameState.coinScore;
                        updateScoreDisplay();
                        gameState.scoreAccumulationTimer = 0;
                    }
                    
                    return true; // Continue effect
                },
                // Add cleanup function when powerup expires
                cleanup: () => {
                    // Instead of immediately restoring speed, start the cooldown phase
                    gameState.jetpackCooldownPhase = true;
                    gameState.jetpackCooldownTimer = gameState.jetpackCooldownDuration;
                    
                    // Store the boosted speed and original speed for interpolation
                    gameState.jetpackBoostSpeed = gameState.physics.pipeSpeed;
                    gameState.jetpackOriginalSpeed = originalPipeSpeed;
                    
                    // Stop rapid scoring immediately
                    gameState.isRapidScoring = false;
                    
                    // We'll handle the speed transition in updateGame
                }
            };
        }
        return null;
    }
}

class EnemyBird {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width || 50;
        this.height = height || 40;
        this.velocity = 0;
        this.speed = 0;
        this.targetY = y;
        this.sinOffset = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.facingLeft = true;
        
        // Adjusted random behavior for more predictable movement
        this.verticalOscillation = Math.random() * 30 + 20; // Reduced from 50+30 to 30+20
        this.oscillationSpeed = Math.random() * 0.001 + 0.0005; // Reduced for slower bobbing
        this.aggressiveness = Math.random() * 0.3 + 0.2; // Reduced from 0.5+0.5 to 0.3+0.2
    }
    
    update(dt, playerBird) {
        // Move toward player's y position
        if (playerBird) {
            // Set target y to follow the player
            this.targetY = playerBird.y + (Math.sin(Date.now() * this.oscillationSpeed + this.sinOffset) * this.verticalOscillation);
            
            // Move y position toward target with easing
            const yDiff = this.targetY - this.y;
            this.velocity = yDiff * ENEMY_FOLLOW_STRENGTH * this.aggressiveness;
            
            // Update position
            this.y += this.velocity * dt;
            
            // Calculate rotation based on vertical movement
            this.rotation = this.velocity * 0.02;
        }
        
        // Move bird horizontally (from right to left)
        this.x -= this.speed * dt;
        
        // Animation
        this.animationTimer += dt;
        if (this.animationTimer > 150) { // Update animation every 150ms
            this.animationFrame = (this.animationFrame + 1) % 3; // 3 frames of animation
            this.animationTimer = 0;
        }
    }
    
    draw(ctx, image) {
        if (!image) {
            // Fallback drawing if image isn't loaded - make it more distinctive
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Add distinctive features
            ctx.fillStyle = "black";
            ctx.fillRect(this.x + this.width - 15, this.y + 10, 10, 5); // Eye
            ctx.fillRect(this.x + this.width - 20, this.y + this.height - 15, 15, 5); // Beak
            
            return;
        }
        
        ctx.save();
        
        // Add a subtle shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = -3;
        ctx.shadowOffsetY = 3;
        
        // Translate to center of bird for rotation
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        // Flip the bird horizontally to face left (towards player)
        ctx.scale(-1, 1);
        
        // Draw the bird image
        ctx.drawImage(
            image,
            -this.width/2, -this.height/2,
            this.width, this.height
        );
        
        ctx.restore();
    }
    
    applySpeed(speed) {
        this.speed = speed * ENEMY_SPEED_MULTIPLIER;
    }
    
    checkCollision(playerBird) {
        // Simple rectangular collision detection
        return (
            playerBird.x < this.x + this.width &&
            playerBird.x + playerBird.width > this.x &&
            playerBird.y < this.y + this.height &&
            playerBird.y + playerBird.height > this.y
        );
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

window.addEventListener("resize", resizeCanvas);

function resetPhysicsBasedOnDifficulty() {
    switch (gameState.difficulty) {
        case "easy":
            gameState.physics.gravity = 0.3;
            gameState.pipeConfig.baseSpeed = 2;
            gameState.pipeConfig.gap = 200; // Reduced from 250
            gameState.pipeSpawnInterval = 1700; // Increased slightly from previous 1600 to space out pipes more in easy mode
            break;
        case "hard":
            gameState.physics.gravity = 0.5;
            gameState.pipeConfig.baseSpeed = 4;
            gameState.pipeConfig.gap = 160; // Reduced from 180
            gameState.pipeSpawnInterval = 750; // Reduced from 800 - pipes closer together in hard mode
            break;
        default:
            gameState.physics.gravity = 0.4;
            gameState.pipeConfig.baseSpeed = 3;
            gameState.pipeConfig.gap = 180; // Reduced from 200
            gameState.pipeSpawnInterval = 1100; // Reduced from 1200 
            break;
    }
    gameState.physics.pipeSpeed = gameState.pipeConfig.baseSpeed;
    if (gameState.bird) gameState.bird.applyPhysics(gameState.physics.gravity, gameState.physics.flapStrength);
    gameState.pipes.forEach(pipe => pipe.applySpeed(gameState.physics.pipeSpeed));
    gameState.coins.forEach(coin => coin.applySpeed(gameState.physics.pipeSpeed));
    gameState.enemyBirds.forEach(enemy => enemy.applySpeed(gameState.physics.pipeSpeed * ENEMY_SPEED_MULTIPLIER));
    gameState.powerups.forEach(powerup => powerup.applySpeed(gameState.physics.pipeSpeed));
    if (gameState.background) gameState.background.applySpeed(gameState.physics.pipeSpeed / 3);
    // Grass animation speed will be automatically updated in its update method
}

function resetGameElements() {
    if (gameState.bird) gameState.bird.reset(window.innerWidth / 4, window.innerHeight / 2);
    gameState.pipes = [];
    gameState.coins = [];
    gameState.powerups = [];
    gameState.activePowerups = [];
    gameState.enemyBirds = [];
    gameState.jetpackParticles = [];
    if (gameState.background) gameState.background.reset();
    gameState.pipeSpawnTimer = 0;
    gameState.coinSpawnTimer = 0;
    gameState.powerupSpawnTimer = 0;
    gameState.enemyBirdSpawnTimer = 0;
    gameState.flameSoundTimer = 0;
    
    // Reset freeze state
    gameState.isFrozen = false;
    gameState.freezeTimer = 0;
    gameState.freezeCooldown = 0;
    
    // Reset jetpack cooldown state
    gameState.jetpackCooldownPhase = false;
    gameState.jetpackCooldownTimer = 0;
    
    // Reset freeze button appearance
    const freezeButton = document.getElementById("freezeButton");
    if (freezeButton) {
        freezeButton.style.backgroundColor = "";
        freezeButton.textContent = "Freeze";
    }
}

function resetScores() {
    gameState.overallScore = 0;
    gameState.pipeScore = 0;
    gameState.coinScore = 0;
}

function updateScoreDisplay() {
    if (!pipeScoreDisplay || !coinScoreDisplay || !scoreDisplay ||
        !highScoreDisplay || !allTimeHighScoreDisplay) return;

    pipeScoreDisplay.innerText = "Pipes: " + gameState.pipeScore;
    coinScoreDisplay.innerText = "Coins: " + gameState.coinScore;
    scoreDisplay.innerText = "Score: " + gameState.overallScore;
    highScoreDisplay.innerText = "High Score: " + gameState.highScore;
    allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;
}

function initializeGame() {
    resizeCanvas();
    resetGameElements();
    resetScores();
    gameState.running = true;
    gameState.paused = false;
    gameState.gameOver = false;
    gameState.lives = gameState.maxLives; // Reset lives
    gameState.invincibilityTimer = 0;
    updateLivesDisplay(); // Update the display
    gameState.grassAnimation = new GrassAnimation(window.innerWidth);

    if (pauseButton) pauseButton.textContent = "Pause";
    if (settingsButton) settingsButton.disabled = false;
    if (featurePanel) featurePanel.style.display = 'flex';

    resetPhysicsBasedOnDifficulty();
    updateScoreDisplay();
    
    // Set a longer initial delay for the first pipe to appear
    gameState.pipeSpawnTimer = -1000;
    
    // Initialize enemy bird spawn timer with a small delay
    gameState.enemyBirdSpawnTimer = -2000;

    if (startMenu) startMenu.style.display = "none";
    if (gameOverMenu) gameOverMenu.style.display = "none";
    if (settingsMenu) settingsMenu.style.display = "none";
    if (pauseMenu) pauseMenu.style.display = "none";
    if (newHighScoreDisplay) newHighScoreDisplay.style.display = "none";
    if (newAllTimeHighScoreDisplay) newAllTimeHighScoreDisplay.style.display = "none";

    if (backgroundMusic && isMusicPlaying) {
        backgroundMusic.play().catch(() => { });
    }
}

function generatePipeHeight() {
    const minHeight = 50;
    const maxHeight = window.innerHeight - gameState.pipeConfig.gap - minHeight - gameState.groundHeight;
    return Math.random() * (maxHeight - minHeight) + minHeight;
}

function createPipe() {
    const topHeight = generatePipeHeight();
    
    // Determine if this is the first pipe after game start
    const isFirstPipe = gameState.pipes.length === 0;
    
    // Occasionally create a pair of pipes very close together for increased challenge
    // But don't do this for the first pipe
    const createPipePair = !isFirstPipe && Math.random() < 0.3; // 30% chance to create a closely spaced pair
    
    // Place the first pipe further away to give player time to prepare
    const startingOffset = isFirstPipe ? 200 : 0; // Extra distance for the first pipe
    
    let pipe = new Pipe(window.innerWidth + startingOffset, topHeight, gameState.pipeConfig.gap, gameState.groundHeight, window.innerHeight, gameState.pipeConfig.width);
    pipe.applySpeed(gameState.physics.pipeSpeed);
    
    // Set vertical movement based on game settings
    switch(gameState.verticalPipesMode) {
        case "all":
            pipe.verticalMovement = true;
            break;
        case "none":
            pipe.verticalMovement = false;
            break;
        case "random":
        default:
            // Already set randomly in constructor
            break;
    }
    
    createCoinInPipeGap(pipe);
    gameState.pipes.push(pipe);
    
    // If creating a pipe pair, add a second pipe with a small horizontal offset
    if (createPipePair) {
        const secondPipeOffset = gameState.pipeConfig.width + 90; // Small gap between pipes
        const secondPipeHeight = generatePipeHeight();
        
        // Create the second pipe shortly after the first
        let secondPipe = new Pipe(
            window.innerWidth + secondPipeOffset + startingOffset, 
            secondPipeHeight, 
            gameState.pipeConfig.gap, 
            gameState.groundHeight, 
            window.innerHeight, 
            gameState.pipeConfig.width
        );
        
        secondPipe.applySpeed(gameState.physics.pipeSpeed);
        
        // Apply the same vertical movement settings
        switch(gameState.verticalPipesMode) {
            case "all":
                secondPipe.verticalMovement = true;
                break;
            case "none":
                secondPipe.verticalMovement = false;
                break;
            case "random":
            default:
                // Already set randomly in constructor
                break;
        }
        
        createCoinInPipeGap(secondPipe);
        gameState.pipes.push(secondPipe);
    }
    
    gameState.pipeSpawnTimer = 0;
}

function createCoinInPipeGap(pipe) {
    const coinY = pipe.topHeight + gameState.pipeConfig.gap / 2;
    if (coinY < pipe.topHeight + 50 || coinY > window.innerHeight - gameState.groundHeight - pipe.bottomHeight - 50) return;
    let coin = new Coin(pipe.x + gameState.pipeConfig.width / 2, coinY, 18);
    coin.applySpeed(gameState.physics.pipeSpeed);
    gameState.coins.push(coin);
}

function createSkyCoin(dt) {
    gameState.coinSpawnTimer += dt;
    if (gameState.coinSpawnTimer >= gameState.coinSpawnInterval) {
        const minY = 50;
        const maxY = window.innerHeight - gameState.groundHeight - 50;
        const y = Math.random() * (maxY - minY) + minY;
        let coin = new Coin(window.innerWidth, y, 18);
        coin.applySpeed(gameState.physics.pipeSpeed);
        gameState.coins.push(coin);
        gameState.coinSpawnTimer = 0;
    }
}

function spawnPowerup() {
    // Spawn powerups less frequently than coins
    gameState.powerupSpawnTimer += 16.67; // Assuming 60fps
    if (gameState.powerupSpawnTimer >= gameState.powerupSpawnInterval) {
        const minY = 100;
        const maxY = window.innerHeight - gameState.groundHeight - 100;
        const y = Math.random() * (maxY - minY) + minY;
        
        // For now, only jetpack powerup
        let powerup = new Powerup(window.innerWidth, y, 'jetpack', 40, 40);
        powerup.applySpeed(gameState.physics.pipeSpeed);
        gameState.powerups.push(powerup);
        gameState.powerupSpawnTimer = 0;
    }
}

function updatePowerups(dt) {
    // Update existing powerups
    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
        const powerup = gameState.powerups[i];
        powerup.update(dt);
        
        // Remove if off-screen
        if (powerup.x < -powerup.width) {
            gameState.powerups.splice(i, 1);
            continue;
        }
        
        // Check collision with bird
        if (!powerup.collected && gameState.bird) {
            const birdRight = gameState.bird.x + gameState.bird.width;
            const birdBottom = gameState.bird.y + gameState.bird.height;
            
            if (birdRight > powerup.x && 
                gameState.bird.x < powerup.x + powerup.width &&
                birdBottom > powerup.y && 
                gameState.bird.y < powerup.y + powerup.height) {
                
                powerup.collected = true;
                
                // Play yay sound first when collecting jetpack
                if (powerup.type === 'jetpack' && yaySound) {
                    yaySound.currentTime = 0;
                    yaySound.play().catch(() => {});
                    
                    // Start jetpack sound after a short delay
                    setTimeout(() => {
                        if (jetpackSound) {
                            jetpackSound.currentTime = 0;
                            jetpackSound.volume = 0.7;
                            jetpackSound.loop = true;
                            jetpackSound.play().catch(() => {});
                        }
                    }, 500); // 500ms delay between yay and jetpack sound
                }
                
                // Activate the powerup
                const powerupEffect = powerup.activate(gameState.bird);
                if (powerupEffect) {
                    powerupEffect.startTime = Date.now();
                    gameState.activePowerups.push(powerupEffect);
                }
                
                // Remove from array
                gameState.powerups.splice(i, 1);
            }
        }
    }
    
    // Update active powerup effects
    for (let i = gameState.activePowerups.length - 1; i >= 0; i--) {
        const powerup = gameState.activePowerups[i];
        const elapsed = Date.now() - powerup.startTime;
        
        // Apply powerup effect
        const stillActive = powerup.effect(gameState.bird, dt);
        
        // Remove if expired
        if (elapsed >= powerup.duration || !stillActive) {
            // Stop jetpack sound if this was a jetpack powerup
            if (powerup.type === 'jetpack' && jetpackSound) {
                // Fade out the jetpack sound
                const fadeOutDuration = 500; // 500ms fade out
                const startVolume = jetpackSound.volume;
                const fadeInterval = 50; // Update every 50ms
                const steps = fadeOutDuration / fadeInterval;
                const volumeStep = startVolume / steps;
                
                let currentStep = 0;
                const fadeOut = setInterval(() => {
                    currentStep++;
                    if (currentStep >= steps || jetpackSound.volume <= 0) {
                        clearInterval(fadeOut);
                        jetpackSound.pause();
                        jetpackSound.currentTime = 0;
                        jetpackSound.loop = false;
                        jetpackSound.volume = startVolume; // Reset volume for next time
                    } else {
                        jetpackSound.volume = startVolume - (volumeStep * currentStep);
                    }
                }, fadeInterval);
            }
            
            // Call cleanup function if it exists
            if (powerup.cleanup) {
                powerup.cleanup();
            }
            
            gameState.activePowerups.splice(i, 1);
        }
    }
    
    // Update jetpack particles if any
    if (gameState.jetpackParticles.length > 0) {
        updateJetpackParticles(dt);
    }
}

function updateJetpackParticles(dt) {
    // Update existing particles
    for (let i = gameState.jetpackParticles.length - 1; i >= 0; i--) {
        const particle = gameState.jetpackParticles[i];
        
        // Update position
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        
        // Update lifetime
        particle.lifetime -= dt;
        
        // Remove if expired
        if (particle.lifetime <= 0) {
            gameState.jetpackParticles.splice(i, 1);
        }
    }
}

function createJetpackParticles(bird, isCooldown = false) {
    // Create flame particles behind the bird (horizontal jetpack)
    const particleCount = isCooldown ? Math.ceil(jetpackParticleCount / 2) : jetpackParticleCount;
    
    for (let i = 0; i < particleCount; i++) {
        // Determine if this is a flame or smoke particle
        const isFlame = Math.random() > (isCooldown ? 0.6 : 0.3); // More smoke during cooldown
        const colorArray = isFlame ? jetpackFlameColors : jetpackSmokeColors;
        const color = colorArray[Math.floor(Math.random() * colorArray.length)];
        
        // Shorter particles during cooldown
        const speedMultiplier = isCooldown ? 0.6 : 1.0;
        
        const particle = {
            x: bird.x - 5, // Position behind the bird
            y: bird.y + bird.height / 2 + (Math.random() - 0.5) * bird.height * 0.7, // Vary vertically around bird center
            vx: -Math.random() * 10 * speedMultiplier - 5, // Horizontal velocity (negative = behind bird)
            vy: (Math.random() - 0.5) * 2, // Slight vertical drift
            size: Math.random() * jetpackParticleSize * speedMultiplier + 3,
            color: color,
            lifetime: Math.random() * jetpackParticleLifetime * speedMultiplier + 10,
            isFlame: isFlame,
            isCooldown: isCooldown
        };
        
        gameState.jetpackParticles.push(particle);
    }
}

function drawJetpackParticles(ctx) {
    for (const particle of gameState.jetpackParticles) {
        ctx.fillStyle = particle.color;
        const opacity = Math.min(1, particle.lifetime / jetpackParticleLifetime);
        // Lower opacity during cooldown
        ctx.globalAlpha = particle.isCooldown ? opacity * 0.7 : opacity;
        
        if (particle.isFlame) {
            // Draw flame particles as horizontally-oriented triangles
            const halfSize = particle.size / 2;
            ctx.beginPath();
            ctx.moveTo(particle.x - halfSize, particle.y); // Tip pointing backward
            ctx.lineTo(particle.x + halfSize, particle.y - halfSize); // Top point
            ctx.lineTo(particle.x + halfSize, particle.y + halfSize); // Bottom point
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw smoke particles as circles
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1;
}

let lastTime = performance.now();

function startGame() {
    if (!assetsLoaded) {
        console.warn("Assets not loaded");
        return;
    }
    gameState.bird = new Bird(window.innerWidth / 4, window.innerHeight / 2, 50, 36);
    gameState.background = new Background(backgroundImage, 1);

    if (featurePanel) featurePanel.style.display = 'flex';
    if (settingsButton) settingsButton.style.display = 'block';

    initializeGame();
    lastTime = performance.now();
    gameLoop();
}

function restartGame() {
    initializeGame();
    lastTime = performance.now();
    gameLoop();
}

function showStartMenu() {
    gameState.running = false;
    gameState.paused = false;

    if (startMenu) startMenu.style.display = "flex";
    if (gameOverMenu) gameOverMenu.style.display = "none";
    if (settingsMenu) settingsMenu.style.display = "none";
    if (pauseMenu) pauseMenu.style.display = "none";
    if (featurePanel) featurePanel.style.display = 'none';
}

function flap(e) {
    if (e) e.preventDefault();
    if (gameState.running && !gameState.paused && !gameState.gameOver && gameState.bird) {
        gameState.bird.flap();
        if (flapSound) {
            flapSound.currentTime = 0;
            flapSound.play().catch(() => { });
        }
    }
}

if (canvas) {
    canvas.addEventListener("mousedown", flap);
    canvas.addEventListener("touchstart", flap);
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") flap(e);
    if (e.code === "Escape" && gameState.running && !gameState.gameOver) togglePause();
});

function updateGame(dt) {
    if (!gameState.running || gameState.paused || gameState.gameOver || !gameState.bird) return;
    
    // Update screen shake
    if (gameState.screenShake.active) {
        gameState.screenShake.duration -= dt * 16.67;
        if (gameState.screenShake.duration <= 0) {
            gameState.screenShake.active = false;
        }
    }
    
    // Update hit flash
    if (gameState.hitFlash.active) {
        gameState.hitFlash.duration -= dt * 16.67;
        if (gameState.hitFlash.duration <= 0) {
            gameState.hitFlash.active = false;
        }
    }
    
    // Update invincibility timer
    if (gameState.invincibilityTimer > 0) {
        gameState.invincibilityTimer -= dt * 16.67;
    }

    // Update freeze state
    updateFreezeState(dt);
    
    // Update jetpack cooldown
    updateJetpackCooldown(dt);

    // Only update bird position if not frozen
    if (!gameState.isFrozen) {
        gameState.bird.update(dt);
    }
    
    if (gameState.background) gameState.background.update(dt, window.innerWidth);

    if (gameState.bird.y < 0) {
        gameState.bird.y = 0;
        gameState.bird.velocity = 0;
    }

    if (gameState.bird.y + gameState.bird.height > window.innerHeight - gameState.groundHeight) {
        // Ground collision
        if (gameState.activePowerups.some(p => p.invincible) || gameState.invincibilityTimer > 0) {
            gameState.bird.y = window.innerHeight - gameState.groundHeight - gameState.bird.height;
            gameState.bird.velocity = 0;
        } else {
            loseLife();
            if (gameState.lives <= 0) return;
        }
    }

    // Adjust pipe spawn interval based on score - the higher the score, the closer pipes will spawn
    const baseInterval = gameState.pipeSpawnInterval;
    const scoreReduction = Math.min(400, Math.floor(gameState.pipeScore / 15) * 50); // Reduce by 50ms per 15 pipes, up to 400ms max
    const dynamicInterval = Math.max(baseInterval - scoreReduction, baseInterval * 0.6); // Don't go below 60% of base interval

    gameState.pipeSpawnTimer += dt;
    if (gameState.pipes.length === 0 || gameState.pipeSpawnTimer >= dynamicInterval) {
        createPipe();
    }
    createSkyCoin(dt * 16.67);
    spawnPowerup();
    spawnEnemyBird(); // Ensure enemy birds are spawned
    
    // Update powerups and apply active effects
    updatePowerups(dt);
    
    // Update enemy birds
    updateEnemyBirds(dt);
    
    // Create jetpack particles if jetpack is active
    if (gameState.activePowerups.some(p => p.type === 'jetpack')) {
        createJetpackParticles(gameState.bird);
    }
    
    // Check if bird is currently invincible
    const isInvincible = gameState.activePowerups.some(p => p.invincible);

    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
        const pipe = gameState.pipes[i];
        pipe.update(dt);
        if (pipe.x < -pipe.width) {
            gameState.pipes.splice(i, 1);
        }

        const birdRight = gameState.bird.x + gameState.bird.width;
        const birdBottom = gameState.bird.y + gameState.bird.height;
        const pipeRight = pipe.x + pipe.width;

        if (birdRight > pipe.x && gameState.bird.x < pipeRight) {
            if ((gameState.bird.y < pipe.topHeight || birdBottom > window.innerHeight - gameState.groundHeight - pipe.bottomHeight) && 
                !gameState.activePowerups.some(p => p.invincible) && gameState.invincibilityTimer <= 0) {
                loseLife();
                if (gameState.lives <= 0) return;
            }
        }

        if (!pipe.scored && gameState.bird.x > pipeRight) {
            pipe.scored = true;
            gameState.pipeScore++;
            gameState.overallScore = gameState.pipeScore + gameState.coinScore;
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

        const dx = gameState.bird.x + gameState.bird.width / 2 - coin.x;
        const dy = gameState.bird.y + gameState.bird.height / 2 - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < gameState.bird.width / 2 + coin.radius && !coin.collected) {
            coin.collected = true;
            gameState.coinScore += 10;
            gameState.overallScore = gameState.pipeScore + gameState.coinScore;
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

    // Update grass animation
    if (gameState.grassAnimation) {
        gameState.grassAnimation.update(dt);
    }
}

function drawGame() {
    ctx.save(); // Save the current context state
    
    // Apply screen shake if active
    if (gameState.screenShake.active) {
        const intensity = gameState.screenShake.intensity * (gameState.screenShake.duration / 500); // Gradually reduce intensity
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        ctx.translate(shakeX, shakeY);
    }
    
    // Draw hit flash overlay if active
    if (gameState.hitFlash.active) {
        const flashOpacity = (gameState.hitFlash.duration / 300) * 0.3; // Fade from 0.3 to 0
        ctx.fillStyle = `rgba(255, 0, 0, ${flashOpacity})`;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (gameState.background) gameState.background.draw(ctx, window.innerWidth, window.innerHeight, gameState.groundHeight);
    
    gameState.pipes.forEach(pipe => pipe.draw(ctx, pipeColor, currentPipeSkin, window.innerHeight, gameState.groundHeight));
    gameState.coins.forEach(coin => coin.draw(ctx));
    gameState.powerups.forEach(powerup => powerup.draw(ctx));
    gameState.enemyBirds.forEach(enemy => enemy.draw(ctx, enemyBirdImage));
    
    if (gameState.jetpackParticles.length > 0) {
        drawJetpackParticles(ctx);
    }
    
    drawGround(ctx, groundColor, groundTextureColor, window.innerWidth, window.innerHeight, gameState.groundHeight);
    
    if (gameState.grassAnimation) {
        gameState.grassAnimation.draw(ctx, window.innerWidth, window.innerHeight, gameState.groundHeight);
    }
    
    if (gameState.bird) {
        // Draw invincibility effect
        if (gameState.invincibilityTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
            gameState.bird.draw(ctx, birdImage);
            ctx.restore();
        } else {
            gameState.bird.draw(ctx, birdImage);
        }
        
        if (gameState.isFrozen) {
            drawFrozenEffect(ctx);
        }
        
        if (gameState.activePowerups.length > 0) {
            drawActivePowerupIndicators(ctx);
        }
        
        if (gameState.jetpackCooldownPhase) {
            drawJetpackCooldownIndicator(ctx);
        }
    }
    
    if (gameState.isRapidScoring) {
        drawRapidScoreEffect(ctx);
    }
    
    ctx.restore(); // Restore the context state
}

function drawRapidScoreEffect(ctx) {
    // Draw floating score numbers that move upward
    const scoreWidth = 50;
    const x = window.innerWidth / 2;
    const y = 80; // Near the top score display
    
    // Create pulsating effect timed with score accumulation
    const pulseSize = Math.sin(gameState.scoreAccumulationTimer / 250) * 5 + 15;
    
    ctx.font = "bold " + pulseSize + "px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    
    // Draw the +1 indicator with a stroking effect
    ctx.strokeText("+1", x, y);
    ctx.fillText("+1", x, y);
    
    // Draw a small sparkle effect around the score
    const sparkleRadius = pulseSize * 1.5;
    const sparkleCount = 5;
    const angle = (Date.now() / 1000) * Math.PI;
    
    ctx.lineWidth = 1;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkleAngle = angle + (i * (Math.PI * 2 / sparkleCount));
        const sparkleX = x + Math.cos(sparkleAngle) * sparkleRadius;
        const sparkleY = y + Math.sin(sparkleAngle) * sparkleRadius;
        
    ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
    ctx.fill();
    }
}

function drawActivePowerupIndicators(ctx) {
    const bird = gameState.bird;
    
    for (let i = 0; i < gameState.activePowerups.length; i++) {
        const powerup = gameState.activePowerups[i];
        const timeLeft = Math.max(0, powerup.duration - (Date.now() - powerup.startTime));
        const percentLeft = timeLeft / powerup.duration;
        
        if (powerup.type === 'jetpack') {
            // Draw invincibility glow around the bird
            if (powerup.invincible) {
                ctx.save();
                const glowSize = 10;
                const glowOpacity = 0.3 + Math.sin(Date.now() / 100) * 0.2;
                
                ctx.shadowColor = 'rgba(255, 215, 0, ' + glowOpacity + ')';
                ctx.shadowBlur = glowSize;
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(255, 215, 0, ' + glowOpacity + ')';
                ctx.beginPath();
                ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, 
                         bird.width / 1.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            
            // Draw jetpack image behind the bird
            if (jetpackImage && jetpackImage.complete) {
                const jetpackWidth = 30;
                const jetpackHeight = bird.height / 2;
                ctx.drawImage(jetpackImage, 
                    bird.x - jetpackWidth, 
                    bird.y + bird.height/4, 
                    jetpackWidth, 
                    jetpackHeight
                );
            }
            
            // Draw timer bar
            const barWidth = 40;
            const barHeight = 5;
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(bird.x - barWidth/2, bird.y - 15, barWidth, barHeight);
            ctx.fillStyle = percentLeft > 0.3 ? "#00FF00" : "#FF0000";
            ctx.fillRect(bird.x - barWidth/2, bird.y - 15, barWidth * percentLeft, barHeight);
            
            // Show "JETPACK" text
            ctx.font = "12px Arial";
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "center";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.strokeText("JETPACK", bird.x, bird.y - 25);
            ctx.fillText("JETPACK", bird.x, bird.y - 25);
            
            // Draw arrow key hint
            const arrowHintY = bird.y - 45;
            const arrowSize = 10;
            
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            ctx.roundRect(bird.x - 30, arrowHintY - 12, 60, 24, 5);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(bird.x - 15, arrowHintY);
            ctx.lineTo(bird.x - 15 - arrowSize/2, arrowHintY + arrowSize/2);
            ctx.lineTo(bird.x - 15 + arrowSize/2, arrowHintY + arrowSize/2);
            ctx.closePath();
            ctx.fillStyle = keys.ArrowUp ? "#00FF00" : "#FFFFFF";
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(bird.x + 15, arrowHintY + arrowSize/2);
            ctx.lineTo(bird.x + 15 - arrowSize/2, arrowHintY);
            ctx.lineTo(bird.x + 15 + arrowSize/2, arrowHintY);
            ctx.closePath();
            ctx.fillStyle = keys.ArrowDown ? "#00FF00" : "#FFFFFF";
            ctx.fill();
        }
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

function gameOver() {
    if (!gameState.running) return;
    gameState.running = false;
    gameState.gameOver = true;
    settingsButton.disabled = true;
    featurePanel.style.display = 'none';
    backgroundMusic.pause();
    
    // Play game over sound
    if (gameOverSound) {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(err => console.error("Error playing game over sound:", err));
    }
    
    finalScoreDisplay.innerText = `Score: ${gameState.overallScore}`;
    newHighScoreDisplay.style.display = 'none';
    newAllTimeHighScoreDisplay.style.display = 'none';

    if (gameState.overallScore > gameState.highScore) {
        gameState.highScore = gameState.overallScore;
        highScoreDisplay.innerText = "High Score: " + gameState.highScore;
        newHighScoreDisplay.style.display = 'block';
    }
    if (gameState.overallScore > gameState.allTimeHighScore) {
        gameState.allTimeHighScore = gameState.overallScore;
        saveAllTimeHighScore(gameState.allTimeHighScore);
        allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;
        newAllTimeHighScoreDisplay.style.display = 'block';
        newHighScoreDisplay.style.display = 'none';
    }

    gameOverMenu.style.display = "flex";
    pauseMenu.style.display = "none";
}

function gameLoop() {
    if (gameState.running) {
        const now = performance.now();
        const dt = Math.min(32, now - lastTime) / 16.67;
        lastTime = now;
        updateGame(dt);
        drawGame();
        requestAnimationFrame(gameLoop);
    }
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
}

birdSkins["bird_red.png"] = new Image();
birdSkins["bird_green.png"] = new Image();
birdSkins["bird_blue.png"] = new Image();
backgroundThemes["sky_background.png"] = new Image();
backgroundThemes["city_background.png"] = new Image();
backgroundThemes["night_background.png"] = new Image();
enemyBirdImage = new Image();

// Add jetpack image to assets
let jetpackImage = new Image();

const assets = [
    { image: birdSkins["bird_red.png"], src: "bird_red.png" },
    { image: birdSkins["bird_green.png"], src: "bird_green.png" },
    { image: birdSkins["bird_blue.png"], src: "bird_blue.png" },
    { image: backgroundThemes["sky_background.png"], src: "sky_background.png" },
    { image: backgroundThemes["city_background.png"], src: "city_background.png" },
    { image: backgroundThemes["night_background.png"], src: "night_background.png" },
    { image: enemyBirdImage, src: "enemy_bird.png" },
    { image: jetpackImage, src: "jetpack.png" }  // Add jetpack image to assets
];

assets.forEach((asset) => {
    if (asset.image) {
        asset.image.src = asset.src;
        asset.image.onload = checkAssetLoaded;
        asset.image.onerror = () => {
            console.error("Failed to load image:", asset.src);
            checkAssetLoaded();
        };
    }
});

flapSound.addEventListener("canplaythrough", () => {});
coinSound.addEventListener("canplaythrough", () => {});
flapSound.addEventListener("error", () => console.error("Failed to load flap audio"));
coinSound.addEventListener("error", () => console.error("Failed to load coin audio"));
backgroundMusic.addEventListener("canplaythrough", checkAssetLoaded);
backgroundMusic.addEventListener("error", () => {
    console.error("Failed to load audio:", "background_music.mp3");
    checkAssetLoaded();
});
backgroundMusic.preload = "auto";
backgroundMusic.src = "background_music.mp3";


function showSettingsMenu() {
    gameState.running = false;
    const wasPaused = gameState.paused;
    gameState.paused = true;
    pauseButton.textContent = "Resume";
    settingsButton.disabled = true;
    featurePanel.style.display = 'flex';
    settingsMenu.style.display = "flex";
    startMenu.style.display = "none";
    gameOverMenu.style.display = "none";
    pauseMenu.style.display = "none";
    settingsMenu.dataset.returnToPause = wasPaused ? "true" : "false";
    backgroundMusic.pause();
}

function hideSettingsMenu() {
    settingsMenu.style.display = "none";
    settingsButton.disabled = false;
    featurePanel.style.display = 'flex';
    const returnToPause = settingsMenu.dataset.returnToPause === "true";
    if (returnToPause) {
        gameState.running = false;
        pauseMenu.style.display = "flex";
    } else if (gameState.gameOver) {
        gameOverMenu.style.display = "flex";
    } else {
        gameState.paused = false;
        gameState.running = true;
        lastTime = performance.now();
        gameLoop();
        if (isMusicPlaying) backgroundMusic.play().catch(() => { });
    }
}

function changeBirdSkin(skin) {
    if (birdSkins[skin]) {
        birdImage = birdSkins[skin];
        currentBirdSkin = skin;
        saveSetting(BIRD_SKIN_KEY, skin);
    }
}

function changeBackgroundTheme(bg) {
    if (backgroundThemes[bg]) {
        backgroundImage = backgroundThemes[bg];
        currentBackgroundTheme = bg;
        saveSetting(BACKGROUND_THEME_KEY, bg);
        if (gameState.background) {
            gameState.background.changeImage(backgroundImage);
        }
    }
}


function changeDifficulty(diff) {
    gameState.difficulty = diff;
    resetPhysicsBasedOnDifficulty();
    saveSetting(DIFFICULTY_KEY, diff);
}

function changePipeSkin(skin) {
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
    if (!gameState.running && !gameState.paused) return;
    gameState.paused = !gameState.paused;
    settingsButton.disabled = gameState.paused;
    featurePanel.style.display = gameState.paused ? 'flex' : 'none';
    if (gameState.paused) {
        gameState.running = false;
        pauseMenu.style.display = "flex";
        pauseButton.textContent = "Resume";
        backgroundMusic.pause();
    } else {
        gameState.running = true;
        pauseMenu.style.display = "none";
        pauseButton.textContent = "Pause";
        lastTime = performance.now();
        gameLoop();
        if (isMusicPlaying) backgroundMusic.play().catch(() => { });
    }
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

startMenu.style.display = "none";
pauseButton.style.display = "none";
settingsButton.style.display = "none";
featurePanel.style.display = 'none';

masterVolumeControl.addEventListener("input", updateVolume);
soundEffectsVolumeControl.addEventListener("input", updateVolume);
musicVolumeControl.addEventListener("input", updateVolume);
birdSkinSelect.addEventListener("change", (e) => changeBirdSkin(e.target.value));
backgroundSelect.addEventListener("change", (e) => changeBackgroundTheme(e.target.value));
difficultySelect.addEventListener("change", (e) => changeDifficulty(e.target.value));
pipeSkinSelect.addEventListener("change", (e) => changePipeSkin(e.target.value));

window.addEventListener("load", function () {
    pauseButton.style.display = "block";
    settingsButton.style.display = "block";
    featurePanel.style.display = 'none';
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
    }
});

function toggleVerticalPipes(mode) {
    gameState.verticalPipesMode = mode;
    saveSetting('verticalPipesMode', mode);
    
    // Update existing pipes to match the new setting
    if (gameState.pipes && gameState.pipes.length > 0) {
        gameState.pipes.forEach(pipe => {
            switch(mode) {
                case "all":
                    pipe.verticalMovement = true;
                    break;
                case "none":
                    pipe.verticalMovement = false;
                    break;
                case "random":
                default:
                    // Keep the existing random assignment
                    break;
            }
        });
    }
}

function spawnEnemyBird() {
    // Increment the enemy bird spawn timer
    gameState.enemyBirdSpawnTimer += 16.67; // Assuming 60fps
    
    // Only spawn enemies if game is running and after the player has passed initial pipes
    // Make sure we're checking the timer correctly
    if (gameState.running && !gameState.gameOver && !gameState.paused && 
        gameState.enemyBirdSpawnTimer >= ENEMY_SPAWN_INTERVAL && 
        gameState.pipeScore >= ENEMY_SPAWN_INITIAL_DELAY) {
        
        console.log("Spawning enemy bird - timer:", gameState.enemyBirdSpawnTimer);
        
        // Get window dimensions
        const minY = 100;
        const maxY = window.innerHeight - gameState.groundHeight - 100;
        
        // Initial position on right side of screen, random y position
        const x = window.innerWidth + 100; // Start further off screen for smoother entry
        const y = Math.random() * (maxY - minY) + minY;
        
        // Reduced chance to spawn a pair (10% chance instead of 15%)
        const spawnPair = Math.random() < 0.10;
        
        // Create first enemy bird
        let enemyBird = new EnemyBird(x, y, 60, 45);
        enemyBird.applySpeed(gameState.physics.pipeSpeed * ENEMY_SPEED_MULTIPLIER);
        
        // Add to game state
        gameState.enemyBirds.push(enemyBird);
        
        // If spawning a pair, create a second enemy bird
        if (spawnPair) {
            // Position the second bird at a different height
            const secondY = Math.max(minY, Math.min(maxY, y + (Math.random() > 0.5 ? 120 : -120))); // Increased vertical separation
            const secondX = x + 100; // Increased horizontal separation
            
            let secondEnemyBird = new EnemyBird(secondX, secondY, 60, 45);
            secondEnemyBird.applySpeed(gameState.physics.pipeSpeed * ENEMY_SPEED_MULTIPLIER);
            gameState.enemyBirds.push(secondEnemyBird);
        }
        
        // Reset timer after spawning
        gameState.enemyBirdSpawnTimer = 0;
    }
}

function updateEnemyBirds(dt) {
    // Update all enemy birds
    for (let i = gameState.enemyBirds.length - 1; i >= 0; i--) {
        const enemy = gameState.enemyBirds[i];
        
        // Update position
        enemy.update(dt, gameState.bird);
        
        // Remove if off screen
        if (enemy.x < -enemy.width) {
            gameState.enemyBirds.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (gameState.bird && enemy.checkCollision(gameState.bird)) {
            // Only cause game over if player doesn't have invincibility
            const isInvincible = gameState.activePowerups.some(p => p.invincible);
            if (!isInvincible) {
                loseLife();
                if (gameState.lives <= 0) return;
            }
        }
    }
}

function toggleFreeze() {
    if (!gameState.running || gameState.paused || gameState.gameOver) return;
    
    // If cooldown is active, don't allow freeze
    if (gameState.freezeCooldown > 0) return;
    
    // Toggle freeze state
    if (!gameState.isFrozen) {
        // Start freeze
        gameState.isFrozen = true;
        gameState.freezeTimer = gameState.maxFreezeDuration;
        
        // Store the normal pipe speed
        gameState.normalPipeSpeed = gameState.physics.pipeSpeed;
        
        // Increase pipe speed by 50%
        const increasedSpeed = gameState.normalPipeSpeed * 1.5;
        gameState.physics.pipeSpeed = increasedSpeed;
        
        // Apply the increased speed to all moving objects
        gameState.pipes.forEach(pipe => pipe.applySpeed(increasedSpeed));
        gameState.coins.forEach(coin => coin.applySpeed(increasedSpeed));
        gameState.powerups.forEach(powerup => powerup.applySpeed(increasedSpeed));
        gameState.enemyBirds.forEach(enemy => enemy.applySpeed(increasedSpeed));
        
        // Update button appearance
        const freezeButton = document.getElementById("freezeButton");
        if (freezeButton) {
            freezeButton.style.backgroundColor = "#FF4500";
            freezeButton.textContent = "Frozen";
        }
    }
}

function updateFreezeState(dt) {
    // Update freeze timer if active
    if (gameState.isFrozen) {
        gameState.freezeTimer -= dt * 16.67; // Convert to milliseconds
        
        // If freeze duration is over
        if (gameState.freezeTimer <= 0) {
            // End freeze state
            gameState.isFrozen = false;
            
            // Restore normal pipe speed
            gameState.physics.pipeSpeed = gameState.normalPipeSpeed;
            
            // Apply normal speed to all moving objects
            gameState.pipes.forEach(pipe => pipe.applySpeed(gameState.normalPipeSpeed));
            gameState.coins.forEach(coin => coin.applySpeed(gameState.normalPipeSpeed));
            gameState.powerups.forEach(powerup => powerup.applySpeed(gameState.normalPipeSpeed));
            gameState.enemyBirds.forEach(enemy => enemy.applySpeed(gameState.normalPipeSpeed));
            
            // Start cooldown
            gameState.freezeCooldown = gameState.freezeCooldownDuration;
            
            // Update button appearance
            const freezeButton = document.getElementById("freezeButton");
            if (freezeButton) {
                freezeButton.style.backgroundColor = "";
                freezeButton.textContent = "Freeze";
            }
        }
    }
    
    // Update cooldown timer
    if (gameState.freezeCooldown > 0) {
        gameState.freezeCooldown -= dt * 16.67;
        
        // Update button to show cooldown
        const freezeButton = document.getElementById("freezeButton");
        if (freezeButton) {
            const cooldownSeconds = Math.ceil(gameState.freezeCooldown / 1000);
            freezeButton.textContent = `Freeze (${cooldownSeconds}s)`;
            
            // Reset button text when cooldown is complete
            if (gameState.freezeCooldown <= 0) {
                freezeButton.textContent = "Freeze";
            }
        }
    }
}

function drawFrozenEffect(ctx) {
    const bird = gameState.bird;
    if (!bird) return;
    
    // Draw ice crystal effect around the bird
    ctx.save();
    
    // Create shimmer effect
    const shimmerOpacity = 0.4 + Math.sin(Date.now() / 200) * 0.2;
    
    // Draw frozen aura
    ctx.strokeStyle = `rgba(135, 206, 250, ${shimmerOpacity})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, 
             bird.width * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw ice crystals around the bird
    const crystalCount = 5;
    const radius = bird.width * 0.9;
    
    for (let i = 0; i < crystalCount; i++) {
        const angle = (i / crystalCount) * Math.PI * 2 + (Date.now() / 2000);
        const x = bird.x + bird.width/2 + Math.cos(angle) * radius;
        const y = bird.y + bird.height/2 + Math.sin(angle) * radius;
        const size = 5 + Math.sin(Date.now() / 500 + i) * 2;
        
        // Draw a snowflake shape
        ctx.fillStyle = `rgba(255, 255, 255, ${shimmerOpacity + 0.3})`;
        for (let j = 0; j < 6; j++) {
            const flakeAngle = (j / 6) * Math.PI * 2;
            const endX = x + Math.cos(flakeAngle) * size;
            const endY = y + Math.sin(flakeAngle) * size;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }
    
    // Display freeze timer as a countdown bar
    if (gameState.freezeTimer > 0) {
        const barWidth = 40;
        const barHeight = 5;
        const percentLeft = gameState.freezeTimer / gameState.maxFreezeDuration;
        
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(bird.x - barWidth/2, bird.y - 25, barWidth, barHeight);
        ctx.fillStyle = "rgba(135, 206, 250, 0.8)";
        ctx.fillRect(bird.x - barWidth/2, bird.y - 25, barWidth * percentLeft, barHeight);
    }
    
    ctx.restore();
}

// Add event listeners for keyboard controls
window.addEventListener('keydown', function(e) {
    if (e.key in keys) {
        keys[e.key] = true;
        // Prevent default behavior for arrow keys (page scrolling)
        e.preventDefault();
    }
});

window.addEventListener('keyup', function(e) {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Add roundRect polyfill if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

function updateJetpackCooldown(dt) {
    if (!gameState.jetpackCooldownPhase) return;
    
    // Update cooldown timer
    gameState.jetpackCooldownTimer -= dt * 16.67; // Convert to milliseconds
    
    if (gameState.jetpackCooldownTimer <= 0) {
        // End cooldown phase
        gameState.jetpackCooldownPhase = false;
        
        // Make sure we set the final speed precisely
        gameState.physics.pipeSpeed = gameState.jetpackOriginalSpeed;
        
        // Apply final speed to all objects
        gameState.pipes.forEach(pipe => pipe.applySpeed(gameState.jetpackOriginalSpeed));
        gameState.coins.forEach(coin => coin.applySpeed(gameState.jetpackOriginalSpeed));
        gameState.powerups.forEach(powerup => powerup.applySpeed(gameState.jetpackOriginalSpeed));
        gameState.enemyBirds.forEach(enemy => enemy.applySpeed(gameState.jetpackOriginalSpeed));
        
        // Restore normal gravity - we now handle this in Bird.update()
        if (gameState.jetpackOriginalGravity !== undefined) {
            gameState.physics.gravity = gameState.jetpackOriginalGravity;
        }
        
        return;
    }
    
    // Calculate progress through cooldown (1.0 to 0.0)
    const progress = gameState.jetpackCooldownTimer / gameState.jetpackCooldownDuration;
    
    // Use easeOutQuad easing function for smooth deceleration
    const easedProgress = 1 - (1 - progress) * (1 - progress);
    
    // Interpolate between boost speed and original speed
    const interpolatedSpeed = gameState.jetpackOriginalSpeed + 
                             (gameState.jetpackBoostSpeed - gameState.jetpackOriginalSpeed) * easedProgress;
    
    // Apply interpolated speed
    gameState.physics.pipeSpeed = interpolatedSpeed;
    
    // Apply to all game objects
    gameState.pipes.forEach(pipe => pipe.applySpeed(interpolatedSpeed));
    gameState.coins.forEach(coin => coin.applySpeed(interpolatedSpeed));
    gameState.powerups.forEach(powerup => powerup.applySpeed(interpolatedSpeed));
    gameState.enemyBirds.forEach(enemy => enemy.applySpeed(interpolatedSpeed));
    
    // Bird update now handles gravity and position
    
    // Create fewer particles during cooldown
    if (Math.random() > 0.7 && gameState.bird) {
        createJetpackParticles(gameState.bird, true); // true indicates cooldown phase
    }
}

function drawJetpackCooldownIndicator(ctx) {
    const bird = gameState.bird;
    if (!bird) return;
    
    // Calculate cooldown progress
    const progress = gameState.jetpackCooldownTimer / gameState.jetpackCooldownDuration;
    const easedProgress = 1 - (1 - progress) * (1 - progress);
    
    // Draw a fading jetpack
    ctx.save();
    
    // Jetpack body with fading effect
    ctx.globalAlpha = easedProgress * 0.8;
    ctx.fillStyle = "#666";
    ctx.fillRect(bird.x - 15, bird.y + bird.height/4, 15, bird.height/2);
    
    // Draw fading motion lines to indicate slowing down
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    for (let j = 0; j < 3; j++) {
        const offset = j * 10;
        const alpha = (0.7 - (j * 0.15)) * easedProgress;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(bird.x - 15 - offset, bird.y + bird.height/4 - 5);
        ctx.lineTo(bird.x - 25 - offset, bird.y + bird.height/4 - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(bird.x - 15 - offset, bird.y + 3*bird.height/4 + 5);
        ctx.lineTo(bird.x - 25 - offset, bird.y + 3*bird.height/4 + 5);
        ctx.stroke();
    }
    
    // Draw smaller flames based on progress
    if (Math.random() > 0.4) {
        const flameSize = easedProgress * 15;
        ctx.globalAlpha = easedProgress * 0.9;
        ctx.fillStyle = "#FF4500";
        
        // Top flame
        ctx.beginPath();
        ctx.moveTo(bird.x - 15, bird.y + bird.height/4);
        ctx.lineTo(bird.x - 15 - flameSize, bird.y + bird.height/6);
        ctx.lineTo(bird.x - 15 - flameSize, bird.y + bird.height/3);
        ctx.closePath();
        ctx.fill();
        
        // Bottom flame
        ctx.beginPath();
        ctx.moveTo(bird.x - 15, bird.y + 3*bird.height/4);
        ctx.lineTo(bird.x - 15 - flameSize, bird.y + 2*bird.height/3);
        ctx.lineTo(bird.x - 15 - flameSize, bird.y + 5*bird.height/6);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw "SLOWING DOWN" text
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.globalAlpha = easedProgress;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.strokeText("SLOWING DOWN", bird.x, bird.y - 25);
    ctx.fillStyle = "#FF9900";
    ctx.fillText("SLOWING DOWN", bird.x, bird.y - 25);
    
    ctx.restore();
}

class GrassAnimation {
    constructor(canvasWidth) {
        this.offset = 0;
        this.speed = 0; // Will be set based on pipe speed
        this.grassBlades = this.generateGrassBlades(canvasWidth);
    }

    generateGrassBlades(canvasWidth) {
        const blades = [];
        // Generate grass blades for two screen widths to enable seamless looping
        for (let i = 0; i < canvasWidth * 2; i += 5) {
            blades.push({
                x: i,
                height: Math.random() * (grassBladeHeightMax - grassBladeHeightMin) + grassBladeHeightMin,
                width: Math.random() * grassBladeThickness + 1,
                color: grassColors[Math.floor(Math.random() * grassColors.length)],
                curve: Math.random() * 4 - 2,
                hasStroke: Math.random() < 0.15
            });
        }
        return blades;
    }

    update(dt) {
        // Set grass speed to 1/3 of pipe speed (same ratio as background)
        this.speed = gameState.physics.pipeSpeed / 3;
        
        // Move grass to the left
        this.offset -= this.speed * dt;
        // Reset offset when one screen width has passed to create seamless loop
        if (this.offset <= -window.innerWidth) {
            this.offset = 0;
        }
    }

    draw(ctx, canvasWidth, canvasHeight, groundHeight) {
        const grassTop = canvasHeight - groundHeight;
        ctx.globalAlpha = grassTransparency;

        // Draw all grass blades with current offset
        for (const blade of this.grassBlades) {
            const x = (blade.x + this.offset) % (canvasWidth * 2);
            // Only draw blades that are within the visible area
            if (x >= -5 && x <= canvasWidth) {
                ctx.fillStyle = blade.color;
                ctx.beginPath();
                ctx.moveTo(x, grassTop);
                ctx.quadraticCurveTo(
                    x + blade.curve,
                    grassTop - blade.height / 2,
                    x + blade.width,
                    grassTop - blade.height
                );
                ctx.lineTo(x + blade.width, grassTop);
                ctx.closePath();
                ctx.fill();

                if (blade.hasStroke) {
                    ctx.strokeStyle = grassBladeColor;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }
}

function drawBluePipe(ctx, x, topHeight, bottomHeight, pipeWidth, canvasHeight, groundHeight) {
    const blue500 = "rgb(59, 130, 246)";
    const blue900 = "rgb(26, 32, 144)";
    const blue200 = "rgb(191, 219, 254)";

    ctx.fillStyle = blue500;
    ctx.fillRect(x, 0, pipeWidth, topHeight);

    ctx.strokeStyle = blue900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, 0, pipeWidth, topHeight);

    ctx.fillStyle = blue200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x, 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = blue900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, 0, 1, topHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = blue900;
    ctx.beginPath();
    ctx.arc(x, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = blue500;
    ctx.fillRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.strokeStyle = blue900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.fillStyle = blue200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 2, canvasHeight - groundHeight - bottomHeight + 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = blue900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, canvasHeight - groundHeight - bottomHeight, 1, bottomHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = blue900;
    ctx.beginPath();
    ctx.arc(x, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawRedPipe(ctx, x, topHeight, bottomHeight, pipeWidth, canvasHeight, groundHeight) {
    const red500 = "rgb(244, 67, 54)";
    const red900 = "rgb(183, 28, 28)";
    const red200 = "rgb(255, 204, 204)";

    ctx.fillStyle = red500;
    ctx.fillRect(x, 0, pipeWidth, topHeight);

    ctx.strokeStyle = red900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, 0, pipeWidth, topHeight);

    ctx.fillStyle = red200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x, 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = red900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, 0, 1, topHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = red900;
    ctx.beginPath();
    ctx.arc(x, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = red500;
    ctx.fillRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.strokeStyle = red900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.fillStyle = red200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 2, canvasHeight - groundHeight - bottomHeight + 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = red900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, canvasHeight - groundHeight - bottomHeight, 1, bottomHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = red900;
    ctx.beginPath();
    ctx.arc(x, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function updateLivesDisplay() {
    const livesDisplay = document.getElementById('livesDisplay');
    if (livesDisplay) {
        livesDisplay.innerText = `Lives: ${gameState.lives}`;
        
        // Add shake animation class
        livesDisplay.classList.add('shake-animation');
        
        // Remove the class after animation completes
        setTimeout(() => {
            livesDisplay.classList.remove('shake-animation');
        }, 500); // Match this with CSS animation duration
    }
}

function loseLife() {
    if (gameState.lives > 0) {
        gameState.lives--;
        updateLivesDisplay();
        
        // Play crash sound
        if (crashSound) {
            crashSound.currentTime = 0;
            crashSound.play().catch(err => console.error("Error playing crash sound:", err));
        }
        
        // Trigger screen shake
        gameState.screenShake = {
            active: true,
            duration: 500, // 500ms of shake
            intensity: 20  // Maximum shake offset in pixels
        };
        
        // Trigger hit flash
        gameState.hitFlash = {
            active: true,
            duration: 300  // 300ms of red flash
        };
        
        // Give temporary invincibility
        gameState.invincibilityTimer = gameState.invincibilityDuration;
        
        // Visual feedback
        if (gameState.bird) {
            gameState.bird.velocity = gameState.physics.flapStrength;
        }
        
        // If no lives left, trigger game over
        if (gameState.lives <= 0) {
            gameOver();
        }
    }
}

// Add event listeners for the new audio elements
crashSound.addEventListener("error", () => console.error("Failed to load crash audio"));
gameOverSound.addEventListener("error", () => console.error("Failed to load game over audio"));
jetpackSound.addEventListener("error", () => console.error("Failed to load jetpack audio"));
yaySound.addEventListener("error", () => console.error("Failed to load yay audio"));