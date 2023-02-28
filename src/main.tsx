import 'src/styles/null.scss'
import 'src/styles/styles.scss'
import 'src/hair/preview-scene'
import { showCarpet } from './carpet/carpet'
import { createRoot } from 'react-dom/client'
import App from 'components/app'
import { exec } from './instanced'

const p:number =3
switch (p) {
  case 1:
    const root = createRoot(document.querySelector('#app') as HTMLDivElement)
    root.render(<App />)
    break
  case 2:
    const div = document.createElement('div')
    div.style.width = window.innerWidth + 'px'
    div.style.height = window.innerHeight + 'px'
    document.body.appendChild(div)
    showCarpet(div)
    break
  case 3:
    exec()
    break
  case 1:
    break
}
