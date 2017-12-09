var h = require('hyperscript')
var markdown = require('ssb-markdown')

exports.gives = {
  message: {
    render: true
  }
}

exports.create = function () {
  return { message: { render: function (msg) {
    if(msg.content.type != 'post') return
    return h('div.markdown',
      {innerHTML: markdown.block(msg.content.text, {toUrl: function (url, image) {
        if(!image) return url
        if(url[0] !== '&') return url
        return 'http://localhost:8989/blobs/get/'+url
      }})}
    )
  }}}
}


