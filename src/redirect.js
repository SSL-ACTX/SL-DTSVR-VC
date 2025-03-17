function isLocalUrl(path) {
  try {
    return (
      new URL(path, "https://example.com").origin === "https://example.com"
    );
  } catch (e) {
    return false;
  }
}

function redirect(req, res) {
  if (res.headersSent) return

  res.setHeader('content-length', 0)
  res.removeHeader('cache-control')
  res.removeHeader('expires')
  res.removeHeader('date')
  res.removeHeader('etag')
  const targetUrl = req.params.url;
  if (isLocalUrl(targetUrl)) {
    res.setHeader('location', encodeURI(targetUrl))
  } else {
    res.setHeader('location', '/')
  }
  res.status(302).end()
}

module.exports = redirect
