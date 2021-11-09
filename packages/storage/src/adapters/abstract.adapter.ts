/**
 * Extend this class to add more adapters
 */
export abstract class AbstractAdapter {
  protected buckets: string[] = []

  protected async streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = []

      readableStream.on('error', reject)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readableStream.on('data', (chunk: any) => buffers.push(chunk))
      readableStream.on('end', () => resolve(Buffer.concat(buffers)))
    })
  }
}
