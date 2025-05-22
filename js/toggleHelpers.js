export function toggleAllDetails() {
  const detailsList = document.querySelectorAll('.event-details');
  const shouldOpen = Array.from(detailsList).some(d => !d.open);
  detailsList.forEach(d => (d.open = shouldOpen));
}
