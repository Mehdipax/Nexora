export function shortenAddress(address: string, fallback = '') {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : fallback;
}

export function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
