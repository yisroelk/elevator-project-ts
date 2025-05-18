import { BuildingSettings, DefaultSettings, ElevatorConfig, BuildingConfig } from '../types/BuildingSettings';

export class SettingsManager {
    private static instance: SettingsManager;
    private settings: BuildingSettings;
    private listeners: ((settings: BuildingSettings) => void)[] = [];

    private constructor() {
        // Initialize with default settings and populate building configs
        this.settings = this.initializeSettings(DefaultSettings);
    }

    private initializeSettings(defaultSettings: BuildingSettings): BuildingSettings {
        const settings = { ...defaultSettings };

        // Create initial building configs based on defaults
        settings.buildingConfigs = Array(settings.numberOfBuildings).fill(null).map(() => ({
            ...settings.defaultBuildingConfig,
            elevatorConfigs: Array(settings.defaultBuildingConfig.numberOfElevators)
                .fill(null)
                .map(() => ({ ...settings.defaultElevatorConfig }))
        }));

        return settings;
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

    updateGlobalDefaults(newDefaults: Partial<BuildingSettings>, forceOverride: boolean = false) {
        const updatedSettings = { ...this.settings };

        // Update default elevator config if provided
        if (newDefaults.defaultElevatorConfig) {
            updatedSettings.defaultElevatorConfig = {
                ...updatedSettings.defaultElevatorConfig,
                ...newDefaults.defaultElevatorConfig
            };

            // Update all elevators with new defaults
            updatedSettings.buildingConfigs = updatedSettings.buildingConfigs.map(building => ({
                ...building,
                elevatorConfigs: building.elevatorConfigs.map(elevator => {
                    if (forceOverride) {
                        // Force override - apply new defaults regardless of current values
                        return { ...elevator, ...newDefaults.defaultElevatorConfig };
                    } else {
                        // Only update if matches old defaults
                        const matchesOldDefaults =
                            elevator.stopDelay === this.settings.defaultElevatorConfig.stopDelay &&
                            elevator.floorPassingTime === this.settings.defaultElevatorConfig.floorPassingTime;
                        return matchesOldDefaults ? { ...elevator, ...newDefaults.defaultElevatorConfig } : elevator;
                    }
                })
            }));
        }

        // Update default building config if provided
        if (newDefaults.defaultBuildingConfig) {
            updatedSettings.defaultBuildingConfig = {
                ...updatedSettings.defaultBuildingConfig,
                ...newDefaults.defaultBuildingConfig
            };

            // Update all buildings with new defaults
            updatedSettings.buildingConfigs = updatedSettings.buildingConfigs.map(building => {
                if (forceOverride) {
                    // Force override - apply new defaults regardless of current values
                    return {
                        ...building,
                        ...newDefaults.defaultBuildingConfig,
                        elevatorConfigs: building.elevatorConfigs // Preserve elevator configs
                    };
                } else {
                    // Only update if matches old defaults
                    const matchesOldDefaults =
                        building.factoryType === this.settings.defaultBuildingConfig.factoryType &&
                        building.numberOfFloors === this.settings.defaultBuildingConfig.numberOfFloors &&
                        building.numberOfElevators === this.settings.defaultBuildingConfig.numberOfElevators &&
                        building.floorHeight === this.settings.defaultBuildingConfig.floorHeight;
                    return matchesOldDefaults ? {
                        ...building,
                        ...newDefaults.defaultBuildingConfig,
                        elevatorConfigs: building.elevatorConfigs
                    } : building;
                }
            });
        }

        // Update number of buildings if changed
        if (newDefaults.numberOfBuildings !== undefined &&
            newDefaults.numberOfBuildings !== this.settings.numberOfBuildings) {

            if (newDefaults.numberOfBuildings > this.settings.numberOfBuildings) {
                // Add new buildings with current defaults
                const newBuildings = Array(newDefaults.numberOfBuildings - this.settings.numberOfBuildings)
                    .fill(null)
                    .map(() => ({
                        ...updatedSettings.defaultBuildingConfig,
                        elevatorConfigs: Array(updatedSettings.defaultBuildingConfig.numberOfElevators)
                            .fill(null)
                            .map(() => ({ ...updatedSettings.defaultElevatorConfig }))
                    }));
                updatedSettings.buildingConfigs = [...updatedSettings.buildingConfigs, ...newBuildings];
            } else {
                // Remove excess buildings
                updatedSettings.buildingConfigs = updatedSettings.buildingConfigs
                    .slice(0, newDefaults.numberOfBuildings);
            }
            updatedSettings.numberOfBuildings = newDefaults.numberOfBuildings;
        }

        this.settings = updatedSettings;
        this.notifyListeners();
    }

    updateBuildingConfig(buildingIndex: number, config: Partial<BuildingConfig>) {
        if (buildingIndex >= this.settings.numberOfBuildings) return;

        const updatedSettings = { ...this.settings };
        const currentConfig = updatedSettings.buildingConfigs[buildingIndex];

        // Handle changes in number of elevators
        if (config.numberOfElevators !== undefined &&
            config.numberOfElevators !== currentConfig.numberOfElevators) {

            if (config.numberOfElevators > currentConfig.numberOfElevators) {
                // Add new elevators with current defaults
                const newElevators = Array(config.numberOfElevators - currentConfig.numberOfElevators)
                    .fill(null)
                    .map(() => ({ ...updatedSettings.defaultElevatorConfig }));
                config.elevatorConfigs = [...(currentConfig.elevatorConfigs || []), ...newElevators];
            } else {
                // Remove excess elevators
                config.elevatorConfigs = currentConfig.elevatorConfigs
                    .slice(0, config.numberOfElevators);
            }
        }

        updatedSettings.buildingConfigs[buildingIndex] = {
            ...currentConfig,
            ...config
        };

        this.settings = updatedSettings;
        this.notifyListeners();
    }

    updateElevatorConfig(buildingIndex: number, elevatorIndex: number, config: Partial<ElevatorConfig>) {
        if (buildingIndex >= this.settings.numberOfBuildings ||
            elevatorIndex >= this.settings.buildingConfigs[buildingIndex].numberOfElevators) return;

        const updatedSettings = { ...this.settings };
        const currentConfig = updatedSettings.buildingConfigs[buildingIndex].elevatorConfigs[elevatorIndex];

        updatedSettings.buildingConfigs[buildingIndex].elevatorConfigs[elevatorIndex] = {
            ...currentConfig,
            ...config
        };

        this.settings = updatedSettings;
        this.notifyListeners();
    }

    addListener(listener: (settings: BuildingSettings) => void) {
        this.listeners.push(listener);
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.getSettings()));
    }
}