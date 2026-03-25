export class RateLimiter {
  private tokens: number
  private maxTokens: number
  private refillRate: number // tokens per ms
  private lastRefill: number

  constructor(requestsPerSecond: number) {
    this.maxTokens = requestsPerSecond
    this.tokens = requestsPerSecond
    this.refillRate = requestsPerSecond / 1000
    this.lastRefill = Date.now()
  }

  async acquire(): Promise<void> {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }

    const waitMs = Math.ceil((1 - this.tokens) / this.refillRate)
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.refill()
    this.tokens -= 1
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
  }
}
