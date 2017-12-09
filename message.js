var h = require('hyperscript')
var ago = require('nice-ago')
exports.needs = {
  message: { render: 'first', action: 'map', meta: 'map'},
  avatar: {image: 'first', name: 'first'},
}

exports.gives = {
  message: {action: true, meta: true, layout: true}
}

exports.create = function (api) {
  function noop () {}
  return {
    message: {
      //TODO: implement a "optional" thing for depject so don't get errors when
      //a give isn't actually needed.
      //call the layout and add to the DOM.
      action: noop,
      meta: noop,

      layout: function (data, context) {
        return h('div.message', [
          h('div.side',
            h('div.Avatar',
              h('a', {href: data.value.author},
                api.avatar.image(data.value.author),
              ),
              h('a', {href: data.value.author},
                api.avatar.name(data.value.author)
              ),
            ),
            h('a', {href: data.key}, ago(Date.now(), data.value.timestamp)),
          ),
          h('div.message__wrapper',
            h('div.MessageMeta', api.message.meta(data, context)),
            api.message.render(data.value),
            h('div.Message__actions', api.message.action(data, context))
          )
        ])
      }
    }
  }
}


