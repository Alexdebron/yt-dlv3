const axios = require('axios')

const videoquality = ['1080', '720', '480', '360', '240', '144']
const audiobitrate = ['128', '320']

async function search(q) {
  const r = await axios.get(
    'https://yt-extractor.y2mp3.co/api/youtube/search?q=' + encodeURIComponent(q),
    {
      headers: {
        'user-agent': 'Mozilla/5.0',
        accept: 'application/json',
        origin: 'https://ytmp3.gg',
        referer: 'https://ytmp3.gg/'
      }
    }
  )

  const i = r.data.items.find(v => v.type === 'stream')
  if (!i) throw new Error('Video not found')
  return i
}

async function download(url, type, quality) {
  if (type === 'mp4' && !videoquality.includes(String(quality)))
    throw new Error('Invalid video quality')

  if (type === 'mp3' && !audiobitrate.includes(String(quality)))
    throw new Error('Invalid audio bitrate')

  const payload =
    type === 'mp4'
      ? {
          url,
          downloadMode: 'video',
          brandName: 'ytmp3.gg',
          videoQuality: String(quality),
          youtubeVideoContainer: 'mp4'
        }
      : {
          url,
          downloadMode: 'audio',
          brandName: 'ytmp3.gg',
          audioFormat: 'mp3',
          audioBitrate: String(quality)
        }

  const r = await axios.post('https://hub.y2mp3.co', payload, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      accept: 'application/json',
      'content-type': 'application/json',
      origin: 'https://ytmp3.gg',
      referer: 'https://ytmp3.gg/'
    }
  })

  if (!r.data?.url) throw new Error('Download failed')
  return r.data
}

async function ytdl(input, type, quality) {
  let info
  let url = input

  if (!/^https?:\/\//i.test(input)) {
    info = await search(input)
    url = info.id
  }

  const dl = await download(url, type, quality)

  if (!info) {
    info = {
      title: null,
      thumbnailUrl: null,
      uploaderName: null,
      duration: null,
      viewCount: null,
      uploadDate: null
    }
  }

  return {
    status: true,
    creater: "Chamod Nimsara",
    title: info.title,
    thumbnail: info.thumbnailUrl,
    uploader: info.uploaderName,
    duration: info.duration,
    viewCount: info.viewCount,
    uploadDate: info.uploadDate,
    type,
    quality: String(quality),
    url: dl.url,
    filename: dl.filename
  }
}

module.exports = async (req, res) => {
  try {
    const { q, type = 'mp3', quality = '320' } = req.query

    if (!q) {
      return res.status(400).json({
        status: false,
        creater: "Chamod Nimsara",
        message: 'q parameter required'
      })
    }

    const data = await ytdl(q, type, quality)
    res.json(data)
  } catch (e) {
    res.status(500).json({
      status: false,
      creater: "Chamod Nimsara",
      message: e.message
    })
  }
}
