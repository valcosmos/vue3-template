import { makeList } from './inquirer.js'

export default async function () {
  const mode = await makeList({
    choice: [
      { name: 'API', value: 'api' },
      { name: '模式', value: 'default' }
    ],
    message: '请选择代码的模式'
  })

  return mode
}
