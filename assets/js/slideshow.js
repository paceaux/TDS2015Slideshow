/*===============
    #SLIDESHOW
===============*/
var slideshow = slideshow || {};
slideshow.namespace = function(ns_string) {
    var parts = ns_string.split('.'),
        parent = slideshow,
        i;
    if (parts[0] === "slideshow") {
        parts = parts.slice(1);
    }
    for (i = 0; i < parts.length; i += 1) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};

/*==========
    #INIT
==========*/

slideshow.namespace('init');
slideshow.init = function() {
    for (var module in this.modules) {
        console.log(module);
        if (this.modules[module].hasOwnProperty('init')) {
            this.modules[module].init();
        }
    }
};

/*================
    #MODULES
===============*/



/*================
    #Navigation
===============*/

slideshow.namespace('modules.navigation');
slideshow.modules.navigation = (function () {
    var public = {},
        currentSlideIndex = 0,  
        getSlideArray, evtCbs,moveHelpers, showSlide, init;

    getSlideArray = function () {
       return  document.querySelectorAll('.slide');
    };
    function setupSlides () {
        var slides = getSlideArray();
        for (var i=0, slide; i< slides.length; i++) {
            slide = slides[i];
            slide.querySelector('.js-slideNum').innerHTML = (i + 1) + ' of ' + slides.length;
            slide.id = 'js-slide--' + i;
            slide.classList.add('js-slide--' + i);
            slide.dataset.slideindex = i;
            if (i === 0) {
                slide.classList.add('ui-current');
                currentSlideIndex = i;
            }

        }
    };

    showSlide = {
        currentSlide: 0,
        gotoSlide : function (i) {
            var rootSlide = document.querySelector('.slides .slide'),
                articleWidth = rootSlide.offsetWidth + rootSlide.style.marginRight,
                currentSlide = document.getElementById('js-slide--' + i);
            rootSlide.style.marginLeft = 0 - (articleWidth * i) + 'px';
            document.querySelector('.ui-current').classList.remove('ui-current');
            currentSlide.classList.add('ui-current');
            history.pushState(currentSlide.dataset.title, "slide " + i, '#' + currentSlide.dataset.title.replace(' ', '-'))
        },
        next: function () {
            if (this.currentSlide < slideshow.modules.navigation.getSlideCount-1) this.currentSlide++;
            this.gotoSlide(this.currentSlide);
        },
        prev: function () {
            if (this.currentSlide > 0) this.currentSlide--;
            this.gotoSlide(this.currentSlide)
        }
    };
    evtCbs = {
        toggleFullscreen: function () {
          if (!document.fullscreenElement &&    // alternative standard method
              !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
              document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
              document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
              document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            }
          }

        },
        keyup: function (e) {
            e.preventDefault();
            switch (e.which) {
                case 37:
                //left
                slideshow.modules.navigation.navigate.next();
                break;
                case 39:
                //right
                slideshow.modules.navigation.navigate.prev();
                break;
                case 38: 
                //up
                break;
                case 40: 
                //down
                break;
                default:
                break;
            }
        }
    };
    function bindUiEvts () {
        window.addEventListener('keyup', evtCbs.keyup);
    };
    init = function( ) {
        setupSlides();
        bindUiEvts();
    };
    init();
    public = {
        evtCbs: evtCbs,
        slides: getSlideArray(),
        getSlideCount: getSlideArray().length,
        navigate: showSlide,
        currentSlide : currentSlideIndex   
    }
    return public;

})();

/*================
    #NavBuilder
===============*/
slideshow.namespace('modules.navBuilder');
slideshow.modules.navBuilder = (function () {
    var navContainer = document.querySelector('.slideNav'),
        getSlideArray, navItemArray,navItem, init, evtCbs;

    getSlideArray = function () {
       return  document.querySelectorAll('.slide');
    };
    evtCbs = {
        navItemClick: function (e) {
            e.preventDefault();

        }
    };

    navItem = function (slide) {
        var slideLink = document.createElement('a'),
            clonedSlide = slide.cloneNode(true);

        slideLink.href = "#"+ slide.id;
        slideLink.classList.add('slideNav__link');
        clonedSlide.id = '';
        slideLink.appendChild(clonedSlide);

        slideLink.addEventListener('click', evtCbs.navItemClick,false);
        return slideLink;
    };

    function setupNavItems() {
        var slides = getSlideArray();
        for (var i=0,newNavItem, slide; i< slides.length; i++) {
            slide = slides[i];
            newNavItem = navItem(slide);  
            navContainer.appendChild(newNavItem);  
        }
    };
    function bindUiEvts() {

    };
    function init() {
        setupNavItems();
        bindUiEvts();
    };
    init();
    return {};
})();

/*================
    #UIControls
===============*/
slideshow.namespace('modules.ui');
slideshow.modules.ui = (function () {
    var public = {}, evtCbs = {};

    public.toggleSidebar = function () {
        var sidebar = document.querySelector('.slideNav');
        sidebar.classList.toggle('ui-collapsed')
    };
    evtCbs = {
        keydown: function (e) {
            if (e.ctrlKey) {
                console.log(e.which);
                switch (e.which) {
                    case 70:
                    //f
                    slideshow.modules.navigation.evtCbs.toggleFullscreen();
                    break;
                    case 83:
                    //s
                    slideshow.modules.ui.toggleSidebar();
                    break;
                    default: 
                    break;
                }
            }
        },
        popstate: function (e) {
            console.log(e);
        }
    };

    function bindUiEvts() {
        window.addEventListener('keydown', evtCbs.keydown);
        window.addEventListener('popstate', evtCbs.popstate);
        window.addEventListener('hashchange', evtCbs.popstate);
        //to do: add in the history API, Hash by titles or slide number
    };
    function init() {
        bindUiEvts();
    }
    init();
    return public;
})();

slideshow.init();