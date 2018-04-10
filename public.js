var h = require('hyperscript')
var ref = require('ssb-ref')
var viewMenu = require('./junk/view-menu')
var QueryStream = require('mfr-query-stream')

exports.needs = {
  sbot: { query: { read: 'first' }},
  message: {layout: 'first'},
  app: {viewMenu: 'map'}
}

exports.gives = {
  app: {menu: true, view: true},
  avatar: {action: true}
}

exports.create = function (api) {
  return {
    app: {
      view: function (src) {
        var id
        if(!(
          'public' === src ||
          (/^public\//.test(src) && ref.isFeed(id = src.substring(7)))
        )) return

        return QueryStream(
          api.sbot.query.read,
          [{$filter: {value: {
            private: {$is: 'undefined'},
            content: {type: 'post'},
            author: id
          }}}],
          api.message.layout,
          h('div.content', viewMenu(api.app.viewMenu(src)))
        )
      },
      menu: function () {
        return 'public'
      }
    },
    avatar: {
      action: function (id) {
        return h('a', {href: 'public/'+id}, 'posts')
      }
    }
  }
}

