var h = require('hyperscript')

module.exports = function (items) {
  return items.length ? h('div.patchthreads__viewMenu', items, 
    {style: {
      padding: '10px',
      position: 'absolute',
      right: '20px', bottom: '20px',
      background: 'red'
    }}
  ) : h('span')
}

