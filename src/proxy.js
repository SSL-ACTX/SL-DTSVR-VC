const request = require('request')
const pick = require('lodash').pick
const shouldCompress = require('./shouldCompress')
const redirect = require('./redirect')
const compress = require('./compress')
const bypass = require('./bypass')
const copyHeaders = require('./copyHeaders')

const allowedUrls = {
  'example1': 'https://example1.com/data',
  'example2': 'https://example2.com/data'
};

function proxy(req, res) {
  const targetUrl = allowedUrls[req.params.url];
  if (!targetUrl) {
    return res.status(400).send('Invalid URL parameter');
  }

  request.get(
    targetUrl,
    {
      headers: {
        ...pick(req.headers, ['cookie', 'dnt', 'referer']),
        'user-agent': 'SL Image Compressor',
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
        via: '1.1.2 sl-image-compression'
      },
      timeout: 10000,
      maxRedirects: 5,
      encoding: null,
      strictSSL: false,
      gzip: true,
      jar: true
    },
    (err, origin, buffer) => {
      if (err || origin.statusCode >= 400) return redirect(req, res)

      copyHeaders(origin, res)
      res.setHeader('content-encoding', 'identity')
      req.params.originType = origin.headers['content-type'] || ''
      req.params.originSize = buffer.length

      if (shouldCompress(req)) {
        compress(req, res, buffer)
      } else {
        bypass(req, res, buffer)
      }
    }
  )
}

module.exports = proxy
