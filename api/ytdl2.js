const axios = require('axios')

async function ytdl(url) {
  const res = await axios.post(
    'https://api.vidssave.com/api/contentsite_api/media/parse',
    new URLSearchParams({
      auth: '20250901majwlqo',
      domain: 'api-ak.vidssave.com',
      origin: 'cache',
      link: url
    }).toString(),
    {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://vidssave.com',
        referer: 'https://vidssave.com/'
      }
    }
  )

  const { title, thumbnail, duration, resources } = res.data.data

  return {
    status: true,
    creater: "Chamod Nimsara",
    title,
    thumbnail,
    duration,
    formats: resources.map(r => ({
      type: r.type,
      quality: r.quality,
      format: r.format,
      size: r.size,
      url: r.download_url
    }))
  }
}

module.exports = async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({
        status: false,
        creater: "Chamod Nimsara",
        message: "url parameter required"
      })
    }

    const data = await ytdl(url)
    res.json(data)
  } catch (e) {
    res.status(500).json({
      status: false,
      creater: "Chamod Nimsara",
      message: e.message
    })
  }
}
