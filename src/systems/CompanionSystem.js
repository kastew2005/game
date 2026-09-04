export class CompanionSystem {
    constructor(toastManager) {
        this.toastManager = toastManager;
        this.companions = [];
        this.activeCompanion = null;
        this.companionTypes = {
            medic: {
                name: '👨‍⚕️ Медик',
                description: 'Лечит раны',
                health: 50,
                ability: 'heal',
                cooldown: 300,
                cost: { gold: 5, herbs: 3 }
            },
            guard: {
                name: '🛡️ Страж',
                description: 'Защищает от врагов',
                health: 80,
                ability: 'protect',
                cooldown: 200,
                cost: { scrap: 8, wood: 5 }
            },
            scout: {
                name: '🔭 Разведчик',
                description: 'Находит ресурсы',
                health: 40,
                ability: 'scout',
                cooldown: 400,
                cost: { wood: 6, food: 3 }
            },
            merchant: {
                name: '💼 Торговец',
                description: 'Улучшает торговлю',
                health: 30,
                ability: 'trade',
                cooldown: 500,
                cost: { gold: 8, scrap: 4 }
            }
        };
        this.companionCooldowns = {};
    }

    hireCompanion(type, player, inventory) {
        const companionType = this.companionTypes[type];
        if (!companionType) return false;

        // Проверка ресурсов
        for (let [resource, count] of Object.entries(companionType.cost)) {
            if (inventory.getItemCount(resource) < count) {
                if (this.toastManager) {
                    this.toastManager.show(`⚠️ Не хватает ${resource}!`, 'error', 1500);
                }
                return false;
            }
        }

        // Снятие ресурсов
        for (let [resource, count] of Object.entries(companionType.cost)) {
            inventory.removeItem(resource, count);
        }

        const companion = {
            type: type,
            name: companionType.name,
            health: companionType.health,
            maxHealth: companionType.health,
            ability: companionType.ability,
            cooldown: 0,
            maxCooldown: companionType.cooldown,
            level: 1,
            experience: 0
        };

        this.companions.push(companion);
        if (!this.activeCompanion) {
            this.activeCompanion = companion;
        }

        if (this.toastManager) {
            this.toastManager.show(`🤝 ${companionType.name} присоединился!`, 'success', 2000);
        }
        return true;
    }

    update(tick, player) {
        for (let companion of this.companions) {
            if (companion.cooldown > 0) {
                companion.cooldown--;
            }
        }

        // Использование способности активного компаньона
        if (this.activeCompanion && this.activeCompanion.cooldown === 0) {
            this.useAbility(this.activeCompanion, player);
            this.activeCompanion.cooldown = this.activeCompanion.maxCooldown;
        }
    }

    useAbility(companion, player) {
        switch(companion.ability) {
            case 'heal':
                player.heal(15 + companion.level * 2);
                if (this.toastManager) {
                    this.toastManager.show(`💚 ${companion.name} исцелил вас!`, 'success', 1500);
                }
                break;
            case 'protect':
                player.addShield(30 + companion.level * 3, 200);
                if (this.toastManager) {
                    this.toastManager.show(`🛡️ ${companion.name} защитил вас!`, 'success', 1500);
                }
                break;
            case 'scout':
                const resources = ['wood', 'stone', 'scrap', 'food', 'water'];
                const resource = resources[Math.floor(Math.random() * resources.length)];
                const amount = 2 + Math.floor(Math.random() * 3) + companion.level;
                const inventory = window.inventory;
                if (inventory) {
                    inventory.addItem(resource, amount);
                }
                if (this.toastManager) {
                    this.toastManager.show(`🔍 ${companion.name} нашёл ${amount} ${resource}!`, 'info', 1500);
                }
                break;
            case 'trade':
                const gold = 2 + companion.level;
                const inventory2 = window.inventory;
                if (inventory2) {
                    inventory2.addItem('gold', gold);
                }
                if (this.toastManager) {
                    this.toastManager.show(`💰 ${companion.name} заработал ${gold} золота!`, 'info', 1500);
                }
                break;
        }
    }

    getCompanions() {
        return this.companions;
    }

    getActiveCompanion() {
        return this.activeCompanion;
    }

    setActiveCompanion(index) {
        if (index >= 0 && index < this.companions.length) {
            this.activeCompanion = this.companions[index];
            if (this.toastManager) {
                this.toastManager.show(`👤 Активен: ${this.activeCompanion.name}`, 'info', 1000);
            }
            return true;
        }
        return false;
    }

    getCompanionTypes() {
        return this.companionTypes;
    }
}
