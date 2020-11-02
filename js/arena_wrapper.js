document.addEventListener('load', init())

function init() {
  const articleContainer = document.getElementById('container')
  fetchContent(articleContainer.dataset.channel)
}

function fetchContent(slug) {
  const xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const fullChannel = JSON.parse(this.responseText)
      // TODO: move getChannelInfo & arenaCMS in init() to reuse fetchContent function
      getChannelInfo(fullChannel)
      arenaCMS(fullChannel)
      return fullChannel
    }
  }
  xhttp.open(
    'GET',
    `https://api.are.na/v2/channels/${slug}?v=${Math.random()}`,
    true
  ) // random is to avoid cache and fetch new blocks
  xhttp.send()
}

function arenaCMS(channel) {
  const container = document.getElementById('container')
  channel.contents.reverse().forEach((block) => {
    if (block.class === 'Text') container.appendChild(textBlock(block))
    if (block.image) container.appendChild(imageBlock(block))
  })
}

function textBlock(block) {
  const section = document.createElement('div')
  const sectionTitle = document.createElement('h3')
  const sectionContent = document.createElement('p')
  sectionTitle.innerHTML = block.title
  sectionContent.innerHTML = block.content_html
  section.appendChild(sectionTitle)
  section.appendChild(sectionContent)
  return section
}

function imageBlock(block) {
  const figure = document.createElement('figure')
  const figureImg = document.createElement('img')
  const figureCaption = document.createElement('figcaption')
  figureImg.src = block.image.display.url
  figureCaption.innerHTML = block.title
  figure.appendChild(figureImg)
  figure.appendChild(figureCaption)
  return figure
}

function getChannelInfo(channel) {
  const title = document.createElement('h1')
  title.innerHTML = channel.title
  const author = channel.user.full_name
  let collaborators = ''
  if (channel.collaboration) {
    collaborators =
      ', ' +
      channel.collaborators
        .map((collaborator) => collaborator.full_name)
        .join(', ')
  }
  const subtitle = document.createElement('h2')
  subtitle.innerHTML = author + collaborators
  const pageInfo = document.getElementById('channel-info')
  pageInfo.appendChild(title)
  pageInfo.appendChild(subtitle)
}

// ---

// function getChannelContents(channel) {
//   const textContainer = document.getElementById('channel-contents')
//   const blocks = channel.contents.filter((block) => block.class === 'Text')
//   blocks.forEach((block) => {
//     textContainer.appendChild(textBlock(block))
//   })
// }

// function getChannelImages(channel) {
//   const imageContainer = document.getElementById('channel-images')
//   const blocks = channel.contents.filter((block) => block.image !== null)
//   blocks.forEach((block) => {
//     imageContainer.appendChild(imageBlock(block))
//   })
// }
