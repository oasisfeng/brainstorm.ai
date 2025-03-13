// src/js/app.js
import { CoreController } from './controllers/index.js';

const app = (() => {
    const coreController = new CoreController();

    const initialize = () => {
        coreController.initialize();
    };

    return {
        initialize
    };
})();

document.addEventListener('DOMContentLoaded', app.initialize);