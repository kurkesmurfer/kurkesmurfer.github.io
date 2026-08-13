(function () {
  "use strict";

  var storageKey = "kurkesmurfer-site-theme";
  var theme = "dark";

  try {
    if (window.localStorage.getItem(storageKey) === "light") {
      theme = "light";
    }
  } catch (error) {
    // The default remains usable when browser storage is unavailable.
  }

  document.documentElement.dataset.siteTheme = theme;

  function panelSources(image) {
    var source = image.getAttribute("src");
    var queryIndex = source.indexOf("?");
    var query = queryIndex === -1 ? "" : source.slice(queryIndex);
    var path = queryIndex === -1 ? source : source.slice(0, queryIndex);

    if (path.indexOf("/assets/modules/") === 0) {
      var darkSpaceTime = path.replace(/-light(?=\.png$)/, "");
      return {
        dark: darkSpaceTime + query,
        light: darkSpaceTime.replace(/\.png$/, "-light.png") + query
      };
    }

    if (path.indexOf("/assets/homodyne/") === 0 ||
        path.indexOf("/assets/muse/") === 0) {
      var lightPanel = path.replace(/-dark(?=\.png$)/, "");
      return {
        dark: lightPanel.replace(/\.png$/, "-dark.png") + query,
        light: lightPanel + query
      };
    }

    return null;
  }

  function syncPanelImages() {
    var panelTheme = theme === "light" ? "dark" : "light";
    var images = document.querySelectorAll(
      'img[src^="/assets/modules/"], img[src^="/assets/homodyne/"], img[src^="/assets/muse/"]'
    );

    images.forEach(function (image) {
      var sources = panelSources(image);
      if (sources && image.getAttribute("src") !== sources[panelTheme]) {
        image.setAttribute("src", sources[panelTheme]);
      }
    });
  }

  function updateToggle(button) {
    var nextTheme = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    button.setAttribute(
      "aria-label",
      nextTheme === "light"
        ? "Use light website with dark module panels"
        : "Use dark website with light module panels"
    );
    button.querySelector("span").textContent = nextTheme === "light" ? "Light site" : "Dark site";
  }

  function applyTheme(nextTheme, button) {
    theme = nextTheme;
    document.documentElement.dataset.siteTheme = theme;
    syncPanelImages();

    if (button) {
      updateToggle(button);
    }

    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      // The current page still switches when persistence is unavailable.
    }
  }

  function installToggle() {
    var header = document.querySelector(".header-inner");
    var navigation = header && header.querySelector(".site-nav");

    syncPanelImages();

    if (!header || !navigation) {
      return;
    }

    var actions = document.createElement("div");
    actions.className = "header-actions";
    header.insertBefore(actions, navigation);
    actions.appendChild(navigation);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.innerHTML = '<i aria-hidden="true"></i><span></span>';
    updateToggle(button);
    button.addEventListener("click", function () {
      applyTheme(theme === "dark" ? "light" : "dark", button);
    });
    actions.appendChild(button);
  }

  function installPluginMenus() {
    var menus = document.querySelectorAll("details.plugin-menu");

    document.addEventListener("click", function (event) {
      menus.forEach(function (menu) {
        if (menu.open && !menu.contains(event.target)) {
          menu.removeAttribute("open");
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }
      menus.forEach(function (menu) {
        if (menu.open) {
          menu.removeAttribute("open");
          menu.querySelector("summary").focus();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      installToggle();
      installPluginMenus();
    }, { once: true });
  } else {
    installToggle();
    installPluginMenus();
  }
}());
