const WORKER_URL = 'https://go2-worker.nahuel-eba.workers.dev/videos'

// How many videos to show per "page"
const PAGE_SIZE = 12
// How many videos we fetch in total per request (initial or by category)
const MAX_VIDEOS = 300

export default async function (component) {
  console.log('[YouTube] Component init ✅', component)
  console.log('test')

  const listEl = component.querySelector('[fs-youtubefeed-element="list"]')
  const templateItem = component.querySelector('[fs-youtubefeed-element="item"]')
  const loadMoreBtn = component.querySelector('[fs-youtubefeed-element="load-more"]')

  // IMPORTANT: grab the real <select>, not the wrapper
  let categorySelect =
    component.querySelector('select[fs-youtube-categories="list"]') ||
    component.querySelector('[fs-youtube-categories="list"]')

  if (!listEl || !templateItem) {
    console.warn('[YouTube] No list or template item found')
    return
  }

  // Clone one item to use as template for dynamic items
  // We DO NOT remove the original template from the DOM, so it can act as a loading skeleton
  const itemTemplate = templateItem.cloneNode(true)

  // --- State ---
  let isLoading = false
  let allVideos = [] // all videos for "All"
  let currentCategoryId = 'all'
  const cacheByCategory = {} // playlistId -> videos[]
  const categoriesById = {} // playlistId -> playlist object
  let visibleCount = PAGE_SIZE

  function setLoading(loading) {
    isLoading = loading
    if (loading) {
      component.classList.add('is-loading')
    } else {
      component.classList.remove('is-loading')
    }
  }

  // Initial load
  await fetchInitialData()

  // Load more = front-only pagination
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const list = getCurrentVideoList()
      if (!list || list.length === 0) return

      if (visibleCount >= list.length) {
        updateLoadMoreVisibility(list)
        return
      }

      const previous = visibleCount
      visibleCount = Math.min(visibleCount + PAGE_SIZE, list.length)

      console.time('[YouTube] Load more render')
      renderCurrentList(true)
      console.timeEnd('[YouTube] Load more render')

      console.log(`[YouTube] Load more: from ${previous} → ${visibleCount} items (total ${list.length})`)
    })
  }

  // -------------------------
  // Initial data fetch
  // -------------------------
  async function fetchInitialData() {
    console.time('[YouTube] Initial fetch')
    try {
      setLoading(true)

      const sep = WORKER_URL.includes('?') ? '&' : '?'
      const url = WORKER_URL + `${sep}maxVideos=${MAX_VIDEOS}&maxVideosPerPlaylist=${MAX_VIDEOS}`

      const res = await fetch(url)
      if (!res.ok) {
        console.error('[YouTube] Error fetching videos', res.status)
        return
      }

      const data = await res.json()
      console.log('[YouTube] Initial data ✅', data)

      if (data.channel) {
        renderHeader(data.channel)
      }

      allVideos = Array.isArray(data.videos) ? data.videos : []
      console.log('[YouTube] Initial videos count:', allVideos.length)

      const categoriesArray = Array.isArray(data.categories) ? data.categories : []
      console.log('[YouTube] Categories from worker:', categoriesArray.length, categoriesArray)

      categoriesArray.forEach((cat) => {
        if (cat && cat.id) {
          categoriesById[cat.id] = cat
        }
      })

      if (categoriesArray.length > 0) {
        populateCategorySelect(categoriesArray)
      } else {
        console.warn('[YouTube] No categories returned from worker')
      }

      visibleCount = Math.min(PAGE_SIZE, allVideos.length)
      console.log('[YouTube] Total videos fetched:', allVideos.length, '| Showing initially:', visibleCount)

      console.time('[YouTube] Initial render')
      renderCurrentList(false)
      console.timeEnd('[YouTube] Initial render')

      component.style.opacity = '1'
    } catch (err) {
      console.error('[YouTube] Error fetching videos', err)
    } finally {
      setLoading(false)
      console.timeEnd('[YouTube] Initial fetch')
    }
  }

  // -------------------------
  // Which list is active
  // -------------------------
  function getCurrentVideoList() {
    if (currentCategoryId === 'all') return allVideos
    return cacheByCategory[currentCategoryId] || []
  }

  // -------------------------
  // Render current list (with pagination)
  // -------------------------
  function renderCurrentList(isLoadMore = false) {
    const currentList = getCurrentVideoList()
    const toRender = currentList.slice(0, visibleCount)

    console.log(
      `[YouTube] renderCurrentList(): category=${currentCategoryId}, visible=${visibleCount}, totalInList=${currentList.length}`
    )

    clearList()
    renderVideos(toRender, isLoadMore)
    updateLoadMoreVisibility(currentList)
  }

  // -------------------------
  // Populate category select
  // -------------------------
  function populateCategorySelect(categories) {
    if (!categorySelect) {
      console.warn('[YouTube] No category select found in DOM')
      return
    }

    // If the first match is not a <select>, try to find the actual select
    if (categorySelect.tagName !== 'SELECT') {
      console.warn('[YouTube] categorySelect is not a <select>, trying select[fs-youtube-categories="list"]')
      const innerSelect = component.querySelector('select[fs-youtube-categories="list"]')
      if (innerSelect) {
        categorySelect = innerSelect
      }
    }

    if (!categorySelect || categorySelect.tagName !== 'SELECT') {
      console.warn('[YouTube] Could not find native <select> for categories')
      return
    }

    console.log('[YouTube] Populating native category <select> with', categories.length, 'categories')

    categorySelect.multiple = false
    categorySelect.innerHTML = ''

    // "All" option
    const optAll = document.createElement('option')
    optAll.value = 'all'
    optAll.textContent = 'All videos'
    categorySelect.appendChild(optAll)

    // Playlist options
    categories.forEach((cat) => {
      if (!cat || !cat.id || !cat.title) return
      const opt = document.createElement('option')
      opt.value = cat.id
      opt.textContent = cat.title
      categorySelect.appendChild(opt)
    })

    // Default value
    categorySelect.value = 'all'

    // Listen for changes
    categorySelect.addEventListener('change', (event) => {
      const value = event.target.value
      console.log('[YouTube] change event from select →', value)
      handleCategoryChange(value || 'all')
    })

    // Extra safety: poll for changes (in case Finsweet updates it)
    startCategoryPolling(categorySelect)
  }

  // -------------------------
  // Polling to detect Finsweet updates
  // -------------------------
  function startCategoryPolling(selectEl) {
    let lastValue = selectEl.value || 'all'
    console.log('[YouTube] Category polling initial value →', lastValue)

    setInterval(() => {
      const currentValue = selectEl.value || 'all'
      if (currentValue !== lastValue) {
        console.log('[YouTube] Category polling detected change →', lastValue, '→', currentValue)
        lastValue = currentValue
        handleCategoryChange(currentValue)
      }
    }, 300)
  }

  // -------------------------
  // Category change handler
  // -------------------------
  async function handleCategoryChange(value) {
    const newCategoryId = value || 'all'

    if (newCategoryId === currentCategoryId) return

    currentCategoryId = newCategoryId
    console.log('[YouTube] Category change →', currentCategoryId)

    visibleCount = PAGE_SIZE

    if (currentCategoryId === 'all') {
      renderCurrentList(false)
      return
    }

    // Use cache if available
    if (cacheByCategory[currentCategoryId]) {
      const list = cacheByCategory[currentCategoryId]
      visibleCount = Math.min(PAGE_SIZE, list.length)
      renderCurrentList(false)
      return
    }

    // Fetch this playlist
    try {
      setLoading(true)

      const sep = WORKER_URL.includes('?') ? '&' : '?'
      const url = WORKER_URL + `${sep}playlistId=${encodeURIComponent(currentCategoryId)}&maxVideos=${MAX_VIDEOS}`

      console.log('[YouTube] Fetching category videos:', url)

      const res = await fetch(url)
      if (!res.ok) {
        console.error('[YouTube] Error fetching category videos', res.status)
        return
      }

      const data = await res.json()
      const videos = Array.isArray(data.videos) ? data.videos : []

      console.log(`[YouTube] Category ${currentCategoryId} fetched ${videos.length} videos`)

      cacheByCategory[currentCategoryId] = videos
      visibleCount = Math.min(PAGE_SIZE, videos.length)
      renderCurrentList(false)
    } catch (err) {
      console.error('[YouTube] Error fetching category videos', err)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // Header
  // -------------------------
  function renderHeader(channel) {
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
    if (videoCountEl && channel.videoCount) {
      videoCountEl.textContent = formatNumber(channel.videoCount)
    }
    if (viewCountEl && channel.viewCount) {
      viewCountEl.textContent = formatNumber(channel.viewCount)
    }
    if (subCountEl && channel.subscriberCount) {
      subCountEl.textContent = formatNumber(channel.subscriberCount)
    }
    if (subscribeLinkEl && channel.url) subscribeLinkEl.href = channel.url
  }

  // -------------------------
  // List helpers
  // -------------------------
  function clearList() {
    const t0 = performance.now()
    while (listEl.firstChild) {
      listEl.removeChild(listEl.firstChild)
    }
    const t1 = performance.now()
    console.log('[YouTube] clearList():', (t1 - t0).toFixed(1), 'ms')
  }

  function renderVideos(videos, isLoadMore) {
    if (!Array.isArray(videos)) return

    const t0 = performance.now()

    videos.forEach((video, idx) => {
      const itemEl = itemTemplate.cloneNode(true)
      fillSingleItem(itemEl, video)

      // Base loading style for all renders
      itemEl.style.opacity = '0'
      itemEl.style.transform = 'translateY(6px)'

      listEl.appendChild(itemEl)

      // Stagger only on "load more"
      if (isLoadMore) {
        const delay = idx * 20
        setTimeout(() => {
          requestAnimationFrame(() => {
            itemEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease'
            itemEl.style.opacity = '1'
            itemEl.style.transform = 'translateY(0)'
          })
        }, delay)
      } else {
        // Normal fade-in for initial / category renders
        requestAnimationFrame(() => {
          itemEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
          itemEl.style.opacity = '1'
          itemEl.style.transform = 'translateY(0)'
        })
      }
    })

    const t1 = performance.now()
    console.log('[YouTube] renderVideos(): rendered', videos.length, 'items in', (t1 - t0).toFixed(1), 'ms')
  }

  function updateLoadMoreVisibility(currentList) {
    if (!loadMoreBtn) return
    const list = currentList || getCurrentVideoList()
    if (!Array.isArray(list) || list.length <= visibleCount) {
      loadMoreBtn.style.display = 'none'
    } else {
      loadMoreBtn.style.display = 'block'
    }
  }

  // -------------------------
  // Single item
  // -------------------------
  function fillSingleItem(itemEl, video) {
    const thumbImg = itemEl.querySelector('[fs-youtubefeed-element="thumbnail"]')
    const thumbWrapper = itemEl.querySelector('[fs-youtubefeed-element="thumbnail-wrapper"]')
    const titleEl = itemEl.querySelector('[fs-youtubefeed-element="title"]')
    const dateEl = itemEl.querySelector('[fs-youtubefeed-element="published-date"]')
    const viewCountEl = itemEl.querySelector('[fs-youtubefeed-element="view-count"]')
    const likeCountEl = itemEl.querySelector('[fs-youtubefeed-element="like-count"]')
    const commentCountEl = itemEl.querySelector('[fs-youtubefeed-element="comment-count"]')
    const favouriteCountEl = itemEl.querySelector('[fs-youtubefeed-element="favourite-count"]')
    const categoriesEl = itemEl.querySelector('[fs-youtubefeed-element="categories"]')

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
    if (dateEl) dateEl.textContent = formatDate(video.publishedAt)

    if (viewCountEl) viewCountEl.textContent = formatNumber(video.viewCount || '0')
    if (likeCountEl) likeCountEl.textContent = formatNumber(video.likeCount || '0')
    if (commentCountEl) {
      commentCountEl.textContent = formatNumber(video.commentCount || '0')
    }
    if (favouriteCountEl) {
      favouriteCountEl.textContent = formatNumber(video.likeCount || '0')
    }

    // Categories (for debugging / UX)
    if (categoriesEl) {
      categoriesEl.textContent = ''

      if (Array.isArray(video.categories) && video.categories.length > 0) {
        const titles = video.categories.map((id) => categoriesById[id]?.title).filter(Boolean)
        if (titles.length > 0) {
          categoriesEl.textContent = titles.join(' • ')
        }
      }
    }
  }

  // -------------------------
  // Utils
  // -------------------------
  function formatNumber(value) {
    const num = Number(value)
    if (Number.isNaN(num)) return value
    return num.toLocaleString()
  }

  function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString()
  }
}
