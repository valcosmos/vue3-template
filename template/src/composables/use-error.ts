import { notification } from 'ant-design-vue'
import { AxiosError } from 'axios'
export const useError = (err: AxiosError) => {
  console.log({ ...err })
  if (err.name === 'CanceledError') return
  notification.error({
    message:
      err?.message || err.response?.status + ' ' + err.response?.statusText,
    // description: err.response?.data.msg
    description: err.name || err.response?.statusText
  })
}
