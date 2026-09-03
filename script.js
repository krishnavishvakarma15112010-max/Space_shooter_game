/* =====================================================
   SPACE FIGHT SHOOTER
   3 SHIPS + ABILITIES + HULL SYSTEM
===================================================== */


/* ================= CANVAS ================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* ================= ASSETS ================= */

const playerImage =
    new Image();

const enemyImage =
    new Image();

const backgroundImage =
    new Image();


playerImage.src =
    "./asset/player-ship.png";

enemyImage.src =
    "./asset/enemy-ship.png";

backgroundImage.src =
    "./asset/space-background.png";


/* ================= MUSIC ================= */

const music =
    new Audio(
        "./asset/space_shooter.mp3"
    );

music.loop = true;
music.volume = 0.25;


/* ================= SAVED DATA ================= */

let playerName =
    localStorage.getItem(
        "spaceFightPlayerName"
    ) || "";


let selectedSkin =
    localStorage.getItem(
        "spaceFightSkin"
    ) || "starter";


let bestScore =
    Number(
        localStorage.getItem(
            "spaceFightBestScore"
        )
    ) || 0;


let bestWave =
    Number(
        localStorage.getItem(
            "spaceFightBestWave"
        )
    ) || 1;


let totalKills =
    Number(
        localStorage.getItem(
            "spaceFightTotalKills"
        )
    ) || 0;


/* ================= SHIP STATS ================= */

const shipStats = {

    starter: {
        maxHealth: 100,
        pulseDamage: 60
    },

    blue: {
        maxHealth: 150,
        pulseDamage: 60
    },

    green: {
        maxHealth: 100,
        pulseDamage: 85
    }

};


/* ================= GAME ================= */

let gameRunning = false;

let paused = false;

let score = 0;

let wave = 1;

let kills = 0;

let maxHealth =
    shipStats.starter.maxHealth;

let health =
    maxHealth;


/* ================= ARRAYS ================= */

let enemies = [];

let pulses = [];

let particles = [];

let stars = [];


let spawnTimer = 0;

let lastTime = 0;


/* ================= PLAYER ================= */

const player = {

    x: 0,

    y: 0,

    width: 135,

    height: 135,

    speed: 470,

    movingUp: false,

    movingDown: false,

    movingLeft: false,

    movingRight: false,

    pulseCooldown: 0,

    damageCooldown: 0

};


/* ================= RESIZE ================= */

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;


    if (
        player.x === 0
    ) {

        player.x =
            canvas.width / 2;

        player.y =
            canvas.height - 150;

    }


    player.x =
        Math.max(
            player.width / 2,
            Math.min(
                canvas.width -
                player.width / 2,
                player.x
            )
        );


    player.y =
        Math.max(
            player.height / 2,
            Math.min(
                canvas.height -
                player.height / 2,
                player.y
            )
        );


    createStars();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* ================= STARS ================= */

function createStars() {

    stars = [];

    for (
        let i = 0;
        i < 140;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                Math.random() *
                2 +
                0.5,

            speed:
                Math.random() *
                55 +
                15,

            alpha:
                Math.random() *
                0.7 +
                0.2

        });

    }

}


function updateStars(dt) {

    for (
        const star of stars
    ) {

        star.y +=
            star.speed *
            dt;


        if (
            star.y >
            canvas.height
        ) {

            star.y = -5;

            star.x =
                Math.random() *
                canvas.width;

        }

    }

}


function drawStars() {

    for (
        const star of stars
    ) {

        ctx.globalAlpha =
            star.alpha;

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.globalAlpha = 1;
}


/* ================= BACKGROUND ================= */

function drawBackground() {

    if (
        backgroundImage.complete &&
        backgroundImage.naturalWidth > 0
    ) {

        const imageRatio =
            backgroundImage.naturalWidth /
            backgroundImage.naturalHeight;

        const screenRatio =
            canvas.width /
            canvas.height;

        let width;
        let height;

        if (
            screenRatio >
            imageRatio
        ) {

            width =
                canvas.width;

            height =
                width /
                imageRatio;

        } else {

            height =
                canvas.height;

            width =
                height *
                imageRatio;

        }

        const x =
            (
                canvas.width -
                width
            ) / 2;

        const y =
            (
                canvas.height -
                height
            ) / 2;

        ctx.drawImage(
            backgroundImage,
            x,
            y,
            width,
            height
        );

    } else {

        ctx.fillStyle =
            "#020611";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }


    ctx.fillStyle =
        "rgba(0,0,20,0.25)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawStars();
}


/* ================= HUD ================= */

function updateHUD() {

    const scoreElement =
        document.getElementById("score");

    const waveElement =
        document.getElementById("wave");

    const killsElement =
        document.getElementById("kills");

    const healthBar =
        document.getElementById("healthBar");

    const healthText =
        document.getElementById("healthText");


    if (scoreElement) {

        scoreElement.textContent =
            score;

    }


    if (waveElement) {

        waveElement.textContent =
            wave;

    }


    if (killsElement) {

        killsElement.textContent =
            kills;

    }


    if (healthBar) {

        healthBar.style.width =
            (
                health /
                maxHealth *
                100
            ) + "%";

    }


    if (healthText) {

        healthText.textContent =
            `${health} / ${maxHealth}`;

    }

}


/* ================= SCREENS ================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );

        });


    const screen =
        document.getElementById(id);


    if (screen) {

        screen.classList.remove(
            "hidden"
        );

    }

}


function hideScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );

        });

}


/* ================= MENU DATA ================= */

function updateMenuData() {

    const name =
        document.getElementById(
            "menuPlayerName"
        );

    const best =
        document.getElementById(
            "bestScore"
        );

    const bestW =
        document.getElementById(
            "bestWave"
        );

    const total =
        document.getElementById(
            "totalKills"
        );


    if (name) {

        name.textContent =
            playerName ||
            "ENTER NAME";

    }


    if (best) {

        best.textContent =
            bestScore;

    }


    if (bestW) {

        bestW.textContent =
            bestWave;

    }


    if (total) {

        total.textContent =
            totalKills;

    }

}


/* ================= PROFILE ================= */

function openProfile() {

    const input =
        document.getElementById(
            "playerNameInput"
        );

    const message =
        document.getElementById(
            "nameMessage"
        );


    input.value =
        playerName;


    message.textContent =
        "";


    document
        .getElementById(
            "profileBestScore"
        )
        .textContent =
        bestScore;


    document
        .getElementById(
            "profileTotalKills"
        )
        .textContent =
        totalKills;


    showScreen(
        "profileScreen"
    );

}


function savePlayerName() {

    const input =
        document.getElementById(
            "playerNameInput"
        );

    const message =
        document.getElementById(
            "nameMessage"
        );


    const name =
        input.value.trim();


    if (
        name.length === 0
    ) {

        message.textContent =
            "Please enter your name.";

        return;

    }


    playerName =
        name.substring(
            0,
            18
        );


    localStorage.setItem(
        "spaceFightPlayerName",
        playerName
    );


    updateMenuData();

    showScreen(
        "startScreen"
    );

}


/* ================= ABOUT ================= */

function openAbout() {

    showScreen(
        "aboutScreen"
    );

}


/* ================= HANGAR ================= */

function openHangar() {

    updateHangar();

    showScreen(
        "hangarScreen"
    );

}


function updateHangar() {

    document
        .querySelectorAll(
            ".skin-button"
        )
        .forEach(button => {

            const skin =
                button.dataset.skin;

            const price =
                button.querySelector(
                    ".skin-price"
                );


            button.classList.toggle(
                "selected",
                skin === selectedSkin
            );


            if (
                skin === "starter"
            ) {

                price.textContent =
                    "✓ FREE";

                price.classList.add(
                    "unlocked"
                );

            }


            if (
                skin === "blue"
            ) {

                price.textContent =
                    "✓ FREE";

                price.classList.add(
                    "unlocked"
                );

            }


            if (
                skin === "green"
            ) {

                if (
                    totalKills >= 100
                ) {

                    price.textContent =
                        "✓ UNLOCKED";

                    price.classList.add(
                        "unlocked"
                    );

                } else {

                    price.textContent =
                        "🔒 100 KILLS";

                    price.classList.remove(
                        "unlocked"
                    );

                }

            }

        });

}


/* ================= SELECT SHIP ================= */

function selectSkin(skin) {

    if (
        skin === "green" &&
        totalKills < 100
    ) {

        return;

    }


    selectedSkin =
        skin;


    localStorage.setItem(
        "spaceFightSkin",
        selectedSkin
    );


    applySkin();

    updateHangar();

}


/* ================= APPLY IMAGE ================= */

function applySkin() {

    if (
        selectedSkin === "green"
    ) {

        playerImage.src =
            "./asset/green-skin.png";

    } else if (
        selectedSkin === "blue"
    ) {

        playerImage.src =
            "./asset/blue-skin.png";

    } else {

        selectedSkin =
            "starter";

        playerImage.src =
            "./asset/player-ship.png";

    }

}


/* ================= APPLY ABILITY ================= */

function applyShipStats() {

    const stats =
        shipStats[
            selectedSkin
        ] ||
        shipStats.starter;


    maxHealth =
        stats.maxHealth;

}


/* ================= START GAME ================= */

function startGame() {

    if (
        playerName.trim() === ""
    ) {

        openProfile();

        document
            .getElementById(
                "nameMessage"
            )
            .textContent =
            "Enter your name before launching.";

        return;

    }


    applySkin();

    applyShipStats();


    score = 0;

    wave = 1;

    kills = 0;

    health =
        maxHealth;


    enemies = [];

    pulses = [];

    particles = [];


    spawnTimer = 0;


    gameRunning =
        true;

    paused =
        false;


    player.x =
        canvas.width / 2;

    player.y =
        canvas.height - 150;


    player.pulseCooldown =
        0;

    player.damageCooldown =
        0;


    hideScreens();


    document
        .getElementById(
            "gameHUD"
        )
        .classList.remove(
            "hidden"
        );


    updateHUD();


    music.play().catch(
        () => {}
    );


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


/* ================= PLAYER ================= */

function updatePlayer(dt) {

    let dx = 0;

    let dy = 0;


    if (
        player.movingLeft
    )
        dx--;


    if (
        player.movingRight
    )
        dx++;


    if (
        player.movingUp
    )
        dy--;


    if (
        player.movingDown
    )
        dy++;


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.hypot(
                dx,
                dy
            );


        dx /=
            length;

        dy /=
            length;


        player.x +=
            dx *
            player.speed *
            dt;


        player.y +=
            dy *
            player.speed *
            dt;

    }


    player.x =
        Math.max(
            player.width / 2,
            Math.min(
                canvas.width -
                player.width / 2,
                player.x
            )
        );


    player.y =
        Math.max(
            player.height / 2,
            Math.min(
                canvas.height -
                player.height / 2,
                player.y
            )
        );


    if (
        player.pulseCooldown > 0
    ) {

        player.pulseCooldown -=
            dt;

    }


    if (
        player.damageCooldown > 0
    ) {

        player.damageCooldown -=
            dt;

    }

}


/* ================= DRAW PLAYER ================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );


    if (
        player.damageCooldown > 0 &&
        Math.floor(
            player.damageCooldown * 15
        ) % 2 === 0
    ) {

        ctx.globalAlpha =
            0.45;

    }


    if (
        playerImage.complete &&
        playerImage.naturalWidth > 0
    ) {

        ctx.drawImage(

            playerImage,

            -player.width / 2,

            -player.height / 2,

            player.width,

            player.height

        );

    }


    ctx.restore();


    /* PLAYER NAME */

    ctx.save();

    ctx.textAlign =
        "center";

    ctx.font =
        "bold 15px Arial";

    ctx.fillStyle =
        "#ffffff";

    ctx.shadowBlur =
        12;

    ctx.shadowColor =
        "#39dfff";


    ctx.fillText(

        playerName,

        player.x,

        player.y -
        player.height / 2 -
        12

    );


    ctx.restore();

}


/* ================= SPAWN ENEMY ================= */

function spawnEnemy() {

    const boss =
        wave % 5 === 0 &&
        Math.random() < 0.25;


    const size =
        boss
            ? 160
            : 105;


    enemies.push({

        x:
            Math.random() *
            (
                canvas.width -
                size
            ) +
            size / 2,

        y:
            -size,

        width:
            size,

        height:
            size,

        speed:
            (
                boss
                    ? 65
                    : 120
            ) +
            wave * 6,

        hp:
            boss
                ? 300
                : 100,

        maxHp:
            boss
                ? 300
                : 100,

        boss:
            boss,

        direction:
            Math.random() > 0.5
                ? 1
                : -1,

        hitFlash:
            0

    });

}


/* ================= UPDATE ENEMY ================= */

function updateEnemies(dt) {

    for (
        let i =
            enemies.length - 1;

        i >= 0;

        i--
    ) {

        const enemy =
            enemies[i];


        enemy.y +=
            enemy.speed *
            dt;


        enemy.x +=
            enemy.direction *
            35 *
            dt;


        if (
            enemy.x <
            enemy.width / 2
        ) {

            enemy.direction =
                1;

        }


        if (
            enemy.x >
            canvas.width -
            enemy.width / 2
        ) {

            enemy.direction =
                -1;

        }


        if (
            enemy.hitFlash > 0
        ) {

            enemy.hitFlash -=
                dt;

        }


        /*
            IMPORTANT:
            Enemy leaving the bottom
            DOES NOT damage hull.
        */

        if (
            enemy.y -
            enemy.height / 2 >
            canvas.height
        ) {

            enemies.splice(
                i,
                1
            );

        }

    }

}


/* ================= DRAW ENEMY ================= */

function drawEnemies() {

    for (
        const enemy of enemies
    ) {

        ctx.save();

        ctx.translate(
            enemy.x,
            enemy.y
        );


        if (
            enemy.hitFlash > 0
        ) {

            ctx.globalAlpha =
                0.5;

        }


        if (
            enemyImage.complete &&
            enemyImage.naturalWidth > 0
        ) {

            ctx.drawImage(

                enemyImage,

                -enemy.width / 2,

                -enemy.height / 2,

                enemy.width,

                enemy.height

            );

        }


        ctx.restore();


        /* ENEMY HP BAR */

        const barWidth =
            enemy.width * 0.65;


        const hpPercent =
            enemy.hp /
            enemy.maxHp;


        ctx.fillStyle =
            "rgba(0,0,0,0.7)";


        ctx.fillRect(

            enemy.x -
            barWidth / 2,

            enemy.y -
            enemy.height / 2 -
            12,

            barWidth,

            5

        );


        ctx.fillStyle =
            enemy.boss
                ? "#ff406c"
                : "#4effa3";


        ctx.fillRect(

            enemy.x -
            barWidth / 2,

            enemy.y -
            enemy.height / 2 -
            12,

            barWidth *
            hpPercent,

            5

        );

    }

}


/* ================= ENERGY PULSE ================= */

function usePulse() {

    if (
        !gameRunning ||
        paused
    )
        return;


    if (
        player.pulseCooldown > 0
    )
        return;


    player.pulseCooldown =
        0.22;


    pulses.push({

        x:
            player.x,

        y:
            player.y -
            player.height / 2,

        width:
            18,

        height:
            48,

        speed:
            1200,

        life:
            1

    });

}


function updatePulses(dt) {

    for (
        let i =
            pulses.length - 1;

        i >= 0;

        i--
    ) {

        const pulse =
            pulses[i];


        pulse.y -=
            pulse.speed *
            dt;


        pulse.life -=
            dt * 1.5;


        if (
            pulse.life <= 0 ||
            pulse.y < -60
        ) {

            pulses.splice(
                i,
                1
            );

            continue;

        }


        for (
            let j =
                enemies.length - 1;

            j >= 0;

            j--
        ) {

            const enemy =
                enemies[j];


            if (
                collision(
                    pulse,
                    enemy,
                    0.75
                )
            ) {

                const damage =
                    shipStats[
                        selectedSkin
                    ].pulseDamage;


                damageEnemy(
                    enemy,
                    damage
                );


                createParticles(
                    enemy.x,
                    enemy.y,
                    10
                );


                pulses.splice(
                    i,
                    1
                );


                break;

            }

        }

    }

}


function drawPulses() {

    for (
        const pulse of pulses
    ) {

        ctx.save();

        ctx.globalAlpha =
            pulse.life;

        ctx.shadowBlur =
            22;

        ctx.shadowColor =
            "#43e8ff";

        ctx.fillStyle =
            "#57e8ff";


        ctx.fillRect(

            pulse.x -
            pulse.width / 2,

            pulse.y -
            pulse.height / 2,

            pulse.width,

            pulse.height

        );


        ctx.restore();

    }

}


/* ================= COLLISION ================= */

function collision(
    a,
    b,
    scale = 0.55
) {

    const aw =
        (a.width || 20) *
        scale;

    const ah =
        (a.height || 20) *
        scale;

    const bw =
        (b.width || 20) *
        scale;

    const bh =
        (b.height || 20) *
        scale;


    return (

        Math.abs(
            a.x -
            b.x
        ) <
        (aw + bw) / 2

        &&

        Math.abs(
            a.y -
            b.y
        ) <
        (ah + bh) / 2

    );

}


/* ================= ENEMY TOUCH ================= */

function checkEnemyCollision() {

    if (
        player.damageCooldown > 0
    )
        return;


    for (
        let i =
            enemies.length - 1;

        i >= 0;

        i--
    ) {

        const enemy =
            enemies[i];


        if (
            collision(
                player,
                enemy,
                0.58
            )
        ) {

            /*
                ONLY enemy touching
                player causes damage.
            */

            damagePlayer(

                enemy.boss
                    ? 30
                    : 20

            );


            createParticles(
                player.x,
                player.y,
                15
            );


            if (
                !enemy.boss
            ) {

                enemies.splice(
                    i,
                    1
                );

            }


            break;

        }

    }

}


/* ================= PLAYER DAMAGE ================= */

function damagePlayer(
    amount
) {

    if (
        !gameRunning
    )
        return;


    if (
        player.damageCooldown > 0
    )
        return;


    health -=
        amount;


    health =
        Math.max(
            0,
            health
        );


    player.damageCooldown =
        1;


    updateHUD();


    if (
        health <= 0
    ) {

        endGame();

    }

}


/* ================= ENEMY DAMAGE ================= */

function damageEnemy(
    enemy,
    amount
) {

    enemy.hp -=
        amount;


    enemy.hitFlash =
        0.12;


    if (
        enemy.hp <= 0
    ) {

        const index =
            enemies.indexOf(
                enemy
            );


        if (
            index !== -1
        ) {

            enemies.splice(
                index,
                1
            );

        }


        kills++;

        totalKills++;


        score +=
            enemy.boss
                ? 1000
                : 100;


        localStorage.setItem(
            "spaceFightTotalKills",
            totalKills
        );


        createParticles(

            enemy.x,

            enemy.y,

            enemy.boss
                ? 35
                : 18

        );


        const newWave =
            Math.floor(
                kills / 8
            ) + 1;


        if (
            newWave > wave
        ) {

            wave =
                newWave;

        }


        updateHUD();

    }

}


/* ================= PARTICLES ================= */

function createParticles(
    x,
    y,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const speed =
            Math.random() *
            250 +
            60;


        particles.push({

            x: x,

            y: y,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            life:
                Math.random() *
                0.6 +
                0.3,

            size:
                Math.random() *
                4 +
                1

        });

    }

}


function updateParticles(dt) {

    for (
        let i =
            particles.length - 1;

        i >= 0;

        i--
    ) {

        const p =
            particles[i];


        p.x +=
            p.vx *
            dt;


        p.y +=
            p.vy *
            dt;


        p.vx *=
            0.97;


        p.vy *=
            0.97;


        p.life -=
            dt;


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


function drawParticles() {

    for (
        const p of particles
    ) {

        ctx.save();

        ctx.globalAlpha =
            Math.max(
                0,
                p.life
            );

        ctx.fillStyle =
            "#64eaff";


        ctx.beginPath();


        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.restore();

    }

}


/* ================= SPAWN ================= */

function updateSpawn(dt) {

    spawnTimer -=
        dt;


    const interval =
        Math.max(
            0.35,
            1.1 -
            wave * 0.04
        );


    if (
        spawnTimer <= 0
    ) {

        spawnEnemy();

        spawnTimer =
            interval;

    }

}


/* ================= PAUSE ================= */

function togglePause() {

    if (
        !gameRunning
    )
        return;


    paused =
        !paused;


    if (
        paused
    ) {

        music.pause();

        showScreen(
            "pauseScreen"
        );

    } else {

        hideScreens();

        music.play().catch(
            () => {}
        );

        lastTime =
            performance.now();

        requestAnimationFrame(
            gameLoop
        );

    }

}


/* ================= GAME OVER ================= */

function endGame() {

    gameRunning =
        false;

    paused =
        false;


    music.pause();


    document
        .getElementById(
            "gameHUD"
        )
        .classList.add(
            "hidden"
        );


    if (
        score > bestScore
    ) {

        bestScore =
            score;


        localStorage.setItem(
            "spaceFightBestScore",
            bestScore
        );

    }


    if (
        wave > bestWave
    ) {

        bestWave =
            wave;


        localStorage.setItem(
            "spaceFightBestWave",
            bestWave
        );

    }


    document
        .getElementById(
            "finalScore"
        )
        .textContent =
        score;


    document
        .getElementById(
            "finalKills"
        )
        .textContent =
        kills;


    document
        .getElementById(
            "gameBestScore"
        )
        .textContent =
        bestScore;


    updateMenuData();


    showScreen(
        "gameOverScreen"
    );

}


/* ================= MAIN MENU ================= */

function returnToMenu() {

    gameRunning =
        false;

    paused =
        false;


    music.pause();


    document
        .getElementById(
            "gameHUD"
        )
        .classList.add(
            "hidden"
        );


    updateMenuData();


    showScreen(
        "startScreen"
    );

}


/* ================= KEYBOARD ================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "w" ||
            event.key === "W" ||
            event.key === "ArrowUp"
        ) {

            player.movingUp =
                true;

        }


        if (
            event.key === "s" ||
            event.key === "S" ||
            event.key === "ArrowDown"
        ) {

            player.movingDown =
                true;

        }


        if (
            event.key === "a" ||
            event.key === "A" ||
            event.key === "ArrowLeft"
        ) {

            player.movingLeft =
                true;

        }


        if (
            event.key === "d" ||
            event.key === "D" ||
            event.key === "ArrowRight"
        ) {

            player.movingRight =
                true;

        }


        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            usePulse();

        }


        if (
            event.key === "p" ||
            event.key === "P"
        ) {

            togglePause();

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "w" ||
            event.key === "W" ||
            event.key === "ArrowUp"
        ) {

            player.movingUp =
                false;

        }


        if (
            event.key === "s" ||
            event.key === "S" ||
            event.key === "ArrowDown"
        ) {

            player.movingDown =
                false;

        }


        if (
            event.key === "a" ||
            event.key === "A" ||
            event.key === "ArrowLeft"
        ) {

            player.movingLeft =
                false;

        }


        if (
            event.key === "d" ||
            event.key === "D" ||
            event.key === "ArrowRight"
        ) {

            player.movingRight =
                false;

        }

    }
);


/* ================= MOBILE ================= */

function bindMobile(
    selector,
    property
) {

    const button =
        document.querySelector(
            selector
        );


    if (!button)
        return;


    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            player[property] =
                true;

        }
    );


    button.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            player[property] =
                false;

        }
    );


    button.addEventListener(
        "pointercancel",
        () => {

            player[property] =
                false;

        }
    );


    button.addEventListener(
        "pointerleave",
        () => {

            player[property] =
                false;

        }
    );

}


/* ================= BUTTONS ================= */

function setupButtons() {

    document
        .getElementById(
            "launchButton"
        )
        .onclick =
        startGame;


    document
        .getElementById(
            "hangarButton"
        )
        .onclick =
        openHangar;


    document
        .getElementById(
            "profileButton"
        )
        .onclick =
        openProfile;


    document
        .getElementById(
            "aboutButton"
        )
        .onclick =
        openAbout;


    document
        .getElementById(
            "profileBackButton"
        )
        .onclick =
        () =>
            showScreen(
                "startScreen"
            );


    document
        .getElementById(
            "aboutBackButton"
        )
        .onclick =
        () =>
            showScreen(
                "startScreen"
            );


    document
        .getElementById(
            "saveNameButton"
        )
        .onclick =
        savePlayerName;


    document
        .getElementById(
            "backButton"
        )
        .onclick =
        () =>
            showScreen(
                "startScreen"
            );


    document
        .getElementById(
            "pauseButton"
        )
        .onclick =
        togglePause;


    document
        .getElementById(
            "resumeButton"
        )
        .onclick =
        togglePause;


    document
        .getElementById(
            "pauseMenuButton"
        )
        .onclick =
        returnToMenu;


    document
        .getElementById(
            "relaunchButton"
        )
        .onclick =
        startGame;


    document
        .getElementById(
            "gameOverMenuButton"
        )
        .onclick =
        returnToMenu;


    document
        .querySelectorAll(
            ".skin-button"
        )
        .forEach(button => {

            button.onclick =
                () => {

                    selectSkin(
                        button.dataset.skin
                    );

                };

        });


    document
        .getElementById(
            "mobilePulse"
        )
        .addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                usePulse();

            }
        );

}


/* ================= GAME LOOP ================= */

function gameLoop(time) {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }


    const dt =
        Math.min(

            (
                time -
                lastTime
            ) / 1000,

            0.033

        );


    lastTime =
        time;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawBackground();


    updateStars(dt);

    updatePlayer(dt);

    updateSpawn(dt);

    updateEnemies(dt);

    updatePulses(dt);

    updateParticles(dt);


    /*
        ONLY enemy-player contact
        causes hull damage.
    */

    checkEnemyCollision();


    drawPulses();

    drawEnemies();

    drawParticles();

    drawPlayer();


    requestAnimationFrame(
        gameLoop
    );

}


/* ================= INITIALIZE ================= */

resizeCanvas();

setupButtons();


bindMobile(
    ".mobile-up",
    "movingUp"
);

bindMobile(
    ".mobile-down",
    "movingDown"
);

bindMobile(
    ".mobile-left",
    "movingLeft"
);

bindMobile(
    ".mobile-right",
    "movingRight"
);


applySkin();

applyShipStats();

updateMenuData();

updateHangar();

updateHUD();


showScreen(
    "startScreen"
);


console.log(
    "SPACE FIGHT SHOOTER READY 🚀"
);