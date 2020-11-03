let channels = [
	'what-we-talk-about-when-we-talk-about-deepfake-5xpvwtjxgmk',
	'ultra-touch-in-the-disembodied-era',
	'this-meme-is-not-funny',
	'arbeiter-illustrierte-zeitung-1924-1933',
	'pandemic-cinema',
	'marcia-di-esculapio',
	'blogging-memory-sharing-healing'
]

document.addEventListener('load', init())

async function init() {
  await fetchChannel('demo-img').then((data) => getChannelImages(data))
  await fetchGroup('iulm-vms-2020').then((data) => getChannelList(data))
}

// FETCH

// channel

async function fetchChannel(slug) {
  const channel = await fetch(
    `https://api.are.na/v2/channels/${slug}?v=${Math.random()}`
  )
  return await channel.json()
}

// group

async function fetchGroup(slug) {
  const channel = await fetch(`https://api.are.na/v2/groups/${slug}/channels`)
  return await channel.json()
}

// BUILD SECTIONS

function getChannelImages(channel) {
  const imageContainer = document.getElementById('channel-images')
  const blocks = channel.contents.filter((block) => block.image)
  blocks.forEach((block) => {
    imageContainer.appendChild(imageBlock(block))
  })
}

function getArticlesList(channel) {
  const articlesContainer = document.getElementById('channel-contents')
  channel.contents.forEach((block) => {
    if (block.class === 'Channel') {
      articlesContainer.appendChild(channelBlock(block))
    }
  })
}

function getChannelList(group) {
  const articlesContainer = document.getElementById('channel-contents')
  group.channels.forEach((block) => {
    if (block.class === 'Channel' && channels.includes(block.slug)) {
      articlesContainer.appendChild(channelBlock(block))
    }
  })
}

// BLOCKS

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
  figureImg.src = block.image.original.url
  figureCaption.innerHTML = block.title
  figure.appendChild(figureImg)
  figure.appendChild(figureCaption)
  return figure
}

function channelBlock(block) {
  const card = document.createElement('div')
  card.className = 'article-card'
  const cardTitle = document.createElement('h2')
  cardTitle.className = 'card--title'
  const cardDescription = document.createElement('h3')
  cardDescription.className = 'card--description'
  const cardAuthor = document.createElement('p')
  cardAuthor.className = 'card--author'

  cardTitle.innerHTML = block.title
  cardDescription.innerHTML = block.metadata.description

  const author = block.user.full_name
  let collaborators = ''
  if (block.collaboration) {
    collaborators =
      ', ' +
      block.collaborators
        .map((collaborator) => collaborator.full_name)
        .join(', ')
  }

  cardAuthor.innerHTML = author + collaborators

  card.appendChild(cardTitle)
  card.appendChild(cardDescription)
  card.appendChild(cardAuthor)
  return card
}

// function xhttpFetch(slug) {
//   const xhttp = new XMLHttpRequest()
//   xhttp.onreadystatechange = function() {
//     if (this.readyState === 4 && this.status === 200) {
//       const fullChannel = JSON.parse(this.responseText)
//       console.log(fullChannel)
//       getChannelContents(fullChannel)
//       getChannelImages(fullChannel)
//     }
//   }
//   xhttp.open(
//     'GET',
//     `https://api.are.na/v2/channels/${slug}?v=${Math.random()}`,
//     true
//   ) // random is to avoid cache and fetch new blocks
//   xhttp.send()
// }

// function arenaCMS(channel) {
//   const container = document.getElementById('container')
//   channel.contents.reverse().forEach((block) => {
//     if (block.class === 'Text') container.appendChild(textBlock(block))
//     if (block.image) container.appendChild(imageBlock(block))
//   })
// }

// function getChannelContents(channel) {
// 	const textContainer = document.getElementById('channel-contents')
// 	const blocks = channel.contents.filter((block) => block.class === 'Text')
// 	blocks.forEach((block) => {
// 	  textContainer.appendChild(textBlock(block))
// 	})
//   }
