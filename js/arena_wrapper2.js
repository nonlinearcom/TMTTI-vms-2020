document.addEventListener("load", init());

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
    const articleContainer = document.getElementById("container");
    await fetchChannel(articleContainer.dataset.channel).then((data) => {
        arenaCMS(data);

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
	let embed, notes

    const articleContainer = document.getElementById("article__content");
    const imageContainer = document.getElementById("article__images");
    channel.contents.reverse().forEach((block) => {
        if (block.class === "Text") {
            if (block.title === "tag") {
                tagList = block.content.trim().split(", ");
            } else if (block.title === "notes") {

                articleContainer.appendChild(noteList(block));
            } else if (block.title === "quote") {
                articleContainer.appendChild(quoteBlock(block));
            } else articleContainer.appendChild(textBlock(block));
        }
        if (block.class === "Image") {
            let image = imageBlock(block);
            image.setAttribute("data-image", imageCount);
            imageContainer.appendChild(image);
            if (block.title === "cover") {
                articleContainer.prepend(imageBlockPlaceholder(imageCount));
            } else
                articleContainer.appendChild(imageBlockPlaceholder(imageCount));
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
            articleContainer.appendChild(embedChannel(block.slug));
        }
    });
    setHeader(channel, tagList, cover);
}

// embed reference

function embedChannel(slug) {
    const embed = document.createElement("iframe");
    embed.src = `https://www.are.na/iulm-vms-2020/${slug}/embed`;
    embed.allowFullscreen = true;
    embed.width = "100%";
    embed.height = "560";
    return embed;
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
    let footer = document.createElement("footer");
    footer.setAttribute("id", "reference-list");
    footer.innerHTML = block.content_html;
    const notes = footer.childNodes[0];
    notes.className = "notes";

    for (const item of notes.children) {
        const number = document.createElement("span");
        number.className = "note";
        number.innerHTML = noteCounter;
        item.prepend(number);
        noteCounter++;
    }
    return footer;
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
    const quote = document.createElement("div");
    quote.className = "quote";
    const quoteContent = document.createElement("h2");
    const quoteAuthor = document.createElement("p");
    quoteAuthor.innerHTML = block.description;
    quoteContent.innerHTML = block.content_html;
    quote.appendChild(quoteContent);
    quote.appendChild(quoteAuthor);
    return quote;
}

function imageBlock(block) {
    const figure = document.createElement("figure");
    const figureImg = document.createElement("img");
    figureImg.src = block.image.original.url;
    figure.appendChild(figureImg);
    //   const figureCaption = document.createElement('figcaption')
    //   figureCaption.innerHTML = block.title
    //   figure.appendChild(figureCaption)
    return figure;
}

function imageBlockPlaceholder(index) {
    const placeholder = document.createElement("div");
	placeholder.setAttribute("data-box", index);
	placeholder.className = 'image-placeholder';
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
