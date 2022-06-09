import './null.scss'
import './styles.scss'
import './scene'

import { createRoot } from 'react-dom/client'
import App from 'components/app'

const root = createRoot(document.querySelector('#app'))
root.render(<App />)
