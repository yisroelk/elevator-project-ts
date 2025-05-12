import { BuildingSettings, DefaultSettings } from '../types/BuildingSettings';

export class SettingsManager {
    private static instance: SettingsManager;
    private settings: BuildingSettings;
    private listeners: ((settings: BuildingSettings) => void)[] = [];

    private constructor() {
        this.settings = { ...DefaultSettings };
    }

    static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    getSettings(): BuildingSettings {
        return { ...this.settings };
    }

    updateSettings(newSettings: Partial<BuildingSettings>) {
        this.settings = { ...this.settings, ...newSettings };
        this.notifyListeners();
    }

    addListener(listener: (settings: BuildingSettings) => void) {
        this.listeners.push(listener);
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.getSettings()));
    }
}