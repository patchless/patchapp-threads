var pull = require('pull-stream')
var sort = require('ssb-sort')
var ref = require('ssb-ref')
var h = require('hyperscript')
var Obv = require('obv')
var ssbThread = require('ssb-thread')
var markdown = require('ssb-marked')

function once (cont) {
  var ended = false
  return function (abort, cb) {
    if(abort) return cb(abort)
    else if (ended) return cb(ended)
    else
      cont(function (err, data) {
        if(err) return cb(ended = err)
        ended = true
        cb(null, data)
      })
  }
}

exports.needs = {
  sbot: {
    get: 'first',
    links: 'first'
  },
  message: {layout: 'first'},
  identity: { unbox: 'first' },
  compose: { text: 'first' },
  confirm: { show: 'first' },
  app: { viewMenu: 'map' }
}

exports.gives = {
  app: {view: true},
  message: { meta: true }
}

exports.create = function (api) {

  var unbox = api.identity.unbox
  var getThread = ssbThread.bind(null, api.sbot, unbox)

  return {app: {view: function (id) {
    if(!ref.isMsg(id)) return

    var obv = Obv()
    getThread(id, obv.set)

    var meta = {
      type: 'post',
      root: id,
      branch: id //mutated when thread is loaded.
    }

    var content = h('div.patchthreads__content')
    var container = h('div.patchthreads__container',
      content,
      api.compose.text(meta, {path: id}, function (content, context, cb) {
        api.confirm.show(content, context, cb)
      })
    )

    var rendered = {}
    obv(function (thread) {
      //RENDER, and INSERT into the correct order...

      var branches = sort.heads(thread)
      meta.branch = branches.length > 1 ? branches : branches[0]
      meta.root = thread[0].value.content.root || thread[0].key
      meta.channel = thread[0].value.content.channel || undefined

      var recps = thread[0].value.content.recps

      var priv = thread[0].value['private']
      if(priv) {
        if(recps)
          meta.recps = recps
        else
          meta.recps = [thread[0].value.author, self_id]
      }

      var children = container.children
      thread.forEach(function (data, i) {
        if(!rendered[data.key]) {
          content.appendChild(rendered[data.key] = api.message.layout(data))
        }
      })

      //resort children to ensure it's in the right order.
      //there has got to be a better way to do this.
      for(var i = 0; i < thread.length; i++)
        content.appendChild(rendered[thread[i].key])
    })

    return container

  }},
    message: { meta:
      function (data, context) {
        if(data && data.value.content.root)
          return h('a', 'reply', {href: data.value.content.root})
    }}
  }
}
