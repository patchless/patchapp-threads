var h = require('hyperscript')
var isFeed = require('ssb-ref').isFeed
var isArray = Array.isArray

exports.gives = {
  app: { view: true, viewMenu: true },
  avatar: { action: true }
}

exports.needs = {
  compose: { text: 'first' },
  confirm: { show: 'first' }
}

exports.create = function (api) {
  return { app: {
    view: function (path) {
      var recps
      if(!/^compose/.test(path)) return
      if(path.length > 7 && path[7] != '/') return

      var at = path.substring(8)
      if(isFeed(at)) recps = [at]
      else if(at == 'private') recps = []
      else if (at == '') recps = undefined
      else return

      var meta = {type: 'post', recps: recps } //completely new message
      return api.compose.text(meta, {path: path}, function (content, context, cb) {

        if(content.recps && !content.recps.length)
          return alert('private message without recipients')

        api.confirm.show(content, context, cb)
      })
    },
    viewMenu: function (src) {
      if(src == 'public')
        return h('a', {href: 'compose'}, 'compose')
      if(src == 'private')
        return h('a', {href: 'compose/private'}, 'compose (private)')
      //compose to this id. maybe should use pen + their avatar ?
      if(/^private\//.test(src) && isFeed(src.substring(8)))
        return h('a', {href: 'compose/'+src.substring(8)}, 'compose to')
    }
  },
    avatar: { action: function (id) {
      return h('a', {href: 'compose/'+id}, 'message')
    }}
  }
}




