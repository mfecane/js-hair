import 'src/styles/null.scss'
import 'src/styles/styles.scss'
import 'src/hair/preview-scene'

import { createRoot } from 'react-dom/client'
import App from 'components/app'

const root = createRoot(document.querySelector('#app') as HTMLDivElement)
root.render(<App />)
