document.addEventListener('load', init())

async function init() {
  const articleContainer = document.getElementById('container')
  await fetchChannel(articleContainer.dataset.channel).then((data) => {
    arenaCMS(data)
  })
}

// FETCH

// channel

async function fetchChannel(slug) {
  const channel = await fetch(
    `https://api.are.na/v2/channels/${slug}?v=${Math.random()}`
  )
  return await channel.json()
}

// BUILD SECTIONS

// contents

function arenaCMS(channel) {
  let tagList = []
  let cover = null
  const container = document.getElementById('container')
  channel.contents.reverse().forEach((block) => {
    if (block.class === 'Text') {
      if (block.title === 'tag') {
        tagList = block.content.trim().split(', ')
      } else if (block.title === 'notes') {
        noteList(block)
      } else container.appendChild(textBlock(block))
    }
    if (block.class === 'Image') {
      if (block.title === 'cover') cover = block
      else container.appendChild(imageBlock(block))
    }
    if (block.class === 'Channel') {
      container.appendChild(embedChannel(block.slug))
    }
  })
  setHeader(channel, tagList, cover)
}

// embed reference

function embedChannel(slug) {
  const embed = document.createElement('iframe')
  embed.src = `https://www.are.na/iulm-vms-2020/${slug}/embed`
  embed.allowFullscreen = true
  embed.width = '100%'
  embed.height = '560'
  return embed
}

// header

function setHeader(channel, tagList, img) {
  const tags = document.createElement('ul')
  tags.className = 'tags'

  tagList.forEach((tag) => {
    const li = document.createElement('li')
    li.innerHTML = tag
    tags.appendChild(li)
  })

  const title = document.createElement('h1')
  title.innerHTML = channel.title

  const subtitle = document.createElement('h2')
  subtitle.innerHTML = channel.metadata.description

  const authors = document.createElement('p')
  authors.className = 'authors'
  const author = channel.user.full_name
  let collaborators = ''
  if (channel.collaboration) {
    collaborators =
      ', ' +
      channel.collaborators
        .map((collaborator) => collaborator.full_name)
        .join(', ')
  }
  authors.innerHTML = author + collaborators

  const cover = document.createElement('img')
  cover.className = 'header__cover'
  cover.src = img.image.original.url

  const pageInfo = document.getElementById('channel-info')
  pageInfo.appendChild(tags)
  pageInfo.appendChild(title)
  pageInfo.appendChild(subtitle)
  pageInfo.appendChild(authors)
  pageInfo.parentNode.insertBefore(cover, pageInfo.nextSibling)
}

// notes

function noteList(block) {
  let noteCounter = 1
  const list = document.getElementById('reference-list')
  list.innerHTML = block.content_html
  const notes = list.childNodes[0]
  notes.className = 'notes'

  for (const item of notes.children) {
    const number = document.createElement('span')
    number.className = 'note'
    number.innerHTML = noteCounter
    item.prepend(number)
    noteCounter++
  }
}

// BLOCKS

function textBlock(block) {
  const section = document.createElement('section')
  const sectionTitle = document.createElement('h3')
  const sectionContent = document.createElement('div')
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
  figureImg.src = block.image.original.url
  figureCaption.innerHTML = block.title
  figure.appendChild(figureImg)
  figure.appendChild(figureCaption)
  return figure
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
