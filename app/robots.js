// Zabrani svim pretraživačima da indeksiraju sajt
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
