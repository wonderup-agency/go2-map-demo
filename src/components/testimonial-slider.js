import Swiper from 'swiper'
import 'swiper/css'

export default async function (component) {
  console.log('YouTube component init ✅', component)

  new Swiper(component, {
    slidesPerView: 'auto',
    spaceBetween: 48,
    watchOverflow: true,
  })
}
