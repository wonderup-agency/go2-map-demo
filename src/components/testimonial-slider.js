import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

export default function (component) {
  const root = component.closest('.testimonials_component') || document
  const nextArrow = root.querySelector('[data-slider-arrow="next"]')
  const prevArrow = root.querySelector('[data-slider-arrow="prev"]')

  if (!nextArrow || !prevArrow) return

  new Swiper(component, {
    slidesPerView: 'auto',
    spaceBetween: 48,
    navigation: {
      nextEl: nextArrow,
      prevEl: prevArrow,
    },
  })
}
