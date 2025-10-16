// React 17+ 的 JSX 转换不再需要显式导入 React
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
