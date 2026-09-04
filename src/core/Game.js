export class Game {
    constructor(components) {
        this.components = components;
        this.state = 'loading';
        this.tick = 0;
        this.isRunning = false;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.paused = false;
        this._traderNotified = false;
        this._dungeonNotified = false;
    }

    start() {
        this.isRunning = true;
        this.state = 'playing';
        this.lastTime = performance.now();
        this.gameLoop(performance.now());
    }

    gameLoop(timestamp) {
        if (!this.isRunning) {
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        if (!this.paused) {
            this.deltaTime = (timestamp - this.lastTime) / 16.67;
            this.lastTime = timestamp;

            this.frameCount++;
            if (timestamp - this.lastFpsUpdate > 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFpsUpdate = timestamp;
            }

            this.update();
        }
        
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update() {
        if (this.state !== 'playing') return;
        
        this.tick++;
        const { 
            player, zombieManager, world, inventory, soundManager, toastManager,
            dayNightSystem, questSystem, buildingSystem, petSystem,
            tradeSystem, fishingSystem, craftingSystem, eventSystem,
            miniGameSystem, mapSystem, reputationSystem, skillSystem,
            dungeonSystem, vehicleSystem, companionSystem, baseSystem, weatherSystem
        } = this.components;

        // Обновление всех систем
        if (dayNightSystem) dayNightSystem.update(this.tick);
        if (tradeSystem) tradeSystem.update(this.tick);
        if (fishingSystem) fishingSystem.update(this.tick, player);
        if (craftingSystem) craftingSystem.update(this.tick);
        if (eventSystem) eventSystem.update(this.tick);
        if (miniGameSystem) miniGameSystem.update(this.tick);
        if (mapSystem) mapSystem.update(player);
        if (reputationSystem) reputationSystem.update();
        if (skillSystem) skillSystem.applySkillBonuses(player);
        if (weatherSystem) weatherSystem.update(this.tick);
        
        if (!dungeonSystem || !dungeonSystem.isInDungeon()) {
            if (player) player.update(this.tick);
            if (zombieManager) {
                const damage = zombieManager.update(player, this.tick, soundManager);
                if (damage && player && player.health <= 0) {
                    if (soundManager) soundManager.play('death');
                    if (toastManager) toastManager.show('💀 Вы погибли!', 'error');
                    this.state = 'gameover';
                    setTimeout(() => this.restart(), 2000);
                }
            }
        }

        if (world) world.update(this.tick);
        if (buildingSystem) buildingSystem.update(this.tick, player, zombieManager);
        if (petSystem) petSystem.update(this.tick, player, zombieManager);
        if (questSystem) questSystem.update(player, zombieManager);
        if (companionSystem) companionSystem.update(this.tick, player);
        if (baseSystem) baseSystem.update(this.tick);

        // Проверка взаимодействий
        this.checkTraderInteraction(player);
        this.checkFishingInteraction(player);
        this.checkDungeonInteraction(player);

        this.checkCollisions();
    }

    checkTraderInteraction(player) {
        const { tradeSystem, toastManager } = this.components;
        if (!tradeSystem || !toastManager || !player) return;
        
        const traders = tradeSystem.getTraders();
        if (!traders) return;
        
        for (let trader of traders) {
            const dist = Math.hypot(player.x - trader.x, player.y - trader.y);
            if (dist < trader.radius + player.radius + 20) {
                tradeSystem.setActiveTrader(trader.id);
                if (!this._traderNotified) {
                    toastManager.show(`💰 Нажмите для торговли с ${trader.name}`, 'info', 2000);
                    this._traderNotified = true;
                }
                return;
            }
        }
        this._traderNotified = false;
    }

    checkFishingInteraction(player) {
        const { fishingSystem, toastManager } = this.components;
        if (!fishingSystem || !toastManager || !player) return;
        
        const status = fishingSystem.getFishingStatus();
        if (status && status.isFishing) {
            if (this.tick % 30 === 0) {
                const progress = Math.floor(status.progress * 100);
                if (progress % 20 === 0) {
                    toastManager.show(`🎣 Рыбалка: ${progress}%`, 'info', 500);
                }
            }
        }
    }

    checkDungeonInteraction(player) {
        const { dungeonSystem, toastManager } = this.components;
        if (!dungeonSystem || !toastManager || !player) return;
        
        const dungeonTypes = dungeonSystem.getDungeonTypes();
        if (!dungeonTypes) return;
        
        for (let dungeon of dungeonTypes) {
            const dist = Math.hypot(player.x - 500 * dungeon.difficulty, 
                                  player.y - 500 * dungeon.difficulty);
            if (dist < 80) {
                if (!this._dungeonNotified) {
                    toastManager.show(`🏛️ Вход в ${dungeon.name} (нажмите для входа)`, 'special', 2000);
                    this._dungeonNotified = true;
                }
                return;
            }
        }
        this._dungeonNotified = false;
    }

    checkCollisions() {
        const { player, zombieManager, inventory, soundManager } = this.components;
        if (!player || !zombieManager || !inventory) return;
        
        const lootItems = zombieManager.getLootItems();
        if (!lootItems) return;
        
        let collected = 0;
        for (let i = lootItems.length - 1; i >= 0; i--) {
            const item = lootItems[i];
            if (Math.hypot(item.x - player.x, item.y - player.y) < 60) {
                inventory.addItem(item.type, 1);
                lootItems.splice(i, 1);
                collected++;
            }
        }
        
        if (collected > 0 && soundManager) {
            soundManager.play('loot');
        }
    }

    render() {
        const { renderer, player, zombieManager, world, uiManager, inputManager, 
                dungeonSystem, tradeSystem } = this.components;
        
        if (!renderer) return;
        renderer.clear();
        
        if (this.state === 'loading') {
            // Загрузка обрабатывается через HTML
        } else if (this.state === 'menu') {
            renderer.drawMainMenu();
        } else {
            if (player && world) {
                renderer.setCamera(player.x - renderer.W/2, player.y - renderer.H/2);
                renderer.drawWorld(world, player);
                
                if ((!dungeonSystem || !dungeonSystem.isInDungeon()) && zombieManager) {
                    renderer.drawZombies(zombieManager.getZombies());
                    if (tradeSystem) {
                        renderer.drawTraders(tradeSystem.getTraders());
                    }
                } else if (dungeonSystem) {
                    renderer.drawDungeonEnemies(dungeonSystem.getDungeonEnemies());
                    renderer.drawDungeonInfo(dungeonSystem);
                }
                
                renderer.drawPlayer(player);
                if (zombieManager) {
                    renderer.drawLoot(zombieManager.getLootItems());
                }
                renderer.drawParticles();
                
                if (uiManager) {
                    uiManager.render(player, zombieManager, inputManager);
                }
            }
        }
    }

    restart() {
        const { player, zombieManager, inventory, toastManager, questSystem } = this.components;
        if (player) player.reset();
        if (zombieManager) zombieManager.reset();
        if (inventory) inventory.reset();
        if (questSystem) questSystem.reset();
        this.state = 'playing';
        if (toastManager) toastManager.show('🔄 Игра перезапущена', 'success');
    }

    togglePause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.lastTime = performance.now();
        }
    }
}
