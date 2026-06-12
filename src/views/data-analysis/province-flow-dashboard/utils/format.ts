export function formatTons(value: number): string {
  return value.toFixed(2) + ' 吨'
}

export function formatTickets(value: number): string {
  return Math.round(value).toString() + ' 票'
}

export function formatPercent(value: number | null): string {
  if (value === null) return '--'
  return (value * 100).toFixed(2) + '%'
}

export function formatSignedDifference(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return sign + value.toFixed(2)
}

export function formatFlowKey(flowKey: string): string {
  return flowKey.replace('-', ' → ')
}
