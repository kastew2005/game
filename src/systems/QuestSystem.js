export class QuestSystem {
    constructor(toastManager) {
        this.toastManager = toastManager;
        this.quests = [
            {
                id: 'kill_5_zombies',
                name: '⚔️ Истребление',
                description: 'Убейте 5 зомби',
                type: 'kill',
                target: 5,
                progress: 0,
                completed: false,
                reward: { wood: 10, scrap: 5, food: 3 }
            },
            {
                id: 'collect_20_wood',
                name: '🌲 Лесоруб',
                description: 'Соберите 20 древесины',
                type: 'collect',
                target: 20,
                progress: 0,
                completed: false,
                reward: { stone: 10, scrap: 3 }
            },
            {
                id: 'craft_3_items',
                name: '🔧 Мастер',
                description: 'Создайте 3 предмета',
                type: 'craft',
                target: 3,
                progress: 0,
                completed: false,
                reward: { medkit: 2, ammunition: 10 }
            },
            {
                id: 'survive_1000_ticks',
                name: '⏳ Выживание',
                description: 'Продержитесь 1000 ходов',
                type: 'survive',
                target: 1000,
                progress: 0,
                completed: false,
                reward: { food: 10, water: 10, medkit: 3 }
            }
        ];
        this.completedQuests = [];
        this.tickCounter = 0;
    }

    reset() {
        for (let quest of this.quests) {
            quest.progress = 0;
            quest.completed = false;
        }
        this.completedQuests = [];
        this.tickCounter = 0;
    }

    update(player, zombieManager) {
        if (!player) return;
        
        this.tickCounter++;
        const inventory = window.inventory;
        
        for (let quest of this.quests) {
            if (quest.completed) continue;
            
            switch(quest.type) {
                case 'kill':
                    quest.progress = Math.min(quest.target, player.kills || 0);
                    break;
                case 'collect':
                    if (inventory) {
                        const items = inventory.getAllItems();
                        quest.progress = Math.min(quest.target, (items && items.wood) || 0);
                    }
                    break;
                case 'craft':
                    // Прогресс обновляется через craftSystem
                    break;
                case 'survive':
                    quest.progress = Math.min(quest.target, this.tickCounter);
                    break;
            }
            
            if (quest.progress >= quest.target && !quest.completed) {
                quest.completed = true;
                this.completedQuests.push(quest.id);
                this.completeQuest(quest);
            }
        }
    }

    completeQuest(quest) {
        const inventory = window.inventory;
        if (inventory && quest.reward) {
            for (let [type, count] of Object.entries(quest.reward)) {
                inventory.addItem(type, count);
            }
        }
        if (this.toastManager) {
            this.toastManager.show(`✅ Квест выполнен: ${quest.name}! Получена награда!`, 'quest', 3000);
        }
        if (window.soundManager) {
            window.soundManager.play('levelup');
        }
    }

    getActiveQuests() {
        return this.quests.filter(q => !q.completed);
    }

    getCompletedQuests() {
        return this.quests.filter(q => q.completed);
    }

    incrementCraft() {
        for (let quest of this.quests) {
            if (quest.type === 'craft' && !quest.completed) {
                quest.progress = Math.min(quest.target, quest.progress + 1);
                if (quest.progress >= quest.target) {
                    quest.completed = true;
                    this.completedQuests.push(quest.id);
                    this.completeQuest(quest);
                }
            }
        }
    }
}
