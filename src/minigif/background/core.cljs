(ns minigif.background.core
  (:require
    [minigif.common.images]
    [cljs.core.async])
  (:require-macros
    [cljs.core.async.macros :refer [go]]))

(defn- cb->chan
  [f & args]
  (let [rc (cljs.core.async/chan)]
    (apply f (conj
               (vec args)
               #(do
                  (when-not (nil? %)
                    (cljs.core.async/put! rc %))
                  (cljs.core.async/close! rc))))
    rc))

(defn- send-message-retry
  [tabid msg]
  (go
    (<! (cljs.core.async/timeout 500)) ; TODO find a better way to send messages to tabs
    (loop []
      (js/console.debug "Sending message" msg "to tab" tabid)
      (let [resp (<! (cb->chan js/chrome.tabs.sendMessage tabid (clj->js msg)))]
        (js/console.debug "response" resp js/chrome.runtime.lastError
                          (nil? resp)
                          (nil? js/chrome.runtime.lastError)
                          )
        (when (and (nil? resp) (not (nil? js/chrome.runtime.lastError)))
          (recur))))))

(defn- get-tabs
  [query]
  (cb->chan js/chrome.tabs.query (clj->js query)))

(defn- exec-script
  [target conf]
  (cb->chan js/chrome.tabs.executeScript target (clj->js conf)))

(defn- show-search-window
  [tab]
  (go
    (let [tabs (<! (get-tabs {:active true :currentWindow true}))
          _ (<! (exec-script nil {:file "js/inpagesearch.js"}))
          win (<! (cb->chan js/chrome.windows.create
                            (clj->js {:url     "search.html"
                                      :top     100
                                      :left    (- js/screen.width 225)
                                      :width   175
                                      :height  (- js/screen.height 200)
                                      :focused true
                                      :type    "detached_panel"})))]
      (loop []
        (let [resp (<! (cb->chan
                         js/chrome.tabs.sendMessage
                         (-> win .-tabs first .-id)
                         (clj->js {:action :configure_select_image_window
                                   :data   {:tabId (.-id tab)}})))]
          (when (and (nil? resp) js/chrome.runtime.lastError)
            (recur)))))))

(defn- show-add-image-popup
  "Display a new window to allow a user to add tags for an image being added
  to the collection"
  [imgsrc]
  (go
    (let [win (<! (cb->chan
                    js/chrome.windows.create
                    (clj->js {:url     "popup_newimage.html"
                              :top     100
                              :left    100
                              :width   (- js/screen.width 200)
                              :height  (- js/screen.height 200)
                              :focused true
                              :type    :detached_panel})))]
      (send-message-retry (-> win .-tabs first .-id)
                          {:action :configure_new_image_window
                           :data {:img {:src imgsrc}}}))))

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
            tabs (<! (get-tabs {:url options-page-url}))]
        (if (empty? tabs)
          (js/chrome.tabs.create (clj->js {:url options-page-url}))
          (js/chrome.tabs.update (-> tabs first .-id) #js {:active true}))))))

; when the hotkey command is executed, show the search window
(js/chrome.commands.onCommand.addListener
  (fn [command]
    (case command
      "show-search" (go (show-search-window
                          (first (<! (get-tabs {:active true
                                                :currentWindow true}))))))))
