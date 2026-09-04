export class BaseSystem {
    constructor(toastManager) {
        this.toastManager = toastManager;
        this.baseLevel = 0;
        this.baseUpgrades = [];
        this.baseStorage = {};
        this.baseDefense = 0;
        this.baseHealth = 100;
        this.maxBaseHealth = 100;
        this.baseWorkers = 0;
        this.baseProduction = {
            wood: 0,
            stone: 0,
            food: 0,
            water: 0
        };
        this.upgradeCosts = {
            level1: { wood: 20, stone: 15 },
            level2: { wood: 40, stone: 30, scrap: 10 },
            level3: { wood: 80, stone: 60, scrap: 20, gold: 5 },
            level4: { wood: 150, stone: 120, scrap: 40, gold: 15 },
            level5: { wood: 300, stone: 250, scrap: 80, gold: 30 }
        };
        this.upgradeBonuses = {
            level1: { storage: 50, defense: 5 },
            level2: { storage: 100, defense: 10, workers: 1 },
            level3: { storage: 200, defense: 20, workers: 2 },
            level4: { storage: 400, defense: 35, workers: 3 },
            level5: { storage: 800, defense: 50, workers: 5 }
        };
    }

    update(tick) {
        // Производство ресурсов
        if (tick % 60 === 0 && this.baseLevel > 0) {
            const bonus = this.upgradeBonuses[`level${this.baseLevel}`];
            if (bonus) {
                const workers = bonus.workers || 0;
                const production = 1 + workers;
                
                const inventory = window.inventory;
                if (inventory) {
                    inventory.addItem('wood', production * 0.5);
                    inventory.addItem('stone', production * 0.3);
                    if (tick % 120 === 0) {
                        inventory.addItem('food', production * 0.4);
                    }
                }
            }
        }

        // Восстановление базы
        if (this.baseHealth < this.maxBaseHealth && tick % 30 === 0) {
            this.baseHealth = Math.min(this.maxBaseHealth, this.baseHealth + 1);
        }
    }

    upgradeBase(inventory) {
        const nextLevel = this.baseLevel + 1;
        const costKey = `level${nextLevel}`;
        const cost = this.upgradeCosts[costKey];
        
        if (!cost) {
            if (this.toastManager) {
                this.toastManager.show('⚠️ Достигнут максимальный уровень!', 'warning', 1500);
            }
            return false;
        }

        // Проверка ресурсов
        for (let [resource, count] of Object.entries(cost)) {
            if (inventory.getItemCount(resource) < count) {
                if (this.toastManager) {
                    this.toastManager.show(`⚠️ Не хватает ${resource}!`, 'error', 1500);
                }
                return false;
            }
        }

        // Снятие ресурсов
        for (let [resource, count] of Object.entries(cost)) {
            inventory.removeItem(resource, count);
        }

        this.baseLevel = nextLevel;
        const bonus = this.upgradeBonuses[costKey];
        
        this.maxBaseHealth += 50;
        this.baseHealth = this.maxBaseHealth;
        this.baseDefense += bonus.defense || 0;
        this.baseWorkers += bonus.workers || 0;
        
        // Увеличение хранилища
        if (bonus.storage) {
            inventory.maxWeight = (inventory.maxWeight || 150) + bonus.storage;
        }

        if (this.toastManager) {
            this.toastManager.show(`🏰 База улучшена до ${nextLevel} уровня!`, 'special', 2000);
        }
        return true;
    }

    getBaseInfo() {
        return {
            level: this.baseLevel,
            health: this.baseHealth,
            maxHealth: this.maxBaseHealth,
            defense: this.baseDefense,
            workers: this.baseWorkers,
            production: this.baseProduction
        };
    }

    getUpgradeCost(level) {
        return this.upgradeCosts[`level${level}`] || null;
    }

    getUpgradeBonus(level) {
        return this.upgradeBonuses[`level${level}`] || null;
    }

    getNextLevelCost() {
        const nextLevel = this.baseLevel + 1;
        return this.getUpgradeCost(nextLevel);
    }
}
