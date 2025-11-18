export class KeepAliveUtil {
  private static instance: KeepAliveUtil
  private intervalId: NodeJS.Timeout | null = null
  private readonly PING_INTERVAL = 10 * 60 * 1000 // 10 minutes

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): KeepAliveUtil {
    if (!KeepAliveUtil.instance) {
      KeepAliveUtil.instance = new KeepAliveUtil()
    }
    return KeepAliveUtil.instance
  }

  public startKeepAlive(serverUrl: string): void {
    if (this.intervalId) {
      return // Already running
    }

    const pingServer = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/keep-alive`)
        const data = await response.json()
        console.log('Keep-alive ping successful:', data.timestamp)
      } catch (error) {
        console.error('Keep-alive ping failed:', error)
      }
    }

    // Initial ping
    pingServer()

    // Set up interval
    this.intervalId = setInterval(pingServer, this.PING_INTERVAL)
  }

  public stopKeepAlive(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}