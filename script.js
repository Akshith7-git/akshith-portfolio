const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentYear = document.querySelector("#current-year");
const scrollProgress = document.querySelector(".scroll-progress");
const navbar = document.querySelector(".navbar");

if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}

const revealElements = document.querySelectorAll("[data-reveal]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
    document.documentElement.classList.add("js-ready");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    revealElements.forEach((element) => revealObserver.observe(element));
}

const pageSections = Array.from(document.querySelectorAll("main section[id]"));
let scrollUpdatePending = false;

const updateScrollState = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

    if (scrollProgress) {
        scrollProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    }

    let activeSectionId = "";
    const activationPoint = (navbar?.offsetHeight ?? 0) + 1;

    pageSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationPoint) {
            activeSectionId = section.id;
        }
    });

    navigation?.querySelectorAll("a[href^='#']").forEach((link) => {
        if (link.getAttribute("href") === `#${activeSectionId}`) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    scrollUpdatePending = false;
};

window.addEventListener("scroll", () => {
    if (!scrollUpdatePending) {
        scrollUpdatePending = true;
        window.requestAnimationFrame(updateScrollState);
    }
}, { passive: true });

window.addEventListener("resize", updateScrollState);
updateScrollState();

if (menuToggle && navigation) {
    const closeMenu = () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        navigation.classList.remove("is-open");
    };

    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
        menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
        navigation.classList.toggle("is-open", !isExpanded);
    });

    navigation.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest("a")) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
            closeMenu();
            menuToggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 640) {
            closeMenu();
        }
    });
}
