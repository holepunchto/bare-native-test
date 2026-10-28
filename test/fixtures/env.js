console.log('1..1')
console.log(
  require('bare-env').BARE_NATIVE_TEST === 'env' ? 'ok 1 - sees env' : 'not ok 1 - sees env'
)
