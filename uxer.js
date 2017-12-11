var h = require('hyperscript')
var pull = require('pull-stream')
var ref = require('ssb-ref')
var markdown = require('ssb-markdown')
var More = require('pull-more')
var HyperMoreStream = require('hyperloadmore/stream')

exports.needs = {
  sbot: { createUserStream: 'first' },
  message: { layout: 'first' }
}

exports.gives = {
  app: {view: true}
}

exports.create = function (api) {

  return {
    app: {
      view: function (src) {
        if(!ref.isFeed(src)) return

        var content = h('div.content')

        function createStream (opts) {
          return pull(
            More(api.sbot.createUserStream, opts, ['value', 'sequence']),
            pull.filter(function (data) {
              return 'string' === typeof data.value.content.text
            }),
            pull.map(api.message.layout)
          )
        }

        pull(
          createStream({old: false, limit: 10, id: src}),
          HyperMoreStream.top(content)
        )

        pull(
          createStream({reverse: true, live: false, limit: 10,
            id: src
          }),
          HyperMoreStream.bottom(content)
        )


        return content
      }
    }
  }
}





