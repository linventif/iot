/* @refresh reload */
import { render } from 'solid-js/web';

import 'flyonui/flyonui';
import App from './App';
import './index.css';

const root = document.getElementById('root');

render(() => <App />, root!);