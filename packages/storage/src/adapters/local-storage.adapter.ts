import { join } from 'path'
import { Readable } from 'stream'

import { Logger, NotImplementedException } from '@nestjs/common'
import fse from 'fs-extra'

import { StorageDriverContract } from '../contracts'
import { FileMetaData, LocalStorageAdapterOptions } from '../interfaces'
import { AbstractAdapter } from './abstract.adapter'

import ReadableStream = NodeJS.ReadableStream

const METADATA_FILE_PREFIX = '__meta__'

export class LocalStorageAdapter extends AbstractAdapter implements StorageDriverContract {
  private readonly basePath: string

  public constructor(
    private readonly options: LocalStorageAdapterOptions,
    private readonly logger: Logger,
  ) {
    super()
    this.basePath = this.options.basePath

    fse.ensureDirSync(this.basePath)

    const stats: fse.Stats = fse.lstatSync(this.basePath)
    if (stats.isSymbolicLink()) {
      this.basePath = fse.realpathSync(this.basePath)
    }

    try {
      fse.accessSync(this.basePath, fse.constants.R_OK | fse.constants.W_OK)
    } catch (error) {
      throw new Error(
        `LocalStorageAdapter: base path "${this.basePath}" is not readable or writable.`,
      )
    }

    this.logger.setContext(LocalStorageAdapter.name)
    this.logger.log('LOCAL Storage Disk initialized')
  }

  public async createBucket(bucket: string): Promise<void> {
    await fse.ensureDir(join(this.basePath, bucket))
  }

  public async putObject(
    bucket: string,
    id: string,
    content: Buffer | Readable,
    metadata?: FileMetaData,
  ): Promise<string> {
    await this.createBucket(bucket)

    const path = this.getFilePath(bucket, id)
    if (content instanceof Buffer) {
      fse.writeFileSync(path, content)
    } else {
      const writeStream = fse.createWriteStream(path)
      content.pipe(writeStream)
    }

    if (metadata) {
      fse.writeJSONSync(this.getMetaFilePath(bucket, id), metadata)
    }

    return id
  }

  public async getObjectStream(bucket: string, id: string): Promise<ReadableStream> {
    const fileBuffer = await this.getObject(bucket, id)
    const readable = new Readable()
    readable.push(fileBuffer)
    readable.push(null)

    return readable
  }

  public async getObject(bucket: string, id: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fse.readFile(this.getFilePath(bucket, id), (error, data) => {
        if (error) {
          reject(`The requested file does not exist: ${bucket}/${id}`)
        } else {
          resolve(data)
        }
      })
    })
  }

  public async deleteObject(bucket: string, id: string): Promise<boolean> {
    return new Promise(resolve => {
      fse.removeSync(this.getMetaFilePath(bucket, id))
      fse.remove(this.getFilePath(bucket, id), error => {
        resolve(!!error)
      })
    })
  }

  public async getMetaData(bucket: string, id: string): Promise<FileMetaData | null> {
    return new Promise(resolve => {
      fse.readFile(this.getMetaFilePath(bucket, id), (error, data) => {
        resolve(!error ? JSON.parse(data.toString()) : null)
      })
    })
  }

  public getUploadUrl(): Promise<string> {
    throw new NotImplementedException(
      'Local Storage does not have getUploadUrl() functionality.',
    )
  }

  public getDownloadUrl(): Promise<string> {
    throw new NotImplementedException(
      'Local Storage does not have getDownloadUrl() functionality.',
    )
  }

  private getFilePath(bucket: string, id: string): string {
    return join(this.basePath, bucket, id)
  }

  private getMetaFilePath(bucket: string, id: string): string {
    return join(this.basePath, bucket, `${METADATA_FILE_PREFIX}${id}`)
  }
}
