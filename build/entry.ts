import { glob } from 'glob'
import { resolve } from 'path'

const input: string[] = []
const mainEntry: string[] = []
;(function () {
  // 遍历文件夹中含有main.ts的文件夹路径
  const allEntry = glob.sync('./src/pages/**/index.html')

  console.log('allEntry::', allEntry)
  allEntry.forEach((entry: string) => {
    input.push(resolve(entry))
    mainEntry.push(resolve(entry.replace(/index.html$/, 'main.ts')))
  })
  console.log('input::', input)
  console.log('mainEntry::', mainEntry)
})()
export { input, mainEntry }
