import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

export default function (component) {
  const root = component.closest('.testimonials_component') || document
  const nextArrow = root.querySelector('[data-slider-arrow="next"]')
  const prevArrow = root.querySelector('[data-slider-arrow="prev"]')

  if (!nextArrow || !prevArrow) return

  new Swiper(component, {
    loop: true,

    autoplay: {
      delay: 6000,
      disableOnInteraction: false,
    },

    slidesPerView: 1.2,
    spaceBetween: 24,

    navigation: {
      nextEl: nextArrow,
      prevEl: prevArrow,
    },

    breakpoints: {
      768: {
        slidesPerView: 2.1,
        spaceBetween: 48,
      },
    },
  })
}
