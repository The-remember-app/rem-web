

// import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
// import App from './app/app';

// import {AppContainer, WebWorkerBridge} from '@rem-user-service/navigation';

// Создаем инстанс Worker (Vite умеет собирать воркеры через ?bridge)
// import SyncWorker from './bridge/sync.bridge?bridge';
import {App} from "./app/app";

// const workerInstance = new SyncWorker();
// const workerBridge = new WebWorkerBridge(workerInstance);

// Передаем bridge в DI контейнер (как обсуждали в предыдущем шаге)
// const appContainer = new AppContainer(userRepository, workerBridge, navigationService);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(

        <App />
);
// root.render(
//     <StrictMode>
//     <App />
//     </StrictMode>
// );