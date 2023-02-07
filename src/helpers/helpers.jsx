export function formatPrice(number) {
  return `$${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}
