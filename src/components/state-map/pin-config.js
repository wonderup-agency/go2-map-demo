var usjspinsconfig = {
  pins: [
    {
      hover: 'WASHINGTON DC', // Info of the popup
      pos_X: 585, // Position on the X-Axis
      pos_Y: 183, // Position on the Y-Axis
      size: 0, // Size of the Pin in px
      upColor: '#FF0000', // Default Color
      overColor: '#FFCC00', // Hover Color
      url: '', // Link to any webpage
      target: 'same_page', // Use "same_page", "new_page", or "none"
      active: true, //true/false to set it as Active/Inactive
    },
    {
      hover: 'LOS ANGELES',
      pos_X: 69,
      pos_Y: 260,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'NEW YORK',
      pos_X: 616,
      pos_Y: 139,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'CHICAGO',
      pos_X: 448,
      pos_Y: 140,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'HOUSTON',
      pos_X: 365,
      pos_Y: 353,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'PHOENIX',
      pos_X: 144,
      pos_Y: 287,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'SEATTLE',
      pos_X: 66,
      pos_Y: 47,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'DALLAS',
      pos_X: 358,
      pos_Y: 312,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'JACKSONVILLE',
      pos_X: 554,
      pos_Y: 330,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'COLUMBUS',
      pos_X: 513,
      pos_Y: 177,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'INDIANAPOLIS',
      pos_X: 474,
      pos_Y: 187,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    },
    {
      hover: 'BLANK',
      pos_X: 30,
      pos_Y: 30,
      size: 0,
      upColor: '#FF0000',
      overColor: '#FFCC00',
      url: '',
      target: 'same_page',
      active: true,
    }, // Feel free to add more pins
  ],
}

/********************************************************************
    *********************************************************************
    // The following is the script for pins interaction DON'T EDIT !!! //
    *********************************************************************
    ********************************************************************/

;(function () {
  'use strict'
  function isTouchEnabled() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
  }
  document.addEventListener('DOMContentLoaded', function () {
    let pins_len = usjspinsconfig.pins.length
    if (pins_len > 0) {
      let xmlns = 'http://www.w3.org/2000/svg'
      let tsvgpin = document.getElementById('usjspins')
      let svg_circle
      for (let i = 0; i < pins_len; i++) {
        svg_circle = document.createElementNS(xmlns, 'circle')
        svg_circle.setAttribute('cx', usjspinsconfig.pins[i].pos_X + 1)
        svg_circle.setAttribute('cy', usjspinsconfig.pins[i].pos_Y + 1)
        svg_circle.setAttribute('r', usjspinsconfig.pins[i].size / 2)
        svg_circle.setAttribute('fill', 'rgba(0, 0, 0, 0.5)')
        tsvgpin.appendChild(svg_circle)
        svg_circle = document.createElementNS(xmlns, 'circle')
        svg_circle.setAttribute('id', 'usjspins_' + i)
        svg_circle.setAttribute('cx', usjspinsconfig.pins[i].pos_X)
        svg_circle.setAttribute('cy', usjspinsconfig.pins[i].pos_Y)
        svg_circle.setAttribute('r', usjspinsconfig.pins[i].size / 2)
        svg_circle.setAttribute('fill', usjspinsconfig.pins[i].upColor)
        svg_circle.setAttribute('stroke', '#333333')
        svg_circle.setAttribute('stroke-width', 1)
        tsvgpin.appendChild(svg_circle)
        addEvent(i)
      }
    }
  })
  function addEvent(id) {
    const usPin = document.getElementById('usjspins_' + id)
    const usTip = document.getElementById('usjstip')
    const downColor = '#595959'
    if (usjspinsconfig.pins[id].active) {
      if (isTouchEnabled()) {
        let touchmoved
        usPin.addEventListener('touchstart', function (e) {
          touchmoved = !1
          usTip.style.display = 'none'
          usPin.setAttribute('fill', usjspinsconfig.pins[id].upColor)
        })
        usPin.addEventListener('touchmove', function () {
          touchmoved = !0
        })
        usPin.addEventListener('touchend', function (e) {
          if (!touchmoved) {
            usTip.style.display = 'none'
            usPin.setAttribute('fill', usjspinsconfig.pins[id].upColor)
            if (usjspinsconfig.pins[id].target === 'new_page') {
              window.open(usjspinsconfig.pins[id].url)
            } else if (usjspinsconfig.pins[id].target === 'same_page') {
              window.location.href = usjspinsconfig.pins[id].url
            }
          }
        })
      } else {
        usPin.style.cursor = 'pointer'
        usPin.addEventListener('mouseenter', function () {
          usPin.setAttribute('fill', usjspinsconfig.pins[id].overColor)
        })
        usPin.addEventListener('mouseleave', function () {
          usTip.style.display = 'none'
          usPin.setAttribute('fill', usjspinsconfig.pins[id].upColor)
        })
        if (usjspinsconfig.pins[id].target !== 'none') {
          usPin.addEventListener('mousedown', function () {
            usPin.setAttribute('fill', downColor)
          })
        }
        usPin.addEventListener('mouseup', function () {
          usTip.style.display = 'none'
          usPin.setAttribute('fill', usjspinsconfig.pins[id].overColor)
          if (usjspinsconfig.pins[id].target === 'new_page') {
            window.open(usjspinsconfig.pins[id].url)
          } else if (usjspinsconfig.pins[id].target === 'same_page') {
            window.location.href = usjspinsconfig.pins[id].url
          }
        })
        usPin.addEventListener('mousemove', function (e) {
          usTip.style.display = 'block'
          usTip.innerHTML = usjspinsconfig.pins[id].hover
          let x = e.pageX + 10,
            y = e.pageY + 15
          let usTipWidth = usTip.offsetWidth,
            usTipHeight = usTip.offsetHeight
          x = x + usTipWidth > window.innerWidth + window.scrollX ? x - usTipWidth - 20 : x
          y =
            y + usTipHeight > window.innerHeight + window.scrollY
              ? window.innerHeight + window.scrollY - usTipHeight - 10
              : y
          usTip.style.left = x + 'px'
          usTip.style.top = y + 'px'
        })
      }
    }
  }
})()
