document.addEventListener("load", init());
const articleContainer = document.getElementById("container");

let channels = [
    "this-meme-is-not-funny",
    "ultra-touch-in-the-disembodied-era",
    "pandemic-cinema",
    "what-we-talk-about-when-we-talk-about-deepfake-ojdrxaa0uci",
    "arbeiter-illustrierte-zeitung-1924-1933",
    "la-marcia-di-esculapio",
    "blogging-memory-sharing-healing",
];


// observer

let observer;
let elementsInView = [];
const marginInput = 0;
const thresholdInput = 1;
const wrapper = document.querySelector("[data-wrapper]");
let boxes;

const getOptions = () => {
    return {
        root: wrapper,
        rootMargin: `${marginInput}px`,
        threshold: thresholdInput,
    };
};

const setInViewStyles = (target) => {
    // target.classList.add('is-inview')
    document
        .querySelector(`[data-image="${target.getAttribute("data-box")}"]`)
        .classList.add("is-inview");
};

const setOutOfViewStyles = (target) => {
    target.classList.remove("is-inview");
    document
        .querySelector(`[data-image="${target.getAttribute("data-box")}"]`)
        .classList.remove("is-inview");
};

const onIntersect = (entries) => {
    entries.forEach((entry) => {
        const { target, isIntersecting, intersectionRatio } = entry;
        // console.log(entry)

        if (intersectionRatio >= thresholdInput && isIntersecting) {
            return setInViewStyles(target);
        }
        return setOutOfViewStyles(target);
    });
};

async function init() {

    await fetchChannel(window.location.hash.substring(1)).then((data) => {
    // await fetchChannel(articleContainer.dataset.channel).then((data) => {
		// await fetchChannel('ultra-touch-in-the-disembodied-era').then((data) => {
		arenaCMS(data);

		// nav title and navigation
		// const nav = document.getElementById('nav__title')
		// nav.innerHTML = data.title
		// let currentArticle = channels.indexOf(data.slug)
		// const prev = document.getElementById('prev-article')
		// prev.href = `/article.html#${channels[currentArticle-1]}`
		// const next = document.getElementById('next-article')
		// next.href = `/article.html#${channels[currentArticle+1]}`

		boxes = [...document.querySelectorAll("[data-box]")];
        observer = new IntersectionObserver(onIntersect, getOptions());
        boxes.forEach((el) => {
            observer.observe(el);
        });
    });
}

// FETCH

// channel

async function fetchChannel(slug) {
    const channel = await fetch(
        `https://api.are.na/v2/channels/${slug}?per=50&v=${Math.random()}`
    );
    return await channel.json();
}

// BUILD SECTIONS

// contents

function arenaCMS(channel) {
    let tagList = [];
    let cover = null;
	let imageCount = 0;
	let footer = document.createElement('footer')
	let embed, notes = null

    // const articleContainer = document.getElementById("article__content");
    // const imageContainer = document.getElementById("article__images");
    channel.contents.reverse().forEach((block) => {

		if (block.class === "Text") {
            if (block.title === "tag") tagList = block.content.trim().split(", ");
			else if (block.title === "notes") notes = noteList(block);
			else if (block.title === "quote") articleContainer.appendChild(quoteBlock(block));
            // else articleContainer.appendChild(textBlock(block));
            else articleContainer.innerHTML += block.content_html;
		}

        if (block.class === "Image") {
            let image = imageBlock(block);
			image.setAttribute("data-image", imageCount);
			// image.setAttribute("data-box", imageCount);
            articleContainer.appendChild(image);
            if (block.title === "cover") articleContainer.prepend(imageBlockPlaceholder(block, imageCount));
			else articleContainer.appendChild(imageBlockPlaceholder(block, imageCount));
            imageCount++;
            // }
        }

		if (
            block.class === "Media" &&
            block.source.provider.name === "YouTube"
        ) {
            articleContainer.appendChild(videoBlock(block));
        }

		if (block.class === "Channel") {
            embed = embedChannel(block.slug);
        }
	});

	if (embed) footer.appendChild(embed)
	if(notes) footer.appendChild(notes)
	articleContainer.appendChild(footer)
    setHeader(channel, tagList, cover);
}

// embed reference

function embedChannel(slug) {
	const embedContainer = document.createElement('section')
	embedContainer.className = "embed-content";
	const embed = document.createElement("iframe");
    embed.src = `https://www.are.na/iulm-vms-2020/${slug}/embed`;
    embed.allowFullscreen = true;
    embed.width = "100%";
	embed.height = "560";
	embedContainer.appendChild(embed)
    return embedContainer;
}

// header

function setHeader(channel, tagList, img) {
    const tags = document.createElement("ul");
    tags.className = "tags";

    tagList.forEach((tag) => {
        const li = document.createElement("li");
        li.innerHTML = tag;
        tags.appendChild(li);
    });

    const title = document.createElement("h1");
    title.innerHTML = channel.title;

    const subtitle = document.createElement("h2");
    subtitle.innerHTML = channel.metadata.description;

    const authors = document.createElement("p");
    authors.className = "authors";
    const author = channel.user.full_name;
    let collaborators = "";
    if (channel.collaboration) {
        collaborators =
            ", " +
            channel.collaborators
                .map((collaborator) => collaborator.full_name)
                .join(", ");
    }
    authors.innerHTML = author + collaborators;

    //   const cover = document.createElement('img')
    //   cover.className = 'header__cover'
    //   cover.src = img.image.original.url

    const pageInfo = document.getElementById("channel-info");
    pageInfo.appendChild(tags);
    pageInfo.appendChild(title);
    pageInfo.appendChild(subtitle);
    pageInfo.appendChild(authors);
    //   pageInfo.parentNode.appendChild(cover, pageInfo.nextSibling)
}

// notes

function noteList(block) {
    let noteCounter = 1;
    //   const list = document.getElementById('reference-list')
    let list = document.createElement("section");
    list.setAttribute("id", "reference-list");
    list.innerHTML = block.content_html;
    const notes = list.childNodes[0];
    notes.className = "notes";

    for (const item of notes.children) {
        const number = document.createElement("span");
        number.className = "note";
        number.innerHTML = noteCounter;
        item.prepend(number);
        noteCounter++;
    }
    return list;
}

// BLOCKS

function textBlock(block) {
    const section = document.createElement("section");
    const sectionTitle = document.createElement("h3");
    const sectionContent = document.createElement("div");
    sectionTitle.innerHTML = block.title;
    sectionContent.innerHTML = block.content_html;
    section.appendChild(sectionTitle);
    section.appendChild(sectionContent);
    return section;
}

function quoteBlock(block) {
    const quote = document.createElement("blockquote");
	quote.innerHTML = block.content;

    const quoteAuthor = document.createElement('address');
    quoteAuthor.innerHTML = block.description;
    quote.appendChild(quoteAuthor);
    return quote;
}

function imageBlock(block) {
	const figure = document.createElement("figure");

    const figureImg = document.createElement("img");
    figureImg.src = block.image.original.url;
	figure.appendChild(figureImg);

	if(block.title !== "cover"){
	const figureCaption = document.createElement('figcaption')
	figureCaption.innerHTML = block.title
	figure.appendChild(figureCaption)
	}

    return figure;
}

function imageBlockPlaceholder(block, index) {
    const placeholder = document.createElement("span");
	placeholder.setAttribute("data-box", index);
	placeholder.className = 'image-placeholder';
	// let image = imageBlock(block)
	// placeholder.appendChild(image)
    return placeholder;
}

function videoBlock(block) {
    const video = document.createElement("section");
    video.className = "embed-content";
    video.innerHTML = block.embed.html;
    const frame = video.firstChild;
    frame.width = "100%";
    frame.height = "360";
    return video;
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
