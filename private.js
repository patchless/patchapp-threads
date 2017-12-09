var h = require('hyperscript')
var pull = require('pull-stream')
var ref = require('ssb-ref')
var markdown = require('ssb-markdown')
var More = require('pull-more')
var HyperMoreStream = require('hyperloadmore/stream')

//var ssbKeys = require('ssb-keys')
//var config = require('ssb-config')
//var path = require('path')
//var keys = config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
//
exports.needs = {
  sbot: { createLogStream: 'first' },
  avatar: {image: 'first', name: 'first'},
  message: { layout: 'first' },
  identity: {unbox: 'first'}
}

exports.gives = {
  app: {menu: true, view: true}
}

exports.create = function (api) {

  return {
    app: {
      view: function (src) {
        if(src !== 'private') return

        var content = h('div.content')
        var el = h('div')

        function createStream (opts) {
          return pull(
            More(api.sbot.createLogStream, opts),
            pull.filter(function (data) {
              return data && 'string' === typeof data.value.content
            }),
            pull.map(api.identity.unbox),
            pull.filter(Boolean),
            pull.map(api.message.layout)
          )
        }

        pull(
          createStream({old: false, limit: 10}),
          HyperMoreStream.top(content)
        )

        pull(
          createStream({reverse: true, live: false, limit: 10}),
          HyperMoreStream.bottom(content)
        )


        return content
      },
      menu: function () {
        return 'private'
      }
    }
  }
}









