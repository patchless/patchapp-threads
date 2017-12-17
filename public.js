var h = require('hyperscript')
var pull = require('pull-stream')
var ref = require('ssb-ref')
var More = require('pull-more')
var HyperMoreStream = require('hyperloadmore/stream')
var viewMenu = require('./junk/view-menu')

exports.needs = {
  sbot: { createLogStream: 'first', createUserStream: 'first'},
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

        var content = h('div.content', viewMenu(api.app.viewMenu(src)))

        function createStream (opts) {
          return pull(
            (id
              ? More(api.sbot.createUserStream, opts, ['value', 'sequence'])
              : More(api.sbot.createLogStream, opts)
            ),
            pull.filter(function (data) {
              return 'string' === typeof data.value.content.text
            }),
            pull.map(api.message.layout)
          )
        }

        pull(
          createStream({old: false, limit: 100, id: id}),
          HyperMoreStream.top(content)
        )

        pull(
          createStream({reverse: true, live: false, limit: 100, id: id}),
          HyperMoreStream.bottom(content)
        )


        return content
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


