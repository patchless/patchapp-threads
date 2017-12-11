var h = require('hyperscript')
var pull = require('pull-stream')
var ref = require('ssb-ref')
var More = require('pull-more')
var HyperMoreStream = require('hyperloadmore/stream')
var viewMenu = require('./junk/view-menu')

exports.needs = {
  sbot: { createLogStream: 'first' },
  message: {layout: 'first'},
  app: {viewMenu: 'map'}
}

exports.gives = {
  app: {view: true}, message: { meta: true },
  compose: { context: true }
}

exports.create = function (api) {
  return {
    app: {
      view: function (src) {
        if(!/^#\w+/.test(src)) return
        var channel = src.substring(1)
        var content = h('div.content', viewMenu(api.app.viewMenu(src)))

        function createStream (opts) {
          return pull(
            More(api.sbot.createLogStream, opts),
            pull.filter(function (data) {
              return (
                data.value.content.channel == channel &&
                'string' === typeof data.value.content.text
              )
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
      }
    },
    message: {
      meta: function (msg) {
        var channel = msg.value.content.channel
        if(channel)
          return h('a', {href: '#'+channel}, '#'+channel)
      }
    },
    compose: {
      context: function (meta, context) {
        if(meta.root) return //can't change the channel mid thread
        return h('div.patchapp__compose-context', h('label', 'channel'), h('input', meta.channel, {oninput: function (ev) {
          meta.channel = ev.target.value
        }}))

      }
    }
  }
}



