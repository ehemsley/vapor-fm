module.exports = {
  nthOccurrence: function (str, m, i) {
    return str.split(m, i).join(m).length
  },

  countOccurrences: function (str, value) {
    const regExp = new RegExp(value, 'gi')
    return (str.match(regExp) || []).length
  },

  fittingString: function (str, canvas, context, maxWidthPercentage) {
    let maxWidth = canvas.width * maxWidthPercentage
    let width = context.measureText(str).width
    const ellipsis = '...'
    const ellipsisWidth = context.measureText(ellipsis).width
    if (width <= maxWidth) {
      return str
    } else {
      let len = str.length
      while ((width >= (maxWidth - ellipsisWidth)) && (len-- > 0)) {
        str = str.substring(0, len)
        width = context.measureText(str).width
      }
      return str + ellipsis
    }
  }
}
