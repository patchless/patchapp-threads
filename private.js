var h = require('hyperscript')
var pull = require('pull-stream')
var ref = require('ssb-ref')
var markdown = require('ssb-markdown')
var More = require('pull-more')
var HyperMoreStream = require('hyperloadmore/stream')
var viewMenu = require('./junk/view-menu')

exports.needs = {
  sbot: { createLogStream: 'first', createUserStream: 'first'},
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
        console.log('private' ,id)
        var content = h('div.content', viewMenu(api.app.viewMenu(src)))

        function createStream (opts) {
          return pull(
            (id
              ? More(api.sbot.createUserStream, opts, ['value', 'sequence'])
              : More(api.sbot.createLogStream, opts)
            ),
            pull.filter(function (data) {
              return data && 'string' === typeof data.value.content
            }),
            pull.map(api.identity.unbox),
            pull.filter(Boolean),
            pull.map(api.message.layout)
          )
        }

        pull(
          createStream({old: false, limit: 10, id: id}),
          HyperMoreStream.top(content)
        )

        pull(
          createStream({reverse: true, live: false, limit: 10, id: id}),
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




