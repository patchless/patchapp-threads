var h = require('hyperscript')
var pull = require('pull-stream')
var ref = require('ssb-ref')
var More = require('pull-more')
var HyperMoreStream = require('hyperloadmore/stream')
//var ago = require('nice-ago')

//var LightBox = require('hyperlightbox')

function Nice(ts, since) {
  since = since || Date.now()

}

exports.needs = {
  sbot: { createLogStream: 'first' },
  message: {layout: 'first'}
}

exports.gives = {
  app: {menu: true, view: true}
}

exports.create = function (api) {
  return {
    app: {
      view: function (src) {
        if(src !== 'public') return

        var content = h('div.content')
/*
        var lightbox = LightBox()
        var button = h('div', {
          style:{
  //          width: '20px', height: '20px',
            padding: '10px',
            position: 'absolute',
            right: '20px', bottom: '20px',
            background: 'red'
          },
          onclick: function () {
            lightbox.show(h('textarea'))
          }
        }, 'click')

        content.appendChild(button)
        content.appendChild(lightbox)
*/

        function createStream (opts) {
          return pull(
            More(api.sbot.createLogStream, opts),
            pull.filter(function (data) {
              return 'string' === typeof data.value.content.text
            }),
            pull.map(api.message.layout)
          )
        }

        pull(
          createStream({old: false, limit: 100}),
          HyperMoreStream.top(content)
        )

        pull(
          createStream({reverse: true, live: false, limit: 100}),
          HyperMoreStream.bottom(content)
        )


        return content
      },
      menu: function () {
        return 'public'
      }
    }
  }
}


