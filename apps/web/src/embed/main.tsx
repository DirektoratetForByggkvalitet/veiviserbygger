import { createRoot } from 'react-dom/client'
import { EmbedApp } from './App'

/**
 * This script is designed to be used in an HTML file that includes a div with the attribute `wizard-id`
 * and a `host` attribute referring to the server where the embed app is hosted.
 *
 * @example
 * <div id="embed-container" wizard-id="123" host="https://example.com"></div>
 * <script type="module" src="https://example.com/embed.js"></script>
 */

document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[wizard-id]')

  elements.forEach((element) => {
    const wizardId = element.getAttribute('wizard-id')
    const host = element.getAttribute('host')
    const root = createRoot(element)

    if (!host) {
      return root.render(<div>Missing host attribute</div>)
    }

    if (!wizardId) {
      return root.render(<div>Missing wizard-id attribute</div>)
    }

    root.render(<EmbedApp host={host} wizardId={wizardId} />)
  })
})
