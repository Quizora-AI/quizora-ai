// index.js
import { AppRegistry } from 'react-native';
import App from './App'; // Notice: No /src folder. App.js is in root.
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
