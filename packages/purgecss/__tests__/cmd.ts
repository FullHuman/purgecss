import path from 'path'
import { spawn, SpawnOptionsWithoutStdio } from 'child_process'

const purgeCSSExecutable = path.resolve(__dirname, "./../bin/purgecss.js");

function spawnCommand(command: string, options?: SpawnOptionsWithoutStdio) {
  let file = '/bin/sh'
  let args: string[] = ['-c', command]
  if (process.platform === 'win32') {
    file = 'cmd.exe';
    args = ['/s', '/c', '"' + command + '"'];
    // options = util._extend({}, options);
    if (options) options.windowsVerbatimArguments = true;
  }
  return spawn(file, args, options);
}

export function runCLI(args = '', cwd = process.cwd()): Promise<string> {
    const isRelative = cwd[0] !== '/'
    if (isRelative) {
      cwd = path.resolve(__dirname, cwd)
    }
  
    return new Promise((resolve, reject) => {
      let stdout = ''
      let stderr = ''
      const command = `${purgeCSSExecutable} ${args}`
      const child = spawnCommand(command, {cwd})
  
      child.on('error', error => {
        reject(error)
      })
  
      child.stdout.on('data', data => {
        stdout += data.toString()
      })
  
      child.stderr.on('data', data => {
        stderr += data.toString()
      })
  
      child.on('close', () => {
        if (stderr) {
          reject(stderr)
        } else {
          resolve(stdout)
        }
      })
    })
  }