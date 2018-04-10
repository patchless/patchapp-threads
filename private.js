var h = require('hyperscript')
var ref = require('ssb-ref')
var viewMenu = require('./junk/view-menu')
var Stream = require('./junk/stream')

exports.needs = {
  sbot: { query: {read: 'first'}},
  avatar: {image: 'first', name: 'first'},
  message: { layout: 'first' },
  identity: {unbox: 'first'},
  app: {viewMenu: 'map'},
}

exports.gives = {
  app: {menu: true, view: true},
  avatar: { action: true }
}

exports.create = function (api) {

  return {
    app: {
      view: function (src) {
        var id
        if(!(
          src == 'private' ||
          (/^private\//.test(src) && ref.isFeed(id = src.substring(8)))
        )) return

        return Stream(
          api.sbot.query.read,
          [{$filter: {value: {private: true, author: id}}}],
          api.message.layout,
          h('div.content', viewMenu(api.app.viewMenu(src)))
        )
      },
      menu: function () {
        return 'private'
      }
    },
    avatar: {
      action: function (id) {
        return h('a', {href: 'private/'+id}, 'private')
      }
    }
  }
}

