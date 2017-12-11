var h = require('hyperscript')
exports.gives = {
  app: { view: true, viewMenu: true }
}

exports.needs = {
  compose: { text: 'first' },
  confirm: { show: 'first' }
}

exports.create = function (api) {
  return { app: {
    view: function (path) {
      if(path !== 'compose') return
      var meta = {type: 'post'} //completely new message
      return api.compose.text(meta, {path: path}, function (content, context, cb) {
        api.confirm.show(content, context, cb)
      })
    },
    viewMenu: function (src) {
      if(src == 'public')
        return h('a', {href: 'compose'}, 'compose')
    }
  }}
}


