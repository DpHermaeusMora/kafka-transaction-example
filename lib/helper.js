const createFile = (fileName) => {
  const fileSize = (Math.floor(Math.random() * 10) + 1) * 1024 ** 2;
  const filePath = `/home/tester/videos/${fileName}.mp4`
  return {
    fileSize,
    filePath
  }
}

const createPrice = (fileSize) => {
  return Math.round((fileSize / 1024 / 1024) * 1.5)
}

module.exports = {
    createFile,
    createPrice
}