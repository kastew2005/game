import { Game } from './core/Game.js';
import { Renderer } from './core/Renderer.js';
import { InputManager } from './core/InputManager.js';
import { SoundManager } from './core/SoundManager.js';
import { World } from './world/World.js';
import { Player } from './entities/Player.js';
import { ZombieManager } from './entities/ZombieManager.js';
import { Inventory } from './ui/Inventory.js';
import { UIManager } from './ui/UIManager.js';
import { ToastManager } from './ui/ToastManager.js';
import { QuestSystem } from './systems/QuestSystem.js';
import { BuildingSystem } from './systems/BuildingSystem.js';
import { PetSystem } from './systems/PetSystem.js';
import { DayNightSystem } from './systems/DayNightSystem.js';
import { TradeSystem } from './systems/TradeSystem.js';
import { FishingSystem } from './systems/FishingSystem.js';
import { CraftingSystem } from './systems/CraftingSystem.js';
import { EventSystem } from './systems/EventSystem.js';
import { MiniGameSystem } from './systems/MiniGameSystem.js';
import { MapSystem } from './systems/MapSystem.js';
import { ReputationSystem } from './systems/ReputationSystem.js';
import { SkillSystem } from './systems/SkillSystem.js';
import { DungeonSystem } from './systems/DungeonSystem.js';
import { VehicleSystem } from './systems/VehicleSystem.js';
import { CompanionSystem } from './systems/CompanionSystem.js';
import { BaseSystem } from './systems/BaseSystem.js';
import { WeatherSystem } from './systems/WeatherSystem.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progressFill');
const tipText = document.getElementById('tipText');

// Советы для загрузки
const tips = [
    '💡 Исследуйте мир, чтобы найти ценные ресурсы',
    '💡 Стройте убежище для защиты от зомби',
    '💡 Торгуйте с NPC для получения редких предметов',
    '💡 Развивайте навыки для выживания',
    '💡 Исследуйте подземелья для легендарных предметов',
    '💡 Приручайте животных для помощи в бою',
    '💡 Участвуйте в мини-играх для дополнительных наград',
    '💡 Следите за репутацией для получения бонусов',
    '💡 Собирайте ресурсы для крафта и строительства',
    '💡 Создайте базу для безопасного хранения ресурсов'
];

// Инициализация менеджеров
const soundManager = new SoundManager();
const toastManager = new ToastManager(document.getElementById('game-wrapper'));
const dayNightSystem = new DayNightSystem();
const questSystem = new QuestSystem(toastManager);
const buildingSystem = new BuildingSystem();
const petSystem = new PetSystem();
const weatherSystem = new WeatherSystem();

// Инициализация компонентов
const renderer = new Renderer(ctx);
const inputManager = new InputManager(canvas);
const world = new World(6000);
const player = new Player(3000, 3000);
const zombieManager = new ZombieManager(world);
const inventory = new Inventory();
const uiManager = new UIManager(ctx, soundManager, toastManager);

// Новые системы
const tradeSystem = new TradeSystem(inventory, toastManager);
const fishingSystem = new FishingSystem(toastManager);
const craftingSystem = new CraftingSystem(inventory, toastManager);
const eventSystem = new EventSystem(toastManager, soundManager);
const miniGameSystem = new MiniGameSystem(toastManager, soundManager);
const mapSystem = new MapSystem(world);
const reputationSystem = new ReputationSystem(toastManager);
const skillSystem = new SkillSystem(toastManager);
const dungeonSystem = new DungeonSystem(toastManager, soundManager);
const vehicleSystem = new VehicleSystem(toastManager);
const companionSystem = new CompanionSystem(toastManager);
const baseSystem = new BaseSystem(toastManager);

// Связывание систем
const game = new Game({
    ctx,
    renderer,
    inputManager,
    soundManager,
    toastManager,
    world,
    player,
    zombieManager,
    inventory,
    uiManager,
    dayNightSystem,
    questSystem,
    buildingSystem,
    petSystem,
    tradeSystem,
    fishingSystem,
    craftingSystem,
    eventSystem,
    miniGameSystem,
    mapSystem,
    reputationSystem,
    skillSystem,
    dungeonSystem,
    vehicleSystem,
    companionSystem,
    baseSystem,
    weatherSystem
});

// Загрузка
let progress = 0;
let tipIndex = 0;
let loaded = false;

const tipInterval = setInterval(() => {
    tipIndex = (tipIndex + 1) % tips.length;
    tipText.textContent = tips[tipIndex];
}, 3000);

const loadingInterval = setInterval(() => {
    if (loaded) return;
    progress += Math.random() * 2 + 1;
    if (progress >= 100) {
        progress = 100;
        loaded = true;
        clearInterval(loadingInterval);
        clearInterval(tipInterval);
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            game.start();
        }, 500);
    }
    progressFill.style.width = progress + '%';
    document.querySelector('.loading-text').textContent = `Загрузка ${Math.floor(progress)}%`;
}, 50);

// Экспорт для отладки
window.game = game;
window.player = player;
window.inventory = inventory;
window.world = world;
window.zombieManager = zombieManager;
window.uiManager = uiManager;
window.soundManager = soundManager;
window.toastManager = toastManager;
window.questSystem = questSystem;
window.buildingSystem = buildingSystem;
window.petSystem = petSystem;
window.tradeSystem = tradeSystem;
window.fishingSystem = fishingSystem;
window.craftingSystem = craftingSystem;
window.eventSystem = eventSystem;
window.miniGameSystem = miniGameSystem;
window.mapSystem = mapSystem;
window.reputationSystem = reputationSystem;
window.skillSystem = skillSystem;
window.dungeonSystem = dungeonSystem;
window.vehicleSystem = vehicleSystem;
window.companionSystem = companionSystem;
window.baseSystem = baseSystem;
window.weatherSystem = weatherSystem;