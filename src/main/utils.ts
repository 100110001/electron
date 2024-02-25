import { dialog } from 'electron'
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import lodash from 'lodash'

/**
 * 获取文件路径
 * @param config 配置参数
 * @returns 文件路径
 */
export async function handleSelectFile(config?: unknown) {
  const { canceled, filePaths } = await dialog.showOpenDialog(
    lodash.merge(
      {
        properties: ['multiSelections'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
          { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
          { name: 'Custom File Type', extensions: ['as'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      },
      config
    )
  )
  if (!canceled) {
    return filePaths
  }
  return []
}

/**
 * 保存Xlsx
 * @param data
 */
export function handleXlsxSave(data) {
  // console.log('handleFileSave', event, header, body)
  // https://juejin.cn/post/7065126114238136356#heading-7
  const { header, body, title = '保存文件', defaultPath = '未命名.xlsx', format = 'xlsx' } = data

  return new Promise((resolve, reject) => {
    dialog
      .showSaveDialog({
        title,
        defaultPath,
        filters: [{ name: 'All Files', extensions: [format] }]
      })
      .then((res: { filePath?: string }) => {
        if (!res.filePath) return

        // 表头数据：官方文档中的描述：converts an array of arrays of JS data to a worksheet.
        const headerWs = XLSX.utils.aoa_to_sheet(header)
        // console.log(JSON.stringify(body) );

        // 定义 worksheet 的格式
        const ws = XLSX.utils.sheet_add_json(headerWs, body, {
          skipHeader: true,
          origin: 'A2'
        })

        /* 新建空workbook，然后加入worksheet */
        const wb = XLSX.utils.book_new()

        // 往 workbook 中加入worksheet，可以自定义下载之后的sheetname
        XLSX.utils.book_append_sheet(wb, ws, 'sheetName')

        XLSX.writeFile(wb, res.filePath, {
          bookType: format, // Type of Workbook, default "xlsx"
          bookSST: true // Generate Shared String Table **, default false
        })
        resolve({ ok: 'ok' })
      })
      .catch((error) => {
        reject(error)
      })
  })
}

/**
 * 复制文件夹及其内容的函数
 * @param source 原始路径
 * @param target 目标路径
 */
export function copyFolderRecursiveSync(source: string, target: string) {
  const files = fs.readdirSync(source)
  files.forEach(function (file) {
    const curSource = path.join(source, file)
    const curDest = path.join(target, file)
    if (fs.lstatSync(curSource).isDirectory()) {
      if (!fs.existsSync(curDest)) {
        fs.mkdirSync(curDest)
      }
      copyFolderRecursiveSync(curSource, curDest)
    } else {
      fs.copyFileSync(curSource, curDest)
    }
  })
}

/**
 * console 展示进度条
 * @param progress 进度 小数
 */
export function drawProgressBar(progress: number) {
  const progressBarLength = 20
  const progressChars = Math.round(progress * progressBarLength)
  const progressBar = '█'.repeat(progressChars) + '-'.repeat(progressBarLength - progressChars)
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
  process.stdout.write(`[${progressBar}] ${Math.round(progress * 100)}%`)
}

/**
 * 比对版本号
 * @param version1 1.0.0 版本号
 * @param version2 1.0.1 版本号
 * @returns
 */
export function cersionComparison(version1, version2) {
  const currentVersion = version1.split('.')
  const targetVersion = version2.split('.')

  // 比对两个版本号，如果前两个版本号高的话，就全量更新
  // 如果第三个版本号高的话，就资源更新

  for (let i = 0; i < currentVersion.length; i++) {
    const v1Part = parseInt(currentVersion[i])
    const v2Part = parseInt(targetVersion[i])
    console.log(v1Part, v2Part)

    if (v1Part < v2Part) {
      if (i == 0 || i == 1) {
        return 'client'
      } else if (i == 2) {
        return 'resource'
      }
    }
  }
  return
}
