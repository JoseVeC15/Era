'use client'
import { useEffect } from 'react'

export default function ThreeScripts() {
  useEffect(() => {
    const cdnScripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
      'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js',
      'https://elfsightcdn.com/platform.js',
    ]
    const localScripts = ['/three-setup.js', '/script.js']

    const loadSequential = (urls: string[], idx = 0) => {
      if (idx >= urls.length) return
      const s = document.createElement('script')
      s.src = urls[idx]
      s.async = false
      s.onload = () => loadSequential(urls, idx + 1)
      s.onerror = () => loadSequential(urls, idx + 1)
      document.body.appendChild(s)
    }

    loadSequential([...cdnScripts, ...localScripts])
  }, [])

  return null
}
