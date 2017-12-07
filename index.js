var pull = require('pull-stream')
var sort = require('ssb-sort')
var ref = require('ssb-ref')
var h = require('hyperscript')
var Obv = require('obv')
var ssbThread = require('ssb-thread')
var markdown = require('ssb-marked')
var base64 = require('base64-url')

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
  avatar: {
    image: 'first', name: 'first'
  },
  sbot: {
    get: 'first',
    links: 'first'
  },
  identity: {
    unbox: 'first'
  }
}

exports.gives = {app: {view: true}}

exports.create = function (api) {

  function unbox (msg) {
    return 'string' === typeof msg.value.content ? api.identity.unbox(msg) : msg
  }

  var getThread = ssbThread.bind(null, api.sbot, unbox)

  return {app: {view: function (id) {
    if(ref.isMsg(id)) {
      var obv = Obv()
      getThread(id, obv.set)

      var meta = {
        type: 'post',
        root: id,
        branch: id //mutated when thread is loaded.
      }

      var content = h('div.patchthreads__content')
      var container = h('div.patchthreads__container', content)

      var rendered = {}
      obv(function (thread) {
        //RENDER, and INSERT into the correct order...

        var branches = sort.heads(thread)
        meta.branch = branches.length > 1 ? branches : branches[0]
        meta.root = thread[0].value.content.root || thread[0].key
        meta.channel = thread[0].value.content.channel

//        if (meta.channel) {
//          const channelInput = composer.querySelector('input')
//          channelInput.value = `#${meta.channel}`
//          channelInput.disabled = true
//        }

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
            var el = rendered[data.key] =
              h('div.Message',
                h('a.avatar', {href: data.value.author},
                  api.avatar.image(data.value.author),
                  api.avatar.name(data.value.author)
                ),
                data.value.content.text ?
                h('div.markdown', {
                  innerHTML: markdown(data.value.content.text)
                })
                : null
              )
            content.appendChild(el)
          }
        })
        //resort children to ensure it's in the right order.
        //there has got to be a better way to do this.
        for(var i = 0; i < thread.length; i++)
          container.appendChild(rendered[thread[i].key])
      })

      return container
    }
  }}}
}






