const WORKER_URL = 'https://go2-centers-worker.nahuel-eba.workers.dev/videos'

export default async function (component) {
  console.log('YouTube component init ✅', component)

  const listEl = component.querySelector('[fs-youtubefeed-element="list"]')
  const templateItem = component.querySelector('[fs-youtubefeed-element="item"]')
  const loadMoreBtn = component.querySelector('[fs-youtubefeed-element="load-more"]')

  if (!listEl || !templateItem) {
    console.warn('YouTube feed: no list or template item found')
    return
  }

  const itemTemplate = templateItem.cloneNode(true)
  templateItem.remove()

  let nextPageToken = null
  let isLoading = false

  // First load (not load more)
  await fetchVideos(false)

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      if (nextPageToken && !isLoading) {
        fetchVideos(true) // this call is from Load More
      }
    })
  }

  async function fetchVideos(isLoadMore) {
    try {
      isLoading = true

      let url = WORKER_URL
      if (isLoadMore && nextPageToken) {
        const sep = WORKER_URL.includes('?') ? '&' : '?'
        url += `${sep}pageToken=${encodeURIComponent(nextPageToken)}`
      }

      const res = await fetch(url)
      if (!res.ok) {
        console.error('Error fetching videos', res.status)
        isLoading = false
        return
      }

      const data = await res.json()
      console.log('YouTube feed data ✅', data)

      if (!nextPageToken) {
        renderHeader(data.channel)
      }

      renderVideos(data.videos || [], isLoadMore)

      nextPageToken = data.nextPageToken || null
      updateLoadMoreVisibility()

      component.style.opacity = '1'
    } catch (err) {
      console.error('Error fetching videos', err)
    } finally {
      isLoading = false
    }
  }

  function renderHeader(channel) {
    if (!channel) return

    const imgEl = component.querySelector('[fs-youtubefeed-element="profile-image"]')
    const nameEl = component.querySelector('[fs-youtubefeed-element="profile-name"]')
    const handleEl = component.querySelector('[fs-youtubefeed-element="profile-handle"]')
    const videoCountEl = component.querySelector('[fs-youtubefeed-element="video-count"]')
    const viewCountEl = component.querySelector('[fs-youtubefeed-element="view-count"]')
    const subCountEl = component.querySelector('[fs-youtubefeed-element="subscriber-count"]')
    const subscribeLinkEl = component.querySelector('[fs-youtubefeed-element="subscribe-button"]')

    if (imgEl && channel.profileImage) imgEl.src = channel.profileImage
    if (imgEl && channel.title) imgEl.alt = channel.title
    if (nameEl && channel.title) nameEl.textContent = channel.title
    if (handleEl && channel.handle) handleEl.textContent = channel.handle
    if (videoCountEl && channel.videoCount) videoCountEl.textContent = formatNumber(channel.videoCount)
    if (viewCountEl && channel.viewCount) viewCountEl.textContent = formatNumber(channel.viewCount)
    if (subCountEl && channel.subscriberCount) subCountEl.textContent = formatNumber(channel.subscriberCount)
    if (subscribeLinkEl && channel.url) subscribeLinkEl.href = channel.url
  }

  function renderVideos(videos, isLoadMore) {
    if (!Array.isArray(videos)) return

    videos.forEach((video, idx) => {
      const itemEl = itemTemplate.cloneNode(true)
      fillSingleItem(itemEl, video)

      // Basic styles before animation
      if (isLoadMore) {
        itemEl.style.opacity = '0'
        itemEl.style.transform = 'translateY(10px)'
      }

      listEl.appendChild(itemEl)

      // Animate only when coming from Load More
      if (isLoadMore) {
        // Small stagger: 50ms per item
        const delay = idx * 50

        // Use requestAnimationFrame to ensure element is in DOM
        setTimeout(() => {
          requestAnimationFrame(() => {
            itemEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease'
            itemEl.style.opacity = '1'
            itemEl.style.transform = 'translateY(0)'
          })
        }, delay)
      }
    })
  }

  function fillSingleItem(itemEl, video) {
    const thumbImg = itemEl.querySelector('[fs-youtubefeed-element="thumbnail"]')
    const thumbWrapper = itemEl.querySelector('[fs-youtubefeed-element="thumbnail-wrapper"]')
    const titleEl = itemEl.querySelector('[fs-youtubefeed-element="title"]')
    const descEl = itemEl.querySelector('[fs-youtubefeed-element="description"]')
    const dateEl = itemEl.querySelector('[fs-youtubefeed-element="published-date"]')
    const viewCountEl = itemEl.querySelector('[fs-youtubefeed-element="view-count"]')
    const likeCountEl = itemEl.querySelector('[fs-youtubefeed-element="like-count"]')
    const commentCountEl = itemEl.querySelector('[fs-youtubefeed-element="comment-count"]')
    const favouriteCountEl = itemEl.querySelector('[fs-youtubefeed-element="favourite-count"]')

    if (thumbImg && video.thumbnail) {
      thumbImg.src = video.thumbnail
      thumbImg.alt = video.title || ''
    }

    if (thumbWrapper && video.url) {
      thumbWrapper.style.cursor = 'pointer'
      thumbWrapper.onclick = () => {
        window.open(video.url, '_blank', 'noopener')
      }
    }

    if (titleEl) titleEl.textContent = video.title || ''
    if (descEl) descEl.textContent = (video.description || '').trim()
    if (dateEl) dateEl.textContent = formatDate(video.publishedAt)

    if (viewCountEl) viewCountEl.textContent = formatNumber(video.viewCount || '0')
    if (likeCountEl) likeCountEl.textContent = formatNumber(video.likeCount || '0')
    if (commentCountEl) commentCountEl.textContent = formatNumber(video.commentCount || '0')
    if (favouriteCountEl) favouriteCountEl.textContent = formatNumber(video.likeCount || '0')
  }

  function updateLoadMoreVisibility() {
    if (!loadMoreBtn) return
    loadMoreBtn.style.display = nextPageToken ? 'block' : 'none'
  }

  function formatNumber(value) {
    const num = Number(value)
    if (Number.isNaN(num)) return value
    return num.toLocaleString()
  }

  function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString()
  }
}
