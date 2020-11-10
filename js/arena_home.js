document.addEventListener("load", init());


let coverImages = [];
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
    // target.classList.remove('is-inview')
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
    await fetchGroup("iulm-vms-2020").then((data) => {

        getChannelList(data);
        getImageList(coverImages);

        boxes = [...document.querySelectorAll("[data-box]")];
        observer = new IntersectionObserver(onIntersect, getOptions());
        boxes.forEach((el) => {
            observer.observe(el);
        });
    });
}

// FETCH

// channel

// async function fetchChannel(slug) {
//     const channel = await fetch(
//         `https://api.are.na/v2/channels/${slug}?v=${Math.random()}`
//     );
//     return await channel.json();
// }

// group

async function fetchGroup(slug) {
    const channel = await fetch(
        `https://api.are.na/v2/groups/${slug}/channels`
    );
    return await channel.json();
}

// BUILD SECTIONS

function getImageList(blocks) {
    const imageContainer = document.getElementById("channel-images");
    blocks.forEach((block, index) => {
        let image = imageBlock(block);
		image.setAttribute("data-image", index);
		image.style.transform = `scale( ${getRandomIntInclusive('50','100') / 100 } )`
		image.style.transform = `translate( ${getRandomIntInclusive('-25','25')}%, ${getRandomIntInclusive('-50','50')}%)`
		imageContainer.appendChild(image);
    });
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //Il max è incluso e il min è incluso
  }

function getArticlesList(channel) {
    const articlesContainer = document.getElementById("channel-contents");
    channel.contents.forEach((block) => {
        if (block.class === "Channel") {
            articlesContainer.appendChild(channelBlock(block));
        }
    });
}

function getChannelList(group) {
    let channelCount = 0;

	const articlesContainer = document.getElementById("channel-contents");

	channels.forEach(slug => {
		let block = group.channels.find(channel => channel.slug === slug)
		articlesContainer.appendChild(channelBlock(block, channelCount));
		channelCount++;
	})
}

// BLOCKS

function textBlock(block) {
    const section = document.createElement("div");
    const sectionTitle = document.createElement("h3");
    const sectionContent = document.createElement("p");
    sectionTitle.innerHTML = block.title;
    sectionContent.innerHTML = block.content_html;
    section.appendChild(sectionTitle);
    section.appendChild(sectionContent);
    return section;
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

// function svgArrow(){
// 	let arrow = document.createElement('svg')
// 	var path = document.createElementNS("http://www.w3.org/2000/svg", "path");


// }


function channelBlock(block, index) {
    let cover = block.contents.find((content) => content.title === "cover");
    coverImages.push(cover);


	const cardHeader = document.createElement('div')
	cardHeader.className = 'article-card--header'

	const tags = document.createElement("ul");
    tags.className = "tags";
    let tagList = block.contents
        .find((content) => content.title === "tag")
        .content.trim()
        .split(", ");
    if (tagList.length) {
        tagList.forEach((tag) => {
            const li = document.createElement("li");
            li.innerHTML = tag;
            tags.appendChild(li);
		});
		cardHeader.appendChild(tags)
    }

	const arrow = document.createElement('img')
	arrow.src = '/assets/arrow.svg'
	arrow.style.transform = 'rotate(-90deg)'
	arrow.className = 'arrow-link'
	cardHeader.appendChild(arrow);

    const card = document.createElement("div");
    card.className = "article-card";
    card.setAttribute("data-box", index);
    const cardTitle = document.createElement("h2");
    cardTitle.className = "card--title";
    const cardDescription = document.createElement("h3");
    cardDescription.className = "card--description";
    const cardAuthor = document.createElement("p");
    cardAuthor.className = "card--author";


	titleLink = document.createElement('a');
	titleLink.className = "stretched-link"
	titleLink.href = `/article.html#${block.slug}`
	titleLink.innerHTML = block.title;
	cardTitle.appendChild(titleLink)

    // cardTitle.innerHTML = block.title;
    cardDescription.innerHTML = block.metadata.description;

    const author = block.user.full_name;
    let collaborators = "";
    if (block.collaboration) {
        collaborators =
            ", " +
            block.collaborators
                .map((collaborator) => collaborator.full_name)
                .join(", ");
    }

    cardAuthor.innerHTML = author + collaborators;

    cardInfo = document.createElement("div");
    cardInfo.className = "card--info";
    cardInfo.appendChild(cardAuthor);
    cardInfo.appendChild(cardDescription);

	// if (tagList.length) card.appendChild(tags);
	card.appendChild(cardHeader);
    card.appendChild(cardTitle);
    card.appendChild(cardInfo);
    return card;
}

