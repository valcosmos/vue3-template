// your url write here
const urls = {
  dev: '',
  prod: ''
}

export const baseUrl =
  process.env.NODE_ENV === 'development' ? urls.dev : urls.prod

export const publicPath = [/^\/user\/login/, /^\/user\/register/]
