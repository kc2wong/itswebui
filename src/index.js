import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Language, setLanguage } from './shared/util/lang';

import 'semantic-ui-css/semantic.min.css';

setLanguage(Language.English);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

