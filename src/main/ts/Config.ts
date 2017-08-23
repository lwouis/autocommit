export interface Config {
  /** <ist of absolute paths of the files/folders to watch (recursively)
   * e.g.  ["/path/config.conf", "/path/config-directory/"] */
  filesToWatch: string[]
  /** Absolute path to the Git repository where the files are copied and committed
   * e.g. /path/git_clones/repo */
  destinationRepo: string
  /** Name of the remote on the Git repository where the files are copied and committed
   * e.g. "origin" */
  remote: string
  /** Git references
   * e.g. "refs/heads/master:refs/heads/master" */
  refs: string
}
