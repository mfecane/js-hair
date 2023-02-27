import { useEffect } from 'react'
import { showCarpet } from 'src/carpet/carpet'
import { mount } from 'src/hair/preview-scene'

import './renderer.scss'

const Renderer = () => {
  useEffect(() => {
    const el = document.querySelector('.renderer__wrapper') as HTMLDivElement
    if (el) {
      showCarpet(el)
      // mount(el)
    }
  })

  return <div className="renderer__wrapper"></div>
}

export default Renderer
