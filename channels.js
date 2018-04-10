var h = require('hyperscript')
var ref = require('ssb-ref')
var viewMenu = require('./junk/view-menu')
var Stream = require('./junk/stream')

exports.needs = {
  sbot: { query: { read: 'first' } },
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
        return Stream(
          api.sbot.query.read,
          [{$filter: {value: {
            private: {$is: 'undefined'},
            content: {type: 'post', channel: channel},
          }}}],
          api.message.layout,
          h('div.content', viewMenu(api.app.viewMenu(src)))
        )
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


