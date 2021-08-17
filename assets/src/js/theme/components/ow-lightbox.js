import { DOM } from "../../constants";

class OWLightbox {
    constructor() {
        this.start();
    }

    start = async () => {
        if (DOM.body.classList.contains("no-lightbox")) {
            return;
        }

        await this.#addLightboxClass();
        this.#addPhotoSwipeToDOM();
        this.#init();
    };

    #init = () => {
        // Post gallery
        if (document.querySelector(".gallery-format")) {
            this.initPhotoSwipeFromDOM(".gallery-format");
        }

        // Gutenberg Block Gallery
        if (!!document.querySelector(".wp-block-gallery")) {
            this.initPhotoSwipeFromDOM(document.querySelectorAll(".wp-block-gallery"));
        }

        // Class Editor Gallery
        if (!!document.querySelector(".gallery")) {
            this.initPhotoSwipeFromDOM(document.querySelectorAll(".gallery"));
        }

        // Image lightbox
        document.querySelectorAll("a.oceanwp-lightbox")?.forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
            });

            link.querySelector("img").addEventListener("click", this.openLightbox);
        });
    };

    openLightbox = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const pswpElement = document.querySelectorAll(".pswp")[0];
        const link = event.target.parentNode;
        const src = link.getAttribute("href");
        const width = !!link.dataset.width ? Number.parseInt(link.dataset.width) : 1024;
        const height = !!link.dataset.height ? Number.parseInt(link.dataset.height) : 768;

        const imageLightbox = new PhotoSwipe(
            pswpElement,
            PhotoSwipeUI_Default,
            [
                {
                    src: src,
                    w: width,
                    h: height,
                },
            ],
            {
                bgOpacity: 0.85,
                showHideOpacity: true,
                showAnimationDuration: 0,
                hideAnimationDuration: 500,
            }
        );

        imageLightbox.init();
    };

    #addLightboxClass = () => {
        return new Promise((resolve, reject) => {
            let itemsNum = 1;
            const timeout = 3000;

            document
                .querySelectorAll("body .entry-content a, body .entry a, body article .gallery-format a")
                ?.forEach((link, index, array) => {
                    if (!!link.querySelector("img")) {
                        const imageFormats = this.#imageFormats();
                        let imageFormatsMask = 0;

                        imageFormats.forEach((imageFormat) => {
                            imageFormatsMask += String(link.getAttribute("href")).indexOf("." + imageFormat);
                        });

                        if (imageFormatsMask === -13) {
                            link.classList.add("no-lightbox");
                        }

                        const checkClassList = () => {
                            if (
                                !(
                                    link.classList.contains("no-lightbox") ||
                                    link.classList.contains("gallery-lightbox") ||
                                    link.parentNode.classList.contains("gallery-icon") ||
                                    link.classList.contains("woo-lightbox") ||
                                    link.classList.contains("woo-thumbnail") ||
                                    link.parentNode.classList.contains("woocommerce-product-gallery__image") ||
                                    !!link.closest(".wp-block-gallery") ||
                                    link.getAttribute("data-elementor-open-lightbox") ||
                                    link.classList.contains("yith_magnifier_thumbnail") ||
                                    link.classList.contains("gg-link")
                                )
                            ) {
                                link.classList.add("oceanwp-lightbox");
                            }

                            if (!link.classList.contains("no-lightbox")) {
                                if (
                                    link.parentNode.classList.contains("gallery-icon") ||
                                    !!link.closest(".wp-block-gallery")
                                ) {
                                    link.classList.add("gallery-lightbox");
                                }
                            }
                        };

                        if (!!link.dataset.width && !!link.dataset.height) {
                            checkClassList();

                            if (array.length === itemsNum++) {
                                resolve(true);
                            }
                        } else {
                            let timer;
                            const img = new Image();

                            img.onload = function () {
                                clearTimeout(timer);

                                link.setAttribute("data-width", this.naturalWidth);
                                link.setAttribute("data-height", this.naturalHeight);

                                checkClassList();

                                if (array.length === itemsNum++) {
                                    resolve(true);
                                }
                            };

                            img.onerror = img.onabort = () => {
                                clearTimeout(timer);

                                if (array.length === itemsNum++) {
                                    resolve(true);
                                }
                            };

                            timer = setTimeout(function () {
                                itemsNum++;
                            }, timeout);

                            img.src = link.getAttribute("href");
                        }
                    }
                });
        });
    };

    #imageFormats = () => {
        return ["bmp", "gif", "jpeg", "jpg", "png", "tiff", "tif", "jfif", "jpe", "svg", "mp4", "ogg", "webm"];
    };

    #addPhotoSwipeToDOM = () => {
        if (!!document.querySelector(".pswp")) {
            return;
        }

        DOM.body.insertAdjacentHTML(
            "beforeend",
            `<!-- Root element of PhotoSwipe. Must have class pswp. -->
            <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
                <!-- Background of PhotoSwipe. 
                    It's a separate element as animating opacity is faster than rgba(). -->
                <div class="pswp__bg"></div>

                <!-- Slides wrapper with overflow:hidden. -->
                <div class="pswp__scroll-wrap">
                    <!-- Container that holds slides. 
                        PhotoSwipe keeps only 3 of them in the DOM to save memory.
                        Don't modify these 3 pswp__item elements, data is added later on. -->
                    <div class="pswp__container">
                        <div class="pswp__item"></div>
                        <div class="pswp__item"></div>
                        <div class="pswp__item"></div>
                    </div>

                    <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
                    <div class="pswp__ui pswp__ui--hidden">
                        <div class="pswp__top-bar">
                            <!--  Controls are self-explanatory. Order can be changed. -->
                            <div class="pswp__counter"></div>

                            <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
                            <button class="pswp__button pswp__button--share" title="Share"></button>
                            <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                            <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

                            <!-- Preloader demo https://codepen.io/dimsemenov/pen/yyBWoR -->
                            <!-- element will get class pswp__preloader--active when preloader is running -->
                            <div class="pswp__preloader">
                                <div class="pswp__preloader__icn">
                                <div class="pswp__preloader__cut">
                                    <div class="pswp__preloader__donut"></div>
                                </div>
                                </div>
                            </div>
                        </div>

                        <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                            <div class="pswp__share-tooltip"></div> 
                        </div>

                        <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                        </button>

                        <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                        </button>

                        <div class="pswp__caption">
                            <div class="pswp__caption__center"></div>
                        </div>
                    </div>
                </div>
            </div>`
        );
    };

    initPhotoSwipeFromDOM = (gallerySelector) => {
        // trigger when user click on image
        const onImageClick = function (event) {
            const clickedImage = event.target;

            const clickedGalleryLink = closest(clickedImage, function (el) {
                return el.tagName && el.tagName.toUpperCase() === "A" && el.classList.contains("gallery-lightbox");
            });

            if (!clickedGalleryLink) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const gallery = clickedGalleryLink.closest("[data-pswp-uid]");
            const galleryLinks = gallery.querySelectorAll("a.gallery-lightbox");

            for (let index = 0; index < galleryLinks.length; index++) {
                if (galleryLinks[index] == clickedGalleryLink) {
                    openPhotoSwipe(index, gallery, true);
                    break;
                }
            }
        };

        const openPhotoSwipe = function (index, gallery, disableAnimation, fromURL) {
            const pswpElement = document.querySelectorAll(".pswp")[0];
            const photoSwipeItems = getPhotoSwipeItems(gallery);

            // define options (if needed)
            const options = {
                // define gallery index (for URL)
                galleryUID: gallery.getAttribute("data-pswp-uid"),

                getThumbBoundsFn: function (index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    const thumbnail = photoSwipeItems[index].el.getElementsByTagName("img")[0]; // find thumbnail
                    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                    const rect = thumbnail.getBoundingClientRect();

                    return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
                },
            };

            // PhotoSwipe opened from URL
            if (fromURL) {
                if (options.galleryPIDs) {
                    // parse real index when custom PIDs are used
                    // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                    for (let index = 0; index < photoSwipItems.length; index++) {
                        if (photoSwipeItems[index].pid == index) {
                            options.index = index;
                            break;
                        }
                    }
                } else {
                    // in URL indexes start from 1
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            // exit if index not found
            if (isNaN(options.index)) {
                return;
            }

            if (disableAnimation) {
                options.showAnimationDuration = 0;
                options.hideAnimationDuration = 500;
            }

            options.bgOpacity = 0.85;
            options.showHideOpacity = true;

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, photoSwipeItems, options);
            gallery.init();
        };

        // parse slide data (url, title, size ...) from DOM elements
        const getPhotoSwipeItems = function (gallery) {
            const galleryLinks = gallery.querySelectorAll("a.gallery-lightbox");
            const items = [];

            galleryLinks.forEach((galleryLink) => {
                const src = galleryLink.getAttribute("href");
                const width = Number.parseInt(galleryLink.dataset.width) ?? 1024;
                const height = Number.parseInt(galleryLink.dataset.height) ?? 768;

                // create slide object
                let item = {
                    src: src,
                    w: width,
                    h: height,
                };

                if (!!galleryLink.querySelector("img")) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = galleryLink.querySelector("img").getAttribute("src");
                }

                item.el = galleryLink; // save link to element for getThumbBoundsFn
                items.push(item);
            });

            return items;
        };

        // find nearest parent element
        const closest = function closest(el, fn) {
            return el && (fn(el) ? el : closest(el.parentNode, fn));
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        const photoswipeParseHash = function () {
            const hash = window.location.hash.substring(1);
            const params = {};

            if (hash.length < 5) {
                return params;
            }

            const vars = hash.split("&");

            for (let i = 0; i < vars.length; i++) {
                if (!vars[i]) {
                    continue;
                }

                const pair = vars[i].split("=");

                if (pair.length < 2) {
                    continue;
                }

                params[pair[0]] = pair[1];
            }

            if (params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        };

        // loop through all gallery elements and bind events
        const galleryElements = NodeList.prototype.isPrototypeOf(gallerySelector)
            ? gallerySelector
            : document.querySelectorAll(gallerySelector);

        for (let i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute("data-pswp-uid", i + 1);
            galleryElements[i].onclick = onImageClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        const hashData = photoswipeParseHash();
        if (hashData.pid && hashData.gid) {
            openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
        }
    };
}

export default OWLightbox;
