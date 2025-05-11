export const CSS_CLASSES = {
    CONTAINER: 'container',
    BUILDING: 'building',
    FLOOR: 'floor',
    ELEVATOR: 'elevator',
    BUTTON: 'floor-button',
    PRESSED: 'pressed',
    SETTINGS_PANEL: 'settings-panel',
    VISIBLE: 'visible'
};

export const STYLES = `
    .container {
        display: flex;
        gap: 40px;
        position: relative;
        flex-wrap: wrap;
        justify-content: center;
        padding: 20px;
    }
    
    .building-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px;
    }

    .building-title {
        text-align: center;
        padding: 5px;
        margin-bottom: 10px;
        font-size: 1.5em;
        font-weight: bold;
    }
    
    .building {
        position: relative;
        border: 2px solid #333;
        min-width: 300px;
        flex: 0 1 auto;
    }

    .building-wrapper {
        display: flex;
        gap: 20px;
        align-items: flex-end;
    }

    .floor {
        height: 100px;
        border-bottom: 1px solid #ccc;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
    }
    
    .elevator-container {
        display: flex;
        gap: 10px;
        height: 100%;
        position: relative;
        min-width: 200px;
    }

    .elevator {
        position: absolute;
        width: 60px;
        height: 90px;
        background-image: url('/assets/elv.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: transform 1s linear;
        bottom: 0;
    }

    .elevator-count {
        margin-left: 8px;
        font-size: 14px;
        color: #666;
    }
    
    .floor-button {
        padding: 5px 15px;
        background-color: #4CAF50;
        color: white;
        border: none;
        cursor: pointer;
    }
    
    .floor-button.pressed {
        background-color: #ff0000;
    }
    
    .floor-number {
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .countdown {
        font-size: 14px;
        color: #666;
        min-width: 80px;
    }

    .settings-panel {
        padding: 20px;
        background: #f5f5f5;
        border-radius: 5px;
        min-width: 300px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        display: none;
    }

    .settings-panel.visible {
        display: block;
    }

    .settings-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        z-index: 999;
    }

    .settings-toggle:hover {
        background-color: #45a049;
    }

    .settings-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: none;
        z-index: 999;
    }

    .settings-overlay.visible {
        display: block;
    }

    .settings-group {
        margin-bottom: 15px;
    }

    .settings-group label {
        display: block;
        margin-bottom: 5px;
    }

    .settings-group input {
        width: 100%;
        padding: 5px;
        margin-bottom: 10px;
    }

    .apply-button {
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .apply-button:hover {
        background-color: #45a049;
    }
`;