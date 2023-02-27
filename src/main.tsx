import 'src/styles/null.scss'
import 'src/styles/styles.scss'
import 'src/hair/preview-scene'
import { showCarpet } from './carpet/carpet'
import { createRoot } from 'react-dom/client'
import App from 'components/app'

if (false) {
  const root = createRoot(document.querySelector('#app') as HTMLDivElement)
  root.render(<App />)
} else {
  const div = document.createElement('div')
  div.style.width = window.innerWidth + 'px'
  div.style.height = window.innerHeight + 'px'
  document.body.appendChild(div)
  showCarpet(div)
}
