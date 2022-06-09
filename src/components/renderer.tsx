import { useEffect } from 'react'
import { mount } from 'src/scene'

import './renderer.scss'

const Renderer = () => {
  useEffect(() => {
    const el = document.querySelector('.renderer__wrapper') as HTMLDivElement
    if (el) {
      mount(el)
    }
  })

  return <div className="renderer__wrapper"></div>
}

export default Renderer
