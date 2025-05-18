import { BuildingSettings, DefaultSettings, ElevatorConfig, BuildingConfig } from '../types/BuildingSettings';

/**
 * Singleton class that manages global settings for the elevator system
 * Handles configuration updates and propagates changes to all components
 */
export class SettingsManager {
    private static instance: SettingsManager;
    private settings: BuildingSettings;
    private listeners: ((settings: BuildingSettings) => void)[] = [];

    private constructor() {
        // Initialize with default settings and populate building configs
        this.settings = this.initializeSettings(DefaultSettings);
    }

    /**
     * Creates initial settings by cloning defaults and populating building configs
     * Each building gets its own copy of default settings that can be customized
     */
    private initializeSettings(defaultSettings: BuildingSettings): BuildingSettings {
        const settings = { ...defaultSettings };

        // Create initial building configs based on defaults
        settings.buildingConfigs = Array(settings.numberOfBuildings)
            .fill(null)
            .map(() => ({
                ...settings.defaultBuildingConfig,
                elevatorConfigs: Array(settings.defaultBuildingConfig.numberOfElevators)
                    .fill(null)
                    .map(() => ({ ...settings.defaultElevatorConfig }))
            }));

        return settings;
    }

    // Singleton pattern implementation
    static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    // Returns a deep copy of current settings to prevent direct mutation
    getSettings(): BuildingSettings {
        return { ...this.settings };
    }

    /**
     * Updates global default settings and optionally propagates changes
     * @param newDefaults - Partial settings to update
     * @param forceOverride - If true, overrides all individual settings with new defaults
     */
    updateGlobalDefaults(newDefaults: Partial<BuildingSettings>, forceOverride: boolean = false) {
        const updatedSettings = { ...this.settings };
        const defaultElevatorConfig = newDefaults.defaultElevatorConfig;
        const defaultBuildingConfig = newDefaults.defaultBuildingConfig;

        // Update elevator defaults if provided
        if (defaultElevatorConfig) {
            updatedSettings.defaultElevatorConfig = {
                ...updatedSettings.defaultElevatorConfig,
                ...defaultElevatorConfig
            };

            // Update all individual elevator configs based on force override setting
            updatedSettings.buildingConfigs = updatedSettings.buildingConfigs.map(building => ({
                ...building,
                elevatorConfigs: building.elevatorConfigs.map(elevator => {
                    if (forceOverride) {
                        return { ...updatedSettings.defaultElevatorConfig };
                    }

                    const updatedConfig = { ...elevator };
                    // Check each property individually
                    if (defaultElevatorConfig.stopDelay !== undefined &&
                        elevator.stopDelay === this.settings.defaultElevatorConfig.stopDelay) {
                        updatedConfig.stopDelay = defaultElevatorConfig.stopDelay;
                    }
                    if (defaultElevatorConfig.floorPassingTime !== undefined &&
                        elevator.floorPassingTime === this.settings.defaultElevatorConfig.floorPassingTime) {
                        updatedConfig.floorPassingTime = defaultElevatorConfig.floorPassingTime;
                    }
                    return updatedConfig;
                })
            }));
        }

        // Update building defaults if provided
        if (defaultBuildingConfig) {
            updatedSettings.defaultBuildingConfig = {
                ...updatedSettings.defaultBuildingConfig,
                ...defaultBuildingConfig
            };

            // Update all building configs based on force override setting
            updatedSettings.buildingConfigs = updatedSettings.buildingConfigs.map(building => {
                if (forceOverride) {
                    return {
                        ...updatedSettings.defaultBuildingConfig,
                        elevatorConfigs: building.elevatorConfigs.map(elevator => ({
                            ...updatedSettings.defaultElevatorConfig
                        }))
                    };
                }

                const updatedBuilding = { ...building };
                // Check each property individually
                if (defaultBuildingConfig.factoryType !== undefined &&
                    building.factoryType === this.settings.defaultBuildingConfig.factoryType) {
                    updatedBuilding.factoryType = defaultBuildingConfig.factoryType;
                }
                if (defaultBuildingConfig.numberOfFloors !== undefined &&
                    building.numberOfFloors === this.settings.defaultBuildingConfig.numberOfFloors) {
                    updatedBuilding.numberOfFloors = defaultBuildingConfig.numberOfFloors;
                }
                if (defaultBuildingConfig.floorHeight !== undefined &&
                    building.floorHeight === this.settings.defaultBuildingConfig.floorHeight) {
                    updatedBuilding.floorHeight = defaultBuildingConfig.floorHeight;
                }
                if (defaultBuildingConfig.numberOfElevators !== undefined &&
                    building.numberOfElevators === this.settings.defaultBuildingConfig.numberOfElevators) {
                    updatedBuilding.numberOfElevators = defaultBuildingConfig.numberOfElevators;
                }
                return updatedBuilding;
            });
        }

        // Handle changes to number of buildings
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

    /**
     * Updates configuration for a specific building
     * Handles elevator count changes by adding/removing elevator configs
     */
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

    /**
     * Updates configuration for a specific elevator in a building
     */
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

    /**
     * Adds a listener to be notified of settings changes
     */
    addListener(listener: (settings: BuildingSettings) => void) {
        this.listeners.push(listener);
    }

    /**
     * Notifies all registered listeners of settings changes
     */
    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.getSettings()));
    }
}