import { DOM, options } from "../../constants";
import { slideUp, slideDown, slideToggle } from "../../lib/utils";

class DropDownMobileMenu {
    #isMenuOpen;
    #menuItemsToggleIcon;

    constructor() {
        if (!DOM.global.body.classList.contains("dropdown-mobile")) {
            return;
        }

        this.#start();
        this.#setupEventListeners();
    }

    #start = () => {
        this.#isMenuOpen = false;

        DOM.mobileMenu.menuItemsHasChildren?.forEach((menuItem) => {
            let span = document.createElement("span");
            span.className = "dropdown-toggle";
            span.setAttribute("tabindex", 0);

            menuItem.getElementsByTagName("a")[0].appendChild(span);
        });

        this.#menuItemsToggleIcon =
            options.sidrDropdownTarget == "link"
                ? document.querySelectorAll("#mobile-dropdown li.menu-item-has-children > a")
                : document.querySelectorAll(".dropdown-toggle");
    };

    #setupEventListeners = () => {
        DOM.mobileMenu.toggleMenuBtn.addEventListener("click", this.#onToggleMenuButtonClick);

        DOM.mobileMenu.navWrapper
            .querySelectorAll('li a[href*="#"]:not([href="#"])')
            .forEach((menuItemLink) => {
                menuItemLink.addEventListener("click", this.#onMenuCloseClick);
            });

        document.addEventListener("click", this.#onMenuCloseClick);

        DOM.mobileMenu.navWrapper.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        window.addEventListener("resize", this.#onWindowResize);

        DOM.mobileMenu.hamburgerBtn?.addEventListener("click", this.#onHamburgerClick);

        this.#menuItemsToggleIcon.forEach((menuItemToggleIcon) => {
            menuItemToggleIcon.addEventListener("click", this.#onMenuItemToggleIcon);
            menuItemToggleIcon.addEventListener("tap", this.#onMenuItemToggleIcon);
        });

        document.addEventListener("keydown", this.#onDocumentKeydown);
    };

    #onToggleMenuButtonClick = (event) => {
        event.stopPropagation();

        slideToggle(DOM.mobileMenu.navWrapper, 500);
        DOM.mobileMenu.toggleMenuBtn.classList.toggle("opened");
        DOM.mobileMenu.hamburgerBtn?.classList.toggle("is-active");
        DOM.mobileMenu.toggleMenuBtn.focus();
    };

    #onMenuCloseClick = (event) => {
        slideUp(DOM.mobileMenu.navWrapper, 200);
        DOM.mobileMenu.toggleMenuBtn.classList.remove("opened");
        DOM.mobileMenu.hamburgerBtn?.classList.remove("is-active");
    };

    #onWindowResize = (event) => {
        if (window.innerWidth >= 960) {
            this.#onMenuCloseClick();
        }
    };

    #onHamburgerClick = (event) => {
        this.#isMenuOpen = !this.#isMenuOpen;
        event.currentTarget.setAttribute("aria-expanded", this.#isMenuOpen);
    };

    #onMenuItemToggleIcon = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const menuItemToggleIcon = event.currentTarget;
        const menuItem =
            options.sidrDropdownTarget == "link"
                ? menuItemToggleIcon.parentNode
                : menuItemToggleIcon.parentNode.parentNode;

        if (!menuItem.classList.contains("active")) {
            DOM.mobileMenu.menuItemsHasChildren.forEach((menuItemHasChildren) => {
                if (
                    menuItem != menuItemHasChildren &&
                    menuItem
                        .oceanParents(".menu-item-has-children")
                        .findIndex((parentMenuItem) => parentMenuItem == menuItemHasChildren)
                ) {
                    menuItemHasChildren.classList.remove("active");
                    slideUp(menuItemHasChildren.lastElementChild, 200);
                }
            });

            menuItem.classList.add("active");
            slideDown(menuItem.lastElementChild, 200);
        } else {
            menuItem.classList.remove("active");
            slideUp(menuItem.lastElementChild, 200);
        }
    };

    /**
     * Trap keyboard navigation in the menu modal.
     */
    #onDocumentKeydown = (event) => {
        if (!DOM.mobileMenu.toggleMenuBtn?.classList.contains("opened")) {
            return;
        }

        const tabKey = event.keyCode === 9;
        const shiftKey = event.shiftKey;
        const escKey = event.keyCode === 27;
        const enterKey = event.keyCode === 13;

        const closeIcon = DOM.mobileMenu.toggleMenuBtn;

        const navElements = DOM.mobileMenu.nav.querySelectorAll("a, span.dropdown-toggle, input, button");

        const navFirstElement = navElements[0];
        const navLastElement = navElements[navElements.length - 1];

        closeIcon.style.outline = "";

        if (escKey) {
            event.preventDefault();
            this.#onMenuCloseClick();
        }

        if (enterKey && document.activeElement.classList.contains("dropdown-toggle")) {
            event.preventDefault();
            document.activeElement.click();
        }

        if (!shiftKey && tabKey && navLastElement === document.activeElement) {
            event.preventDefault();
            closeIcon.style.outline = "1px dashed rgba(255, 255, 255, 0.6)";
            closeIcon.focus();
        }

        if (shiftKey && tabKey && navFirstElement === document.activeElement) {
            event.preventDefault();
            closeIcon.style.outline = "1px dashed rgba(255, 255, 255, 0.6)";
            closeIcon.focus();
        }

        // If there are no elements in the menu, don't move the focus
        if (tabKey && navFirstElement === navLastElement) {
            event.preventDefault();
        }
    };
}

export default DropDownMobileMenu;