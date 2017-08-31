import * as winston from 'winston'
import * as fs from 'fs-extra'
import * as chokidar from 'chokidar'
import * as nodegit from 'nodegit'
import {Config} from './Config'

class AutoCommit {
  public static async main() {
    try {
      AutoCommit.CONFIG = await fs.readJson(__dirname + '/../resources/Config.json')
      AutoCommit.REPO = await nodegit.Repository.open(AutoCommit.CONFIG.destinationRepo)
      chokidar.watch(AutoCommit.CONFIG.filesToWatch)
          .on('add', path => AutoCommit.add(path))
          .on('change', path => AutoCommit.update(path))
          .on('unlink', path => AutoCommit.remove(path))
          .on('unlinkDir', path => AutoCommit.remove(path))
          .on('error', error => { throw error })
    } catch (error) {
      winston.error(error)
    }
  }

  private static CONFIG: Config
  private static REPO

  private static async add(path) {
    const destinationPath = AutoCommit.destinationPath(path, 'added: ')
    await fs.ensureDir(destinationPath)
    await fs.copy(path, destinationPath)
    await this.gitAddAllAndCommitAndPush()
  }

  private static async update(path) {
    await fs.copy(path, AutoCommit.destinationPath(path, 'updated: '))
    await this.gitAddAllAndCommitAndPush()
  }

  private static async remove(path) {
    await fs.remove(AutoCommit.destinationPath(path, 'removed: '))
    await this.gitAddAllAndCommitAndPush()
  }

  private static async gitAddAllAndCommitAndPush() {
    const index = await AutoCommit.REPO.refreshIndex()
    await index.addAll()
    await index.write()
    const oid = await index.writeTree()
    const reference = await nodegit.Reference.nameToId(AutoCommit.REPO, 'HEAD')
    const parent = await AutoCommit.REPO.getCommit(reference)
    await AutoCommit.REPO.createCommit('HEAD', AutoCommit.REPO.defaultSignature(), AutoCommit.REPO.defaultSignature(),
        'Autocommit ' + new Date(), oid, [parent])
    const remote = await AutoCommit.REPO.getRemote(AutoCommit.CONFIG.remote)
    remote.connect(nodegit.Enums.DIRECTION.PUSH)
    remote.push([AutoCommit.CONFIG.refs], {
      callbacks: {
        credentials: (url, userName) => nodegit.Cred.sshKeyFromAgent(userName),
      },
    })
  }

  private static destinationPath(path: string, logPrefix: string): string {
    winston.info(logPrefix, path)
    return AutoCommit.CONFIG.destinationRepo + path
  }
}
