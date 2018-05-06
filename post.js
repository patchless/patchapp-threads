var h = require('hyperscript')
var markdown = require('ssb-markdown')
var htmlEscape = require('html-escape')

exports.gives = {
  message: {
    render: true
  }
}

exports.create = function () {
  return { message: { render: function (msg) {
    if(msg.content.type != 'post') return

    //TODO: don't hard code the file server URL.
    //hmm, probably should have a reduce here that can tranform the markdown options
    //then markdown extentions can be separated out.
    return h('div.markdown',
      {innerHTML: markdown.block(msg.content.text, {
        toUrl: function (url, image) {
          if(!image) return url
          if(url[0] !== '&') return url
          return 'http://localhost:8989/blobs/get/'+url
        },
        emoji: function (emoji) {
          return '<img class="emoji" src="http://localhost:8989/img/emoji/'+htmlEscape(emoji)+'.png">'
        }
      })}
    )
  }}}
}




