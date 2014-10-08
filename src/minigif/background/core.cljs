(ns minigif.background.core
  (:require
    [cemerick.url :as url]
    [chromate.tabs]
    [chromate.windows]
    [cljs.core.async])
  (:require-macros
    [cljs.core.async.macros :refer [go]]))

(defn- show-search-window
  [tab]
  (go
    (<! (chromate.tabs/execute-script (:id tab) {:file "js/inpagesearch.js"}))
    (chromate.windows/create {:url     (-> "search.html"
                                           js/chrome.extension.getURL
                                           url/url
                                           (assoc-in [:query :tab] (:id tab))
                                           str)
                              :top     100
                              :left    (- js/screen.width 225)
                              :width   175
                              :height  (- js/screen.height 200)
                              :focused true
                              :type    :detached_panel})))

(defn- show-add-image-popup
  "Display a new window to allow a user to add tags for an image being added
  to the collection"
  [imgsrc]
  (chromate.windows/create {:url     (-> "popup_newimage.html"
                                         js/chrome.extension.getURL
                                         url/url
                                         (assoc-in [:query :img] imgsrc)
                                         str)
                            :top     100
                            :left    100
                            :width   (- js/screen.width 200)
                            :height  (- js/screen.height 200)
                            :focused true
                            :type    :detached_panel}))

; configure the context menu item to show the Add Image popup for images
(js/chrome.contextMenus.create
  (clj->js {:title    "MiniGIF: Add to collection"
            :id       "add-image"
            :contexts ["image"]
            :onclick  (fn [info tab]
                        (-> info .-srcUrl show-add-image-popup))}))

; when the browser action is clicked, open or re-focus the management console
(js/chrome.browserAction.onClicked.addListener
  (fn [current-tab]
    (go
      (let [options-page-url (js/chrome.extension.getURL "manage.html")
            [tab] (<! (chromate.tabs/query {:url options-page-url}))]
        (if (nil? tab)
          (chromate.tabs/create {:url options-page-url})
          (chromate.tabs/update (:id tab) {:active true}))))))

; when the hotkey command is executed, show the search window
(js/chrome.commands.onCommand.addListener
  (fn [command]
    (case command
      "show-search" (go
                      (let [[tab] (<! (chromate.tabs/query {:active true :currentWindow true}))]
                          (show-search-window tab))))))
