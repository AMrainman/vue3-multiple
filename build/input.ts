import { glob } from 'glob'
import { resolve } from 'path'

const input: string[] = []
;(function () {
  // 遍历文件夹中含有main.ts的文件夹路径
  const allEntry = glob.sync('./src/pages/**/index.html')

  console.log('allEntry::', allEntry)
  allEntry.forEach((entry: string) => {
    const srcArr = entry.replace('./', '')
    input.push(resolve(`${srcArr}`))
  })
  console.log('input::', input)
})()
export { input }