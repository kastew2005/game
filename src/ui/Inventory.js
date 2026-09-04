export class Inventory {
    constructor() {
        this.items = {
            wood: 30,
            stone: 20,
            scrap: 12,
            food: 10,
            water: 8,
            medkit: 3,
            ammunition: 8,
            gold: 2,
            herbs: 5,
            meat: 4,
            armor: 0,
            shield: 0
        };
        this.maxStack = 99;
        this.maxWeight = 200;
    }

    reset() {
        this.items = {
            wood: 30,
            stone: 20,
            scrap: 12,
            food: 10,
            water: 8,
            medkit: 3,
            ammunition: 8,
            gold: 2,
            herbs: 5,
            meat: 4,
            armor: 0,
            shield: 0
        };
    }

    addItem(type, count) {
        if (this.items.hasOwnProperty(type)) {
            const added = Math.min(this.maxStack - this.items[type], count);
            if (added > 0) {
                this.items[type] += added;
                return true;
            }
        }
        return false;
    }

    removeItem(type, count) {
        if (this.items.hasOwnProperty(type) && this.items[type] >= count) {
            this.items[type] -= count;
            return true;
        }
        return false;
    }

    getItemCount(type) {
        return this.items[type] || 0;
    }

    getAllItems() {
        return this.items;
    }

    useItem(type, player, soundManager, toastManager) {
        if (!player) return false;
        
        switch(type) {
            case 'food':
                if (this.removeItem('food', 1)) {
                    player.hunger = Math.min(100, player.hunger + 25);
                    player.health = Math.min(player.maxHealth, player.health + 10);
                    if (soundManager) soundManager.play('loot');
                    if (toastManager) toastManager.show('🍖 Вы съели еду', 'success', 1500);
                    return true;
                }
                break;
            case 'water':
                if (this.removeItem('water', 1)) {
                    player.thirst = Math.min(100, player.thirst + 25);
                    if (soundManager) soundManager.play('loot');
                    if (toastManager) toastManager.show('💧 Вы выпили воду', 'success', 1500);
                    return true;
                }
                break;
            case 'medkit':
                if (this.removeItem('medkit', 1)) {
                    player.health = Math.min(player.maxHealth, player.health + 50);
                    if (soundManager) soundManager.play('craft');
                    if (toastManager) toastManager.show('💊 Вы использовали аптечку', 'success', 1500);
                    return true;
                }
                break;
            case 'herbs':
                if (this.removeItem('herbs', 1)) {
                    player.health = Math.min(player.maxHealth, player.health + 20);
                    player.poison = Math.max(0, player.poison - 3);
                    if (toastManager) toastManager.show('🌿 Вы использовали травы', 'success', 1500);
                    return true;
                }
                break;
            case 'meat':
                if (this.removeItem('meat', 1)) {
                    player.hunger = Math.min(100, player.hunger + 35);
                    player.health = Math.min(player.maxHealth, player.health + 15);
                    if (toastManager) toastManager.show('🥩 Вы съели мясо', 'success', 1500);
                    return true;
                }
                break;
        }
        return false;
    }
}
