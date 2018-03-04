var h = require('hyperscript')
var pull = require('pull-stream')
var ref = require('ssb-ref')
var markdown = require('ssb-markdown')
var More = require('pull-more')
var HyperMoreStream = require('hyperloadmore/stream')
var viewMenu = require('./junk/view-menu')

exports.needs = {
  sbot: { createLogStream: 'first', createUserStream: 'first', private: {read: 'first'}},
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
        var content = h('div.content', viewMenu(api.app.viewMenu(src)))

        function createStream (opts) {
          function create(opts) {
            var lt = opts.lt
            opts.query = [
                {$filter: {
                  timestamp: typeof lt === 'number'
                    ? {$lt: lt, $gt: 0}
                    : {$gt: 0}
                  }
                }
              ]
            return api.sbot.private.read(opts)
          }

          return pull(
            More(create, opts, ['timestamp']),
            pull.map(api.message.layout)
          )
        }

        pull(
          createStream({old: false, limit: 10, id: id}),
          HyperMoreStream.top(content)
        )

        pull(
          createStream({reverse: true, live: false, limit: 100, id: id}),
          HyperMoreStream.bottom(content)
        )

        return content
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

